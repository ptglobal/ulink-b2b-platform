import { setTimeout as sleep } from 'node:timers/promises';
import { sendMail } from './smtp.mjs';

export type RfqMailMessage = {
  to: string;
  subject: string;
  text: string;
  from?: string;
};

export async function sendRfqSummaryEmail(
  message: RfqMailMessage,
  env = process.env,
  send = sendMail
): Promise<void> {
  const attempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await send(
        {
          from: message.from ?? env.MAIL_FROM ?? 'ULINK <no-reply@ulink.com>',
          to: message.to,
          subject: message.subject,
          text: message.text
        },
        env
      );
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(100 * attempt);
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to send RFQ summary email.');
}
