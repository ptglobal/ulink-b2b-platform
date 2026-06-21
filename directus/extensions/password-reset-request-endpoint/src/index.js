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

// Rate-limit: max 3 failed current_password probes per email per 15 min.
// Lives in a separate namespace from the 5-attempt /reset token guard so
// the two surfaces are independently auditable.
const CURRENT_PWD_FAIL_MAX    = Number(process.env.CURRENT_PASSWORD_FAIL_MAX    ?? 3);
const CURRENT_PWD_FAIL_WINDOW = Number(process.env.CURRENT_PASSWORD_FAIL_WINDOW ?? 900);
const CURRENT_PWD_LOCKOUT_TTL = Number(process.env.CURRENT_PASSWORD_LOCKOUT_TTL ?? 900);

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

/**
 * Record a failed reset attempt against the SHARED bucket
 * (`ulink:password-change:*`) so the same 3-fail / 15-min lockout that
 * guards /change-password also gates /reset. Mirrors the change-password
 * response shape so the frontend can render either a "X lần thử" hint
 * or a 429 lockout banner without a second round-trip.
 *
 * When `email` is null (no peekable token), skip the counter increment
 * and return the original 4xx deny — we don't want unknown tokens to be
 * able to lock arbitrary emails by guessing.
 */
async function recordResetAttempt(email, res, status, code, message) {
  if (!email) return deny(res, status, code, message);

  let nextState = freshCurrentPwdState();
  try {
    nextState = await recordCurrentPwdFailure(email);
  } catch (e) {
    console.error('[password-reset-request] recordCurrentPwdFailure:', e.message);
  }

  if (nextState.locked) {
    return res.status(429).json({
      error: 'too_many_attempts',
      message: 'Too many attempts. Please try again later.',
      payload: { lockedUntil: nextState.lockedUntil, ttlSeconds: nextState.ttlSeconds }
    });
  }
  return res.status(status).json({
    error: code,
    message,
    payload: { remaining: nextState.remaining, attempts: nextState.attempts, locked: false }
  });
}

// ─── Current-password probe rate-limit ───────────────────────────────────────
//
// Anti-brute-force for the change-password current_password check. Lives in
// its own namespace (`ulink:password-change:*`) so the 5-attempt /reset
// guard above is unaffected. Cap is small (3) because the surface
// re-attempts within a single form session.

function currentPwdFailKey(email) { return `ulink:password-change:fail:${email}`; }
function currentPwdLockKey(email) { return `ulink:password-change:lock:${email}`; }

async function isCurrentPwdLocked(email) {
  // Shared 3-fail / 15-min lock with the change-password surface. Used
  // by /send and /reset to gate on the same bucket so an attacker can't
  // bypass a lockout by switching surfaces.
  return (await getRedis().ttl(currentPwdLockKey(email))) > 0;
}

async function getCurrentPwdState(email) {
  const r = getRedis();
  const [failCountRaw, lockTtl] = await Promise.all([
    r.get(currentPwdFailKey(email)),
    r.ttl(currentPwdLockKey(email))
  ]);
  const attempts = Number(failCountRaw ?? 0);
  const locked = lockTtl > 0;
  return {
    attempts,
    remaining: Math.max(0, CURRENT_PWD_FAIL_MAX - attempts),
    locked,
    lockedUntil: locked ? Date.now() + lockTtl * 1000 : null,
    ttlSeconds: locked ? lockTtl : 0
  };
}

async function recordCurrentPwdFailure(email) {
  const r = getRedis();
  const failKey = currentPwdFailKey(email);
  const count = await r.incr(failKey);
  // Only set TTL on first increment — the fail window is sliding only on
  // first miss within an idle period.
  if (count === 1) {
    await r.expire(failKey, CURRENT_PWD_FAIL_WINDOW);
  }
  if (count >= CURRENT_PWD_FAIL_MAX) {
    // Set lock key; the second of two concurrent fails overwrites
    // harmlessly. The lock window starts at the first detection.
    await r.set(currentPwdLockKey(email), '1', 'EX', CURRENT_PWD_LOCKOUT_TTL);
  }
  return getCurrentPwdState(email);
}

async function clearCurrentPwdFailures(email) {
  const r = getRedis();
  await Promise.all([
    r.del(currentPwdFailKey(email)).catch(() => {}),
    r.del(currentPwdLockKey(email)).catch(() => {})
  ]);
}

function freshCurrentPwdState() {
  return {
    attempts: 0,
    remaining: CURRENT_PWD_FAIL_MAX,
    locked: false,
    lockedUntil: null,
    ttlSeconds: 0
  };
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
      const { email, purpose: rawPurpose, redirect_path: rawRedirect } = req.body ?? {};
      const purpose = rawPurpose === 'change' ? 'change' : 'forgot';

      // Where should the link in the email send the user? Default to
      // /reset-password (anonymous-account recovery). For an authenticated
      // "change password" request the caller passes /change-password so the
      // same 3-field form handles both flows.
      //
      // Restrict to a small allowlist so an attacker who controls the
      // `email` field cannot smuggle a phishing URL into the email body.
      const allowedRedirects = ['/reset-password', '/change-password'];
      const redirectPath =
        typeof rawRedirect === 'string' && allowedRedirects.includes(rawRedirect)
          ? rawRedirect
          : '/reset-password';

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

      // Shared 3-fail/15-min lock with the change-password surface. If the
      // caller is locked out from prior reset attempts (or from the change-
      // password current_password probe), refuse to send a new reset email.
      // We still return 200 + { sent: true } to avoid leaking whether the
      // account is locked to an enumeration attacker.
      if (await isCurrentPwdLocked(emailLower)) {
        console.warn(`[password-reset-request] Shared lock active for send — ${emailLower}`);
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

        // Build the reset URL pointing at the chosen target. The allowlist
        // above restricts `redirectPath` to known frontend routes so the
        // email link can never be hijacked to an external host.
        const resetUrl = `${FRONTEND_URL}${redirectPath}?token=${token}`;

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
     * POST /password-reset-request/peek
     *
     * Body: { token }
     *
     * Returns the email + purpose bound to a token WITHOUT consuming it.
     * Used by the frontend's /change-password?token=… flow so the
     * confirm-token route can probe current_password against the right
     * account even when the user has no session (incognito, phone, expired
     * cookie).
     *
     * Response (always 200, never reveals the reason for invalidity):
     *   { data: { valid: true,  email: string, purpose: 'change'|'forgot' } }
     *   { data: { valid: false } }
     *
     * Non-destructive: never writes / deletes / extends the Redis entry.
     * The token remains single-use after /reset, TTL keeps ticking down.
     */
    router.post('/peek', async (req, res) => {
      const { token } = req.body ?? {};
      if (!token || typeof token !== 'string' || token.length < 32) {
        return res.status(200).json({ data: { valid: false } });
      }
      try {
        const raw = await getRedis().get(tokenKey(token));
        if (!raw) return res.status(200).json({ data: { valid: false } });
        let payload;
        try { payload = JSON.parse(raw); }
        catch { return res.status(200).json({ data: { valid: false } }); }
        return res.status(200).json({
          data: {
            valid: true,
            email: payload.email,
            purpose: payload.purpose === 'change' ? 'change' : 'forgot'
          }
        });
      } catch (error) {
        console.error('[password-reset-request] Peek error:', error.message);
        return res.status(200).json({ data: { valid: false } });
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

      // 0a. Validate token shape (cheap, no Redis hit). Any well-formed
      //     attacker-controlled string returns here with peekedEmail=null,
      //     so recordResetAttempt below won't penalise arbitrary emails.
      if (!token || typeof token !== 'string' || token.length < 32) {
        return deny(res, 400, 'invalid_token', 'Reset token is missing or invalid.');
      }

      // 0b. Peek the token to resolve the email BEFORE field validation
      //     so the shared lock is keyed on the right user even when the
      //     supplied password/confirm_password are wrong.
      let peekedEmail = null;
      try {
        const peekedRaw = await getRedis().get(tokenKey(token));
        if (!peekedRaw) {
          return deny(res, 400, 'invalid_token', 'Reset link has expired or already been used. Please request a new one.');
        }
        try {
          peekedEmail = JSON.parse(peekedRaw).email || null;
        } catch {
          await getRedis().del(tokenKey(token)).catch(() => {});
          return deny(res, 400, 'invalid_token', 'Reset link is invalid.');
        }
      } catch (error) {
        console.error('[password-reset-request] Reset peek error:', error.message);
        return deny(res, 400, 'invalid_token', 'Reset link is invalid.');
      }

      // 0c. Shared lock check — same bucket as change-password current_password
      //     probe, so a 3-fail lockout on either surface blocks /reset too.
      if (await isCurrentPwdLocked(peekedEmail)) {
        const lockState = await getCurrentPwdState(peekedEmail).catch(() => freshCurrentPwdState());
        return res.status(429).json({
          error: 'too_many_attempts',
          message: 'Too many attempts. Please try again later.',
          payload: { lockedUntil: lockState.lockedUntil, ttlSeconds: lockState.ttlSeconds }
        });
      }

      // 1. Validate presence of fields.
      if (!password || !confirm_password) {
        return deny(res, 422, 'missing_fields', 'password and confirm_password are required.');
      }
      if (password !== confirm_password) {
        return recordResetAttempt(peekedEmail, res, 422, 'password_mismatch', 'Passwords do not match.');
      }
      if (!PASSWORD_REGEX.test(password)) {
        return recordResetAttempt(peekedEmail, res, 422, 'password_policy', 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.');
      }

      try {
        const redis = getRedis();

        // 2. Re-fetch the token payload. We've already peeked above, so
        //    this just reads it again — cheap, and keeps the single-use
        //    delete-on-failure flow local to this block.
        const raw = await redis.get(tokenKey(token));
        if (!raw) {
          return recordResetAttempt(peekedEmail, res, 400, 'invalid_token', 'Reset link has expired or already been used. Please request a new one.');
        }

        let tokenData;
        try {
          tokenData = JSON.parse(raw);
        } catch {
          await redis.del(tokenKey(token)).catch(() => {});
          return recordResetAttempt(peekedEmail, res, 400, 'invalid_token', 'Reset link is invalid.');
        }

        const { user_id, email } = tokenData;

        // Rate-limit gate: prevent brute-force attacks on valid tokens.
        // Independent from the shared bucket above — both are enforced.
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
          return recordResetAttempt(peekedEmail, res, 400, 'invalid_token', 'User account not found.');
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

        // 7. Clear rate-limit failures on success. Wipe BOTH namespaces:
        //    the original 5-attempt token guard AND the shared
        //    3-attempt change-password bucket, so a legitimate user
        //    who just reset is fully unencumbered.
        await clearResetFailures(email);
        await clearCurrentPwdFailures(email).catch(() => {});

        console.log(`[password-reset-request] Password reset successful for user ${user_id} (${email})`);
        return res.status(200).json({ data: { ok: true } });
      } catch (error) {
        console.error('[password-reset-request] Reset error:', error);
        const status = error.status ?? error.statusCode ?? 500;
        return deny(res, status, error.code ?? 'reset_failed', error.message ?? 'Password reset failed.');
      }
    });

    /**
     * POST /password-change/status
     *
     * Body: { email }
     *
     * Returns the current attempt counter + lockout state for an email so
     * the frontend can render an "attempts left" hint and a live MM:SS
     * countdown without first making a wrong guess.
     *
     * Always 200, with a fresh-state default on any error / invalid email.
     * Never reveals whether the email is registered.
     */
    router.post('/password-change/status', async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      if (!email || !EMAIL_RE.test(email)) {
        return res.status(200).json({ data: freshCurrentPwdState() });
      }
      try {
        return res.status(200).json({ data: await getCurrentPwdState(email) });
      } catch (error) {
        console.error('[password-change] status error:', error.message);
        return res.status(200).json({ data: freshCurrentPwdState() });
      }
    });

    /**
     * POST /password-change/fail
     *
     * Body: { email }
     *
     * Increment the failed current_password counter for the given email
     * and (once it crosses CURRENT_PWD_FAIL_MAX) seed the lock key. Returns
     * the fresh state so the caller can decide what message to show.
     */
    router.post('/password-change/fail', async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      if (!email || !EMAIL_RE.test(email)) {
        return res.status(200).json({ data: freshCurrentPwdState() });
      }
      try {
        return res.status(200).json({ data: await recordCurrentPwdFailure(email) });
      } catch (error) {
        console.error('[password-change] fail error:', error.message);
        return res.status(500).json({ error: 'internal_error', message: 'Could not record failure.' });
      }
    });

    /**
     * POST /password-change/clear
     *
     * Body: { email }
     *
     * Best-effort reset of the counter and lock key for an email. Called
     * by the frontend after a successful change so a legitimate user is
     * not punished for an earlier miss.
     */
    router.post('/password-change/clear', async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      if (!email) {
        return res.status(200).json({ data: { ok: true } });
      }
      try {
        await clearCurrentPwdFailures(email);
      } catch (error) {
        console.error('[password-change] clear error:', error.message);
      }
      return res.status(200).json({ data: { ok: true } });
    });

    /**
     * POST /password-reset-request/user-status
     *
     * Body: { email }
     *
     * Returns whether a user with that email exists and, if so, their
     * `status` (active | suspended | invited | archived | draft).
     *
     * Used by the frontend's /api/auth/login to surface a friendly
     * "your account is locked, please contact the administrator" message
     * for suspended accounts — Directus itself returns a generic 401
     * for both wrong-password and status!='active', and we don't want to
     * conflate the two.
     *
     * On missing/invalid email OR on lookup error we return
     * `{ exists: false }` — same shape as "no such user" — so the caller
     * can fall through to the normal 401 path without leaking which
     * addresses are registered.
     */
    router.post('/user-status', async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      const missing = { data: { exists: false, status: null } };
      if (!email || !EMAIL_RE.test(email)) return res.status(200).json(missing);
      try {
        const { UsersService } = context.services ?? {};
        if (!UsersService) return res.status(200).json(missing);
        const schema = req.schema ?? (await context.getSchema?.()) ?? null;
        const systemUsersService = new UsersService({
          schema,
          accountability: null
        });
        const found = await systemUsersService.readByQuery({
          filter: { email: { _eq: email } },
          limit: 1,
          fields: ['status']
        });
        if (!found.length) return res.status(200).json(missing);
        return res.status(200).json({ data: { exists: true, status: found[0].status } });
      } catch (error) {
        console.error('[password-reset-request] user-status error:', error.message);
        return res.status(200).json(missing);
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
