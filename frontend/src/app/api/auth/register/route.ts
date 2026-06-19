import { ApiError } from '@/lib/api-error';
import { handleRoute, jsonOk } from '@/lib/route-helpers';
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
 * customer-onboarding endpoint. Does NOT auto-login: the user is redirected
 * to /login so they sign in explicitly with the credentials they just chose.
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

    // 2. Account created — return 201 with no session cookie. The frontend
    //    redirects to /login so the user signs in explicitly.
    return jsonOk({
      ok: true,
      data: {
        user_id: onboard.data?.user_id,
        customer_id: onboard.data?.customer_id,
        status: onboard.data?.status ?? 'active'
      }
    }, 201);
  });
}