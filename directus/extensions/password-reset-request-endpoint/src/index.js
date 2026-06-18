import crypto from 'node:crypto';
import IORedis from 'ioredis';
import { sendMail } from '../../../lib/smtp.mjs';
import { renderResetLinkEmail } from '../../../lib/email-templates/reset-link.mjs';

// Same regex enforced in frontend validators.ts and other extensions. Keep in sync.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parse TTL value — supports plain seconds (900) or duration strings (15m, 1h). */
function parseTtl(value, fallback) {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isNaN(n) && n > 0) return n;
  const match = String(value).match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) return fallback;
  const num = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
  return num * (multipliers[unit] ?? 1);
}

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || 'redis://localhost:6379';
const RESET_TOKEN_TTL_SECONDS = parseTtl(process.env.PASSWORD_RESET_TOKEN_TTL, 900);
const FRONTEND_URL = process.env.FRONTEND_PUBLIC_URL ?? 'http://localhost:3000';

// Rate-limit: max 3 reset requests per email per 15 minutes.
const SEND_RATE_LIMIT_MAX = Number(process.env.PASSWORD_RESET_SEND_MAX ?? 3);
const SEND_RATE_LIMIT_WINDOW = Number(process.env.PASSWORD_RESET_SEND_WINDOW ?? 900);

// Rate-limit: max 5 failed reset attempts per token per 15 minutes.
const RESET_FAIL_MAX = Number(process.env.PASSWORD_RESET_FAIL_MAX ?? 5);
const RESET_FAIL_WINDOW = Number(process.env.PASSWORD_RESET_FAIL_WINDOW ?? 900);

let redisClient = null;
function getRedis() {
  if (!redisClient) {
    redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });
    redisClient.on('error', (err) => {
      console.error('[password-reset-request] Redis error:', err.message);
    });
  }
  return redisClient;
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function deny(res, status, code, message) {
  res.status(status);
  return res.json({ error: code, message });
}

function tokenKey(token) {
  return `ulink:password-reset:${token}`;
}

function sendRateLimitKey(email) {
  return `ulink:password-reset:send-limit:${email}`;
}

function resetFailKey(email) {
  return `ulink:password-reset:fail:${email}`;
}

async function isSendRateLimited(email) {
  const raw = await getRedis().get(sendRateLimitKey(email));
  return Number(raw ?? 0) >= SEND_RATE_LIMIT_MAX;
}

async function recordSend(email) {
  const key = sendRateLimitKey(email);
  const redis = getRedis();
  const count = await redis.incr(key);
  // Only set TTL on first increment (when count becomes 1).
  if (count === 1) {
    await redis.expire(key, SEND_RATE_LIMIT_WINDOW);
  }
}

async function isResetRateLimited(email) {
  const raw = await getRedis().get(resetFailKey(email));
  return Number(raw ?? 0) >= RESET_FAIL_MAX;
}

async function recordResetFailure(email) {
  const key = resetFailKey(email);
  const redis = getRedis();
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, RESET_FAIL_WINDOW);
  }
}

async function clearResetFailures(email) {
  await getRedis().del(resetFailKey(email)).catch(() => {});
}

export default {
  id: 'password-reset-request',
  handler(router, context) {
    /**
     * POST /password-reset-request/send
     *
     * Body: { email, purpose? }
     *   - purpose: 'forgot' (default) or 'change'
     *
     * Generates a single-use reset token, stores in Redis with 15-min TTL,
     * sends a branded email with the reset link. Always returns 200 to prevent
     * email enumeration.
     */
    router.post('/send', async (req, res) => {
      const { email, purpose: rawPurpose } = req.body ?? {};
      const purpose = rawPurpose === 'change' ? 'change' : 'forgot';

      // Basic validation — still return 200 to avoid enumeration.
      if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
        return res.status(200).json({ data: { sent: true } });
      }

      const emailLower = normalizeEmail(email);

      // Rate-limit sending to prevent flooding.
      if (await isSendRateLimited(emailLower)) {
        // Still return 200 — don't reveal rate limiting externally.
        console.warn(`[password-reset-request] Send rate-limited for ${emailLower}`);
        return res.status(200).json({ data: { sent: true } });
      }

      try {
        const { UsersService } = context.services ?? {};
        if (!UsersService) {
          throw new Error('Directus service classes are unavailable.');
        }

        const schema = req.schema ?? (await context.getSchema?.()) ?? null;
        const systemUsersService = new UsersService({ schema, accountability: null });

        // Look up the user by email.
        const found = await systemUsersService.readByQuery({
          filter: { email: { _eq: emailLower } },
          limit: 1,
          fields: ['id', 'first_name', 'last_name', 'email', 'status']
        });

        if (found.length === 0) {
          // User doesn't exist — silently succeed to prevent enumeration.
          await recordSend(emailLower);
          return res.status(200).json({ data: { sent: true } });
        }

        const user = found[0];

        // Generate a cryptographically secure reset token.
        const token = crypto.randomBytes(32).toString('hex');
        const redis = getRedis();

        // Store in Redis: key → JSON payload with user info.
        const payload = JSON.stringify({
          user_id: user.id,
          email: emailLower,
          purpose,
          issued_at: new Date().toISOString()
        });
        await redis.set(tokenKey(token), payload, 'EX', RESET_TOKEN_TTL_SECONDS);

        // Build the reset URL that points to the frontend reset-password page.
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

        // Build and send the branded email.
        const contactName = [user.first_name, user.last_name].filter(Boolean).join(' ') || null;
        const ttlMinutes = Math.floor(RESET_TOKEN_TTL_SECONDS / 60);

        const mail = buildResetMail({ purpose, contactName, resetUrl, ttlMinutes, to: emailLower });
        await sendMail(mail);

        await recordSend(emailLower);
        console.log(`[password-reset-request] Reset email sent to ${emailLower} (purpose=${purpose})`);
        return res.status(200).json({ data: { sent: true } });
      } catch (error) {
        // Log but don't expose — always return success to prevent enumeration.
        console.error('[password-reset-request] Send error:', error.message);
        return res.status(200).json({ data: { sent: true } });
      }
    });

    /**
     * POST /password-reset-request/reset
     *
     * Body: { token, password, confirm_password }
     *
     * Validates the token from Redis (single-use, 15-min TTL), updates the
     * user's password, clears all sessions (AC04), and deletes the token.
     */
    router.post('/reset', async (req, res) => {
      const { token, password, confirm_password } = req.body ?? {};

      // 1. Validate presence of fields.
      if (!token || typeof token !== 'string' || token.length < 32) {
        return deny(res, 400, 'invalid_token', 'Reset token is missing or invalid.');
      }
      if (!password || !confirm_password) {
        return deny(res, 422, 'missing_fields', 'password and confirm_password are required.');
      }
      if (password !== confirm_password) {
        return deny(res, 422, 'password_mismatch', 'Passwords do not match.');
      }
      if (!PASSWORD_REGEX.test(password)) {
        return deny(res, 422, 'password_policy', 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.');
      }

      try {
        const redis = getRedis();

        // 2. Look up the token in Redis.
        const raw = await redis.get(tokenKey(token));
        if (!raw) {
          return deny(res, 400, 'invalid_token', 'Reset link has expired or already been used. Please request a new one.');
        }

        let tokenData;
        try {
          tokenData = JSON.parse(raw);
        } catch {
          await redis.del(tokenKey(token)).catch(() => {});
          return deny(res, 400, 'invalid_token', 'Reset link is invalid.');
        }

        const { user_id, email } = tokenData;

        // Rate-limit gate: prevent brute-force attacks on valid tokens.
        if (await isResetRateLimited(email)) {
          return deny(res, 429, 'rate_limited', 'Too many attempts. Please try again later.');
        }

        // 3. Resolve user and verify they still exist.
        const { UsersService, SessionsService } = context.services ?? {};
        if (!UsersService) {
          throw new Error('Directus service classes are unavailable.');
        }

        const schema = req.schema ?? (await context.getSchema?.()) ?? null;
        const systemUsersService = new UsersService({ schema, accountability: null });

        const found = await systemUsersService.readByQuery({
          filter: { id: { _eq: user_id } },
          limit: 1,
          fields: ['id', 'email', 'status']
        });

        if (found.length === 0) {
          await redis.del(tokenKey(token)).catch(() => {});
          return deny(res, 400, 'invalid_token', 'User account not found.');
        }

        // 4. Update the user's password.
        await systemUsersService.updateOne(user_id, { password });

        // 5. AC04 — Clear all sessions for this user.
        try {
          await systemUsersService.updateOne(user_id, { sessions: [] });
        } catch (err) {
          // Fallback: delete sessions manually via SessionsService.
          if (SessionsService) {
            try {
              const schema2 = req.schema ?? (await context.getSchema?.()) ?? null;
              const sessionsService = new SessionsService({ schema: schema2, accountability: null });
              const userSessions = await sessionsService.readByQuery({
                filter: { user: { _eq: user_id } },
                fields: ['token']
              });
              for (const s of userSessions) {
                await sessionsService.deleteOne(s.token).catch(() => {});
              }
            } catch (inner) {
              console.warn(`[password-reset-request] Could not clear sessions for user ${user_id}: ${inner.message}`);
            }
          } else {
            console.warn(`[password-reset-request] Sessions clear skipped for user ${user_id}: ${err.message}`);
          }
        }

        // 6. Consume the token — single-use.
        await redis.del(tokenKey(token)).catch(() => {});

        // 7. Clear rate-limit failures on success.
        await clearResetFailures(email);

        console.log(`[password-reset-request] Password reset successful for user ${user_id} (${email})`);
        return res.status(200).json({ data: { ok: true } });
      } catch (error) {
        console.error('[password-reset-request] Reset error:', error);
        const status = error.status ?? error.statusCode ?? 500;
        return deny(res, status, error.code ?? 'reset_failed', error.message ?? 'Password reset failed.');
      }
    });
  }
};

function buildResetMail({ purpose, contactName, resetUrl, ttlMinutes, to }) {
  const subjects = {
    forgot: '[ULINK] Đặt lại mật khẩu của bạn',
    change: '[ULINK] Xác nhận thay đổi mật khẩu'
  };
  const subject = subjects[purpose] ?? subjects.forgot;

  const html = renderResetLinkEmail({ purpose, contactName, resetUrl, ttlMinutes });

  const textBodies = {
    forgot: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản ULINK của bạn.',
    change: 'Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản ULINK của bạn.'
  };
  const textBody = textBodies[purpose] ?? textBodies.forgot;

  const text =
    `${contactName ? `Chào ${contactName},\n\n` : 'Chào bạn,\n\n'}` +
    `${textBody}\n\n` +
    `Nhấn vào liên kết sau để đặt mật khẩu mới:\n${resetUrl}\n\n` +
    `Liên kết có hiệu lực trong ${ttlMinutes} phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n` +
    `Trân trọng,\nĐội ngũ ULINK INDUSTRIES.`;

  return {
    from: process.env.MAIL_FROM ?? 'ULINK <no-reply@ulink.com>',
    to,
    subject,
    text,
    html
  };
}
