import { issueOtp, verifyOtp } from './service.js';

function readRequestBody(req) {
  return req.body ?? req.payload ?? {};
}

function deny(res, status, code, message, details) {
  res.status(status);
  const body = { error: code, message };
  if (details) body.details = details;
  return res.json(body);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_PURPOSES = new Set(['register', 'login-2fa']);
const CODE_RE = /^\d{6}$/;

export default {
  id: 'otp',
  handler(router, context) {
    router.post('/issue', async (req, res) => {
      const body = readRequestBody(req);
      const { email, purpose } = body;

      if (!email || !EMAIL_RE.test(String(email).trim().toLowerCase())) {
        return deny(res, 422, 'invalid_email', 'A valid email address is required.');
      }
      if (!purpose || !ALLOWED_PURPOSES.has(purpose)) {
        return deny(res, 422, 'invalid_purpose', 'OTP purpose is missing or unsupported.');
      }

      try {
        const result = await issueOtp({ ...context, schema: req.schema }, {
          email: String(email).trim().toLowerCase(),
          purpose
        });
        return res.status(200).json({
          data: {
            sent: true,
            expires_in_seconds: result.expires_in_seconds,
            // Returned only in non-production to support local QA. Directus hides
            // debug code in production unless ALLOW_DEBUG_OTP=true.
            ...(result.debug_code ? { debug_code: result.debug_code } : {})
          }
        });
      } catch (error) {
        console.error('[otp:issue] failed:', error.message);
        return deny(res, error.status ?? 500, error.code ?? 'otp_issue_failed', error.message ?? 'Failed to issue OTP.');
      }
    });

    router.post('/verify', async (req, res) => {
      const body = readRequestBody(req);
      const { email, code, purpose } = body;

      if (!email || !EMAIL_RE.test(String(email).trim().toLowerCase())) {
        return deny(res, 422, 'invalid_email', 'A valid email address is required.');
      }
      if (!purpose || !ALLOWED_PURPOSES.has(purpose)) {
        return deny(res, 422, 'invalid_purpose', 'OTP purpose is missing or unsupported.');
      }
      if (!code || !CODE_RE.test(String(code).trim())) {
        return deny(res, 422, 'invalid_code', 'OTP must be 6 digits.');
      }

      try {
        const result = await verifyOtp({ ...context, schema: req.schema }, {
          email: String(email).trim().toLowerCase(),
          code: String(code).trim(),
          purpose
        });
        return res.status(200).json({ data: { verified: true, ...(result.verified_token ? { verified_token: result.verified_token } : {}) } });
      } catch (error) {
        const status = error.status ?? 400;
        return deny(res, status, error.code ?? 'invalid_code', error.message ?? 'OTP could not be verified.');
      }
    });
  }
};
