import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { loginSchema, type LoginInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export async function POST(req: Request) {
  return handleRoute<LoginInput>(req, { schema: loginSchema }, async (data) => {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password, mode: 'session' })
    });

    if (!res.ok) {
      const { ApiError } = await import('@/lib/api-error');
      throw new ApiError(401, 'invalid_credentials', 'Email or password is incorrect');
    }

    // Forward Directus session cookie to client
    const setCookie = res.headers.get('set-cookie');
    const response = jsonOk({ ok: true });
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  });
}
