import crypto from 'node:crypto';
import IORedis from 'ioredis';
import { sendMail } from '../../../lib/smtp.mjs';
import { VERIFIED_TOKEN_PREFIX } from '../../../lib/constants.mjs';
import { renderOtpEmail } from '../../../lib/email-templates/otp.mjs';

// OTP storage is intentionally external to Directus: it lives in Redis (the same
// Redis instance used by the rest of the stack). Storing OTPs in a dedicated
// key/value store (a) avoids polluting any Directus collection with transient
// secret material, (b) makes TTL-based expiry automatic, and (c) keeps the
// implementation identical between runtime environments.
//
// Custom endpoint extensions do not receive Directus's internal Redis client
// via the `context` object, so we instantiate our own ioredis connection. The
// client is shared across invocations via a module-level singleton.

const OTP_TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS ?? 600); // 10 minutes default
const VERIFIED_TOKEN_TTL_SECONDS = Number(process.env.VERIFIED_TOKEN_TTL_SECONDS ?? 900); // 15 minutes default
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60);
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || 'redis://localhost:6379';

const OTP_PURPOSES = {
  register: '[ULINK] Mã xác nhận đăng ký tài khoản',
  'login-2fa': '[ULINK] Mã xác nhận đăng nhập'
};

const PURPOSE_BODY = {
  register: 'Cảm ơn bạn đã đăng ký tài khoản ULINK. Vui lòng nhập mã bên dưới để xác nhận email:',
  'login-2fa': 'Để hoàn tất đăng nhập, vui lòng nhập mã xác nhận bên dưới:'
};

let redisClient = null;

function getRedis() {
  if (!redisClient) {
    redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });
    redisClient.on('error', (err) => {
      console.error('[otp] Redis error:', err.message);
    });
  }
  return redisClient;
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function buildOtpKey(email, purpose) {
  return `ulink:otp:${purpose}:${email}`;
}

function buildVerifiedKey(email, purpose) {
  return `ulink:otp:verified:${purpose}:${email}`;
}

function buildCooldownKey(email, purpose) {
  return `ulink:otp:cooldown:${purpose}:${email}`;
}

function generateCode() {
  // 6-digit zero-padded numeric code, e.g. "042917".
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, '0');
}

function buildMail({ purpose, code, contactName, to }) {
  const subject = OTP_PURPOSES[purpose] ?? '[ULINK] Mã xác nhận';
  const ttlMinutes = Math.floor(OTP_TTL_SECONDS / 60);
  const html = renderOtpEmail({ purpose, code, ttlMinutes, contactName });
  return {
    from: process.env.MAIL_FROM ?? 'ULINK <no-reply@ulink.com>',
    to,
    subject,
    text:
      `${contactName ? `Chào ${contactName},\n\n` : ''}` +
      `${PURPOSE_BODY[purpose] ?? 'Mã xác nhận của bạn:'}\n\n` +
      `    ${code}\n\n` +
      `Mã có hiệu lực trong ${ttlMinutes} phút. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.\n\n` +
      `Trân trọng,\nĐội ngũ ULINK INDUSTRIES.`,
    html
  };
}

export async function issueOtp(context, input) {
  const email = normalizeEmail(input.email);
  const purpose = String(input.purpose);
  const redis = getRedis();

  if (!redis) {
    const error = new Error('Redis is required for OTP issuance. Set REDIS_URL in the Directus environment.');
    error.status = 500;
    error.code = 'redis_unavailable';
    throw error;
  }

  // Cooldown: prevent OTP flooding against a single address/purpose.
  const cooldownKey = buildCooldownKey(email, purpose);
  const cooldown = await redis.get(cooldownKey);
  if (cooldown) {
    const error = new Error('Vui lòng đợi một chút trước khi yêu cầu mã mới.');
    error.status = 429;
    error.code = 'cooldown';
    throw error;
  }

  const code = generateCode();
  const key = buildOtpKey(email, purpose);
  const payload = JSON.stringify({
    code,
    attempts: 0,
    issued_at: new Date().toISOString()
  });
  await redis.set(key, payload, 'EX', OTP_TTL_SECONDS);
  await redis.set(cooldownKey, '1', 'EX', OTP_RESEND_COOLDOWN_SECONDS);

  try {
    await sendMail(buildMail({ purpose, code, to: email }));
  } catch (error) {
    // Best-effort: if SMTP fails, delete the key so the user can retry
    // immediately rather than being stuck behind a cooldown.
    await redis.del(key).catch(() => {});
    await redis.del(cooldownKey).catch(() => {});
    throw error;
  }

  const debugCode = process.env.ALLOW_DEBUG_OTP === 'true' ? code : null;
  return { expires_in_seconds: OTP_TTL_SECONDS, debug_code: debugCode };
}

export async function verifyOtp(context, input) {
  const email = normalizeEmail(input.email);
  const purpose = String(input.purpose);
  const code = String(input.code).trim();
  const redis = getRedis();

  if (!redis) {
    const error = new Error('Redis is required for OTP verification.');
    error.status = 500;
    error.code = 'redis_unavailable';
    throw error;
  }

  const key = buildOtpKey(email, purpose);
  const raw = await redis.get(key);
  if (!raw) {
    const error = new Error('Mã xác nhận đã hết hạn hoặc không tồn tại.');
    error.status = 400;
    error.code = 'otp_expired';
    throw error;
  }

  let record;
  try {
    record = JSON.parse(raw);
  } catch {
    record = { code: raw, attempts: 0 };
  }

  if ((record.attempts ?? 0) >= OTP_MAX_ATTEMPTS) {
    await redis.del(key).catch(() => {});
    const error = new Error('Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.');
    error.status = 429;
    error.code = 'too_many_attempts';
    throw error;
  }

  // Constant-time comparison to avoid timing attacks on the code.
  const expected = Buffer.from(String(record.code ?? ''), 'utf8');
  const provided = Buffer.from(code, 'utf8');
  const match =
    expected.length === provided.length &&
    crypto.timingSafeEqual(expected, provided);

  if (!match) {
    record.attempts = (record.attempts ?? 0) + 1;
    const remainingTtl = await redis.ttl(key);
    const ttl = remainingTtl > 0 ? remainingTtl : OTP_TTL_SECONDS;
    await redis.set(key, JSON.stringify(record), 'EX', ttl);
    const error = new Error('Mã xác nhận không đúng.');
    error.status = 400;
    error.code = 'invalid_code';
    throw error;
  }

  // Mark the email as verified for this purpose. The verified token can be
  // passed back to subsequent calls (register/reset) to short-circuit re-entry
  // of the same OTP. TTL is decoupled from the OTP code TTL so it can be set
  // independently (e.g. 15 min to align with the Directus reset-link window).
  const verifiedToken = `${VERIFIED_TOKEN_PREFIX}${crypto.randomBytes(24).toString('hex')}`;
  const verifiedKey = buildVerifiedKey(email, purpose);
  await redis.set(verifiedKey, verifiedToken, 'EX', VERIFIED_TOKEN_TTL_SECONDS);
  await redis.del(key).catch(() => {});

  return { verified_token: verifiedToken };
}

// Helper used by other custom endpoints to confirm a code was previously
// verified. We expose it on the extension module so it can be consumed
// via `context.services?.OtpService` (when wired up in the app shell) or
// imported directly by sibling extensions.
export async function consumeVerifiedToken({ email, purpose }) {
  const redis = getRedis();
  const verifiedKey = buildVerifiedKey(normalizeEmail(email), purpose);
  const token = await redis.get(verifiedKey);
  await redis.del(verifiedKey).catch(() => {});
  return token;
}
