import { ApiError } from '@/lib/api-error';
import { handleRoute, jsonOk, jsonErrorRaw } from '@/lib/route-helpers';
import { extractSetCookie } from '@/lib/auth-helpers';
import { registerSchema, type RegisterInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export const dynamic = 'force-dynamic';

interface CustomerOnboardingResult {
  data: {
    user_id: string;
    customer_id: string;
    status: string;
  };
}

interface DirectusErrorBody {
  error?: string;
  message?: string;
  errors?: Array<{ message?: string }>;
}

async function directusFetch(path: string, init: RequestInit & { cookieHeader?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  if (init.cookieHeader) headers.set('cookie', init.cookieHeader);
  return fetch(`${DIRECTUS_URL}${path}`, {
    ...init,
    headers,
    body: typeof init.body === 'string' ? init.body : undefined,
    cache: 'no-store'
  });
}

/**
 * POST /api/auth/register
 *
 * Creates a B2B customer account by calling the custom Directus
 * customer-onboarding endpoint, then immediately logs the new user in so the
 * browser has a session cookie.
 *
 * Body (validated by registerSchema):
 *   company_name, contact_name, email, phone, password, confirm_password,
 *   agree, agree_at.
 *
 * OTP verification is currently disabled in the registration flow, so no
 * verified_token is required (and any incoming value is ignored).
 */
export async function POST(req: Request) {
  return handleRoute<RegisterInput>(req, { schema: registerSchema }, async (data) => {
    // 1. Create the account via the customer-onboarding endpoint. The endpoint
    //    is public (no auth header needed) and enforces password policy
    //    server-side.
    const onboardRes = await directusFetch('/customer-onboarding/register', {
      method: 'POST',
      body: JSON.stringify({
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirm_password: data.confirm_password,
        // Forward the consent record so the customer-onboarding endpoint can
        // stamp consented_at on the customer row. The Zod schema guarantees
        // these are present, so a non-null assertion is safe.
        agree: data.agree,
        agree_at: data.agree_at
      })
    });

    if (!onboardRes.ok) {
      let body: DirectusErrorBody | null = null;
      try { body = (await onboardRes.json()) as DirectusErrorBody; } catch { /* not JSON */ }
      const message = body?.message ?? body?.error ?? 'Registration failed.';
      // 409 (email taken) and 422 (validation) are the only "expected" failures.
      if (onboardRes.status === 409) {
        throw new ApiError(409, 'email_taken', 'Email is already registered.');
      }
      throw new ApiError(onboardRes.status, 'register_failed', message);
    }

    let onboard: CustomerOnboardingResult;
    try {
      onboard = (await onboardRes.json()) as CustomerOnboardingResult;
    } catch {
      onboard = { data: { user_id: '', customer_id: '', status: 'active' } };
    }

    // 2. Auto-login so the user lands inside the portal without re-entering
    //    credentials. The cookie is forwarded back to the client.
    const loginRes = await directusFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: data.email, password: data.password, mode: 'session' })
    });

    if (!loginRes.ok) {
      // Account is created but auto-login failed — surface a useful error so
      // the user knows they need to log in manually.
      return jsonErrorRaw(
        200,
        'register_complete_login_required',
        'Account created. Please sign in to continue.'
      );
    }

    const response = jsonOk({
      ok: true,
      data: {
        user_id: onboard.data?.user_id,
        customer_id: onboard.data?.customer_id,
        status: onboard.data?.status ?? 'active'
      }
    }, 201);
    const setCookie = extractSetCookie(loginRes);
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
  });
}