import { ApiError } from '@/lib/api-error';
import { handleRoute, jsonOk, jsonErrorRaw } from '@/lib/route-helpers';
import { otpIssueSchema, otpVerifySchema } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

interface OtpServiceResponse {
  data: {
    sent?: boolean;
    expires_in_seconds?: number;
    debug_code?: string;
    verified?: boolean;
    verified_token?: string;
  };
}

interface DirectusErrorBody {
  error?: string;
  message?: string;
}

/**
 * POST /api/auth/verify-otp
 *
 * Two operations:
 *   - issue:  body = { email, purpose, op: 'issue' }
 *   - verify: body = { email, code, purpose }
 *
 * Forwards to the custom Directus OTP endpoint and normalizes the response
 * shape so callers don't need to know about Directus internals.
 */
export async function POST(req: Request) {
  let raw: unknown = {};
  try {
    raw = await req.json();
  } catch {
    return jsonErrorRaw(400, 'invalid_json', 'Request body must be valid JSON');
  }

  const op = typeof raw === 'object' && raw !== null && 'op' in raw ? String((raw as { op: unknown }).op) : 'verify';

  try {
    if (op === 'issue') {
      const parsed = otpIssueSchema.safeParse(raw);
      if (!parsed.success) {
        return jsonErrorRaw(422, 'validation_error', 'Invalid OTP request.', {
          ...Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.') || '_root', [i.message]]))
        });
      }
      const data = parsed.data;
      const res = await fetch(`${DIRECTUS_URL}/otp/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, purpose: data.purpose }),
        cache: 'no-store'
      });
      if (!res.ok) {
        let body: DirectusErrorBody | null = null;
        try { body = (await res.json()) as DirectusErrorBody; } catch { /* not JSON */ }
        if (res.status === 429) {
          return jsonErrorRaw(429, 'cooldown', body?.message ?? 'Please wait before requesting another code.');
        }
        return jsonErrorRaw(res.status, 'otp_issue_failed', body?.message ?? body?.error ?? 'Failed to send OTP.');
      }
      const body = (await res.json()) as OtpServiceResponse;
      return jsonOk({
        data: {
          sent: body.data.sent ?? true,
          expires_in_seconds: body.data.expires_in_seconds ?? 600,
          ...(body.data.debug_code ? { debug_code: body.data.debug_code } : {})
        }
      });
    }

    // Default: verify.
    const parsed = otpVerifySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonErrorRaw(422, 'validation_error', 'Invalid OTP submission.', {
        ...Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.') || '_root', [i.message]]))
      });
    }
    const data = parsed.data;
    const res = await fetch(`${DIRECTUS_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, code: data.code, purpose: data.purpose }),
      cache: 'no-store'
    });
    if (!res.ok) {
      let body: DirectusErrorBody | null = null;
      try { body = (await res.json()) as DirectusErrorBody; } catch { /* not JSON */ }
      const code = body?.error ?? 'invalid_code';
      return jsonErrorRaw(res.status, code, body?.message ?? 'OTP could not be verified.');
    }
    const body = (await res.json()) as OtpServiceResponse;
    return jsonOk({
      data: {
        verified: body.data.verified ?? true,
        ...(body.data.verified_token ? { verified_token: body.data.verified_token } : {})
      }
    });
  } catch (err) {
    console.error('[verify-otp] unhandled error', err);
    return jsonErrorRaw(500, 'internal_error', 'Unexpected error handling OTP request.');
  }
}