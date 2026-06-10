import { jsonOk } from '@/lib/route-helpers';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';

export async function POST(req: Request) {
  // Forward logout request to Directus — lấy cookie từ client request
  const cookie = req.headers.get('cookie') ?? '';

  try {
    await fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie
      },
      body: JSON.stringify({ mode: 'session' })
    });
  } catch {
    /* Bỏ qua lỗi mạng khi logout */
  }

  // Xóa session cookie phía client
  const response = jsonOk({ ok: true });
  response.headers.set(
    'set-cookie',
    'directus_session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
  return response;
}
