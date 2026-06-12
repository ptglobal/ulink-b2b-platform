import net from 'node:net';
import tls from 'node:tls';
import { once } from 'node:events';

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractEnvelopeAddress(value) {
  const input = String(value ?? '').trim();
  const match = input.match(/<([^>]+)>/);
  return (match?.[1] ?? input).trim();
}

function encodeMimeWord(value) {
  return `=?UTF-8?B?${Buffer.from(String(value), 'utf8').toString('base64')}?=`;
}

function dotStuff(value) {
  return String(value ?? '').replace(/^\./gm, '..');
}

function createLineReader(socket) {
  let buffer = '';
  const pending = [];
  const lines = [];
  let terminalError = null;

  function pushLine(line) {
    if (pending.length > 0) {
      pending.shift().resolve(line);
      return;
    }

    lines.push(line);
  }

  socket.on('data', (chunk) => {
    buffer += chunk.toString('utf8');

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex >= 0) {
      const rawLine = buffer.slice(0, newlineIndex + 1);
      buffer = buffer.slice(newlineIndex + 1);
      const line = rawLine.replace(/\r?\n$/, '');
      pushLine(line);
      newlineIndex = buffer.indexOf('\n');
    }
  });

  socket.on('error', (error) => {
    terminalError = error;
    while (pending.length > 0) {
      pending.shift().reject(error);
    }
  });

  socket.on('close', () => {
    if (!terminalError) {
      terminalError = new Error('SMTP socket closed unexpectedly.');
    }

    while (pending.length > 0) {
      pending.shift().reject(terminalError);
    }
  });

  return async function readLine() {
    if (terminalError) {
      throw terminalError;
    }

    if (lines.length > 0) {
      return lines.shift();
    }

    return new Promise((resolve, reject) => {
      pending.push({ resolve, reject });
    });
  };
}

async function readResponse(readLine) {
  const lines = [];
  let code = null;

  while (true) {
    const line = await readLine();
    if (!line) {
      throw new Error('SMTP server returned an empty response.');
    }

    if (code === null) {
      code = Number(line.slice(0, 3));
    }

    lines.push(line);

    if (line.length >= 4 && line[3] === ' ') {
      break;
    }
  }

  return {
    code,
    lines,
    text: lines.join('\n')
  };
}

function sendCommand(socket, command) {
  socket.write(`${command}\r\n`);
}

async function openConnection({ host, port, secure }) {
  const socket = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
  socket.setEncoding('utf8');

  if (secure) {
    await once(socket, 'secureConnect');
  } else {
    await once(socket, 'connect');
  }

  const readLine = createLineReader(socket);
  const greeting = await readResponse(readLine);
  if (greeting.code !== 220) {
    throw new Error(`SMTP greeting failed: ${greeting.text}`);
  }

  return { socket, readLine };
}

async function ehlo(socket, readLine) {
  sendCommand(socket, 'EHLO localhost');
  return readResponse(readLine);
}

async function maybeUpgradeToTls(socket, readLine, host) {
  sendCommand(socket, 'STARTTLS');
  const response = await readResponse(readLine);
  if (response.code !== 220) {
    throw new Error(`SMTP STARTTLS failed: ${response.text}`);
  }

  const upgraded = tls.connect({ socket, servername: host });
  upgraded.setEncoding('utf8');
  await once(upgraded, 'secureConnect');
  return { socket: upgraded, readLine: createLineReader(upgraded) };
}

async function authenticate(socket, readLine, user, password) {
  if (!user) {
    return;
  }

  const plainToken = Buffer.from(`\u0000${user}\u0000${password ?? ''}`, 'utf8').toString('base64');

  sendCommand(socket, `AUTH PLAIN ${plainToken}`);
  let response = await readResponse(readLine);
  if (response.code === 235) {
    return;
  }

  if (![334, 504, 535, 538].includes(response.code)) {
    throw new Error(`SMTP authentication failed: ${response.text}`);
  }

  sendCommand(socket, 'AUTH LOGIN');
  response = await readResponse(readLine);
  if (response.code !== 334) {
    throw new Error(`SMTP AUTH LOGIN failed: ${response.text}`);
  }

  sendCommand(socket, Buffer.from(user, 'utf8').toString('base64'));
  response = await readResponse(readLine);
  if (response.code !== 334) {
    throw new Error(`SMTP AUTH LOGIN username rejected: ${response.text}`);
  }

  sendCommand(socket, Buffer.from(password ?? '', 'utf8').toString('base64'));
  response = await readResponse(readLine);
  if (response.code !== 235) {
    throw new Error(`SMTP AUTH LOGIN password rejected: ${response.text}`);
  }
}

function buildMessage({ from, to, subject, text }) {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeMimeWord(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    dotStuff(text),
    ''
  ];

  return `${headers.join('\r\n')}\r\n.\r\n`;
}

export function readMailConfig(env = process.env) {
  return {
    host: env.MAIL_HOST ?? 'mailpit',
    port: toNumber(env.MAIL_PORT, 1025),
    secure: toBoolean(env.MAIL_SECURE, false),
    user: env.MAIL_USER ?? '',
    password: env.MAIL_PASSWORD ?? '',
    from: env.MAIL_FROM ?? 'ULINK <no-reply@ulink.com>'
  };
}

export async function sendMail(message, env = process.env) {
  const config = readMailConfig(env);
  const from = String(message.from ?? config.from).trim();
  const to = String(message.to ?? '').trim();
  const subject = String(message.subject ?? '').trim();
  const text = String(message.text ?? '');

  if (!from || !to || !subject) {
    throw new Error('SMTP mail requires from, to, and subject.');
  }

  const envelopeFrom = extractEnvelopeAddress(from);
  const envelopeTo = extractEnvelopeAddress(to);
  let connection = await openConnection(config);

  try {
    let response = await ehlo(connection.socket, connection.readLine);
    if (!config.secure && response.text.includes('STARTTLS')) {
      connection = await maybeUpgradeToTls(connection.socket, connection.readLine, config.host);
      response = await ehlo(connection.socket, connection.readLine);
    }

    await authenticate(connection.socket, connection.readLine, config.user, config.password);

    sendCommand(connection.socket, `MAIL FROM:<${envelopeFrom}>`);
    response = await readResponse(connection.readLine);
    if (![250, 251].includes(response.code)) {
      throw new Error(`SMTP MAIL FROM failed: ${response.text}`);
    }

    sendCommand(connection.socket, `RCPT TO:<${envelopeTo}>`);
    response = await readResponse(connection.readLine);
    if (![250, 251].includes(response.code)) {
      throw new Error(`SMTP RCPT TO failed: ${response.text}`);
    }

    sendCommand(connection.socket, 'DATA');
    response = await readResponse(connection.readLine);
    if (response.code !== 354) {
      throw new Error(`SMTP DATA failed: ${response.text}`);
    }

    connection.socket.write(buildMessage({ from, to, subject, text }));
    response = await readResponse(connection.readLine);
    if (response.code !== 250) {
      throw new Error(`SMTP message body rejected: ${response.text}`);
    }

    sendCommand(connection.socket, 'QUIT');
    await readResponse(connection.readLine).catch(() => {});
  } finally {
    connection.socket.destroy();
  }
}
