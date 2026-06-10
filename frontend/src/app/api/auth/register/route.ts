import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { registerSchema, type RegisterInput } from '@/lib/validators';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export async function POST(req: Request) {
  return handleRoute<RegisterInput>(req, { schema: registerSchema }, async (data) => {
    const res = await fetch(`${DIRECTUS_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        first_name: data.contact,
        phone: data.phone
      })
    });

    if (!res.ok) {
      const { ApiError } = await import('@/lib/api-error');
      throw new ApiError(422, 'register_failed', 'Registration failed');
    }

    return jsonOk({ ok: true }, 201);
  });
}
