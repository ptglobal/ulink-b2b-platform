import { jsonErrorRaw } from '@/lib/route-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/verify-otp
 *
 * DEPRECATED — OTP-based email verification is currently disabled for the
 * registration flow. New accounts are created directly on submit without an
 * intermediate code. This endpoint is kept in place so any stale client code
 * gets a clear "gone" signal instead of a generic 404 / 500.
 *
 * The Directus OTP extension is still deployed and the underlying code is
 * preserved so the flow can be re-enabled later by reverting this handler
 * and re-introducing the OTP step in the registration form.
 */
export async function POST() {
  return jsonErrorRaw(
    410,
    'otp_disabled',
    'OTP verification is currently disabled. Please complete the registration form directly.'
  );
}

export async function GET() {
  // Some callers probe with GET — return the same 410 so it shows up
  // clearly in logs rather than silently 405-ing.
  return jsonErrorRaw(
    410,
    'otp_disabled',
    'OTP verification is currently disabled. Please complete the registration form directly.'
  );
}
