import IORedis from 'ioredis';

// Same regex enforced in src/lib/validators.ts and customer-onboarding-endpoint
// service.js. Keep in sync.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFIED_TOKEN_PREFIX = 'vt_';
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || 'redis://localhost:6379';

// Fixed-window per-email rate limit on failed password-change attempts.
// AC #29: 3 fails / 15 min. Counter resets on successful change.
const RATE_LIMIT_MAX = Number(process.env.PASSWORD_CHANGE_FAIL_MAX ?? 3);
const RATE_LIMIT_WINDOW_SECONDS = Number(process.env.PASSWORD_CHANGE_FAIL_WINDOW ?? 900);

function rateLimitKey(email) {
  return `ulink:pwreset:fail:${email}`;
}

/**
 * Returns the post-increment count of failed attempts for `email` in the
 * current window. Atomic via ioredis pipeline (single round-trip).
 * Requires Redis ≥ 7 for the EXPIRE NX flag.
 */
async function recordFailure(email) {
  const key = rateLimitKey(email);
  const result = await getRedis()
    .multi()
    .incr(key)
    .expire(key, RATE_LIMIT_WINDOW_SECONDS, 'NX')
    .exec();
  const entry = Array.isArray(result) ? result[0] : null;
  const count = Array.isArray(entry) ? entry[1] : 0;
  return Number(count) || 0;
}

async function isRateLimited(email) {
  const raw = await getRedis().get(rateLimitKey(email));
  return Number(raw ?? 0) >= RATE_LIMIT_MAX;
}

async function clearRateLimit(email) {
  await getRedis().del(rateLimitKey(email)).catch(() => {});
}

let redisClient = null;
function getRedis() {
  if (!redisClient) {
    redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });
    redisClient.on('error', (err) => {
      console.error('[password-change] Redis error:', err.message);
    });
  }
  return redisClient;
}

function deny(res, status, code, message) {
  res.status(status);
  return res.json({ error: code, message });
}

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

/**
 * Look up the verified_key that the otp-endpoint wrote for `email + purpose=change`.
 * Returns the verified_token stored value if present, otherwise null. The
 * otp-endpoint stores entries under `ulink:otp:verified:{purpose}:{email}` and
 * deletes the key on consumption — we mirror that key shape here so the
 * "change" purpose flow works without changes to the otp-endpoint module.
 */
async function consumeVerifiedToken({ email, purpose }) {
  const redis = getRedis();
  const verifiedKey = `ulink:otp:verified:${purpose}:${email}`;
  const token = await redis.get(verifiedKey);
  await redis.del(verifiedKey).catch(() => {});
  return token;
}

export default {
  id: 'password-change',
  handler(router, context) {
    router.post('/change', async (req, res) => {
      const { email, verified_token, new_password, confirm_password } = req.body ?? {};

      // 1. Validate presence of fields
      if (!email || !EMAIL_RE.test(normalizeEmail(email))) {
        return deny(res, 422, 'invalid_email', 'A valid email is required.');
      }
      const emailLower = normalizeEmail(email);

      // Rate-limit gate (AC #29): 3 fails / 15 min per email. Run before any
      // work that depends on Redis state so an exhausted budget cannot be used
      // to probe verified_token validity.
      if (await isRateLimited(emailLower)) {
        return deny(res, 429, 'rate_limited', 'Too many attempts. Try again later.');
      }

      if (!verified_token || !verified_token.startsWith(VERIFIED_TOKEN_PREFIX)) {
        await recordFailure(emailLower);
        return deny(res, 401, 'unverified', 'Email verification is required to change the password.');
      }
      if (!new_password || !confirm_password) {
        await recordFailure(emailLower);
        return deny(res, 422, 'missing_fields', 'new_password and confirm_password are required.');
      }
      if (new_password !== confirm_password) {
        await recordFailure(emailLower);
        return deny(res, 422, 'password_mismatch', 'New passwords do not match.');
      }
      if (!PASSWORD_REGEX.test(new_password)) {
        await recordFailure(emailLower);
        return deny(res, 422, 'password_policy', 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.');
      }

      try {
        const redis = getRedis();
        const verifiedKey = `ulink:otp:verified:change:${emailLower}`;
        const storedToken = await redis.get(verifiedKey);
        if (!storedToken || storedToken !== verified_token) {
          await recordFailure(emailLower);
          return deny(res, 401, 'invalid_or_expired_token', 'Verification has expired. Please request a new code and try again.');
        }

        const { UsersService, SessionsService } = context.services ?? {};
        if (!UsersService) {
          throw new Error('Directus service classes are unavailable.');
        }

        const schema = req.schema ?? (await context.getSchema?.()) ?? null;

        // 3. Resolve the user by email.
        const systemUsersService = new UsersService({ schema, accountability: null });
        const found = await systemUsersService.readByQuery({
          filter: { email: { _eq: emailLower } },
          limit: 1,
          fields: ['id', 'email', 'status']
        });
        if (found.length === 0) {
          // Generic message — don't leak which emails are registered.
          await recordFailure(emailLower);
          return deny(res, 400, 'change_failed', 'Unable to change password. Please try again.');
        }

        const userId = found[0].id;

        // 4. Update password with system accountability.
        await systemUsersService.updateOne(userId, { password: new_password });

        // 5. AC04 — log the user out of every other active session by clearing
        // the user.sessions relation. The current request did not have a
        // session (it's a public endpoint hit from the frontend with the user's
        // own verified_token), so clearing this list will sign the user out
        // everywhere else on next refresh.
        try {
          await systemUsersService.updateOne(userId, { sessions: [] });
        } catch (err) {
          // SessionsService might not be wired into UsersService update payload
          // in some Directus versions — that's acceptable, log and continue.
          if (SessionsService) {
            try {
              const schema2 = req.schema ?? (await context.getSchema?.()) ?? null;
              const sessionsService = new SessionsService({ schema: schema2, accountability: null });
              const userSessions = await sessionsService.readByQuery({
                filter: { user: { _eq: userId } },
                fields: ['token']
              });
              for (const s of userSessions) {
                await sessionsService.deleteOne(s.token).catch(() => {});
              }
            } catch (inner) {
              console.warn(`[password-change] Could not clear sessions for user ${userId}: ${inner.message}`);
            }
          } else {
            console.warn(`[password-change] sessions clear skipped for user ${userId}: ${err.message}`);
          }
        }

        // 6. Consume the verified_token so it cannot be reused.
        await redis.del(verifiedKey).catch(() => {});

        // 7. Successful change — clear any accumulated rate-limit failures so a
        // legitimate user isn't penalized if they had a couple of typos earlier.
        await clearRateLimit(emailLower);

        console.log(`[password-change] Password updated for user ${userId} via email-link verification.`);
        return res.status(200).json({ data: { ok: true } });
      } catch (error) {
        console.error('[password-change] Error:', error);
        const status = error.status ?? error.statusCode ?? 500;
        return deny(res, status, error.code ?? 'change_failed', error.message ?? 'Password change failed.');
      }
    });
  }
};