import { createWriteDirectusClient } from '@/lib/directus';
import { createItem } from '@directus/sdk';
import { errorJson, successJson } from '@/lib/api-response-next';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return errorJson(400, 'BAD_REQUEST', 'Email is required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return errorJson(422, 'UNPROCESSABLE_ENTITY', 'Định dạng email không hợp lệ.');
    }

    const writeDirectus = createWriteDirectusClient();

    try {
      await writeDirectus.request(
        createItem('newsletter_subscribers', {
          email: normalizedEmail,
          status: 'active'
        })
      );

      return successJson({ message: 'Success' });
    } catch (err: unknown) {
      // Directus returns RECORD_NOT_UNIQUE error code if the email already exists
      const errorDetail = (err as any)?.errors?.[0];
      if (errorDetail?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        return errorJson(409, 'CONFLICT', 'Email này đã được đăng ký trước đó');
      }

      console.error('Newsletter subscription failed inside Directus:', err);
      return errorJson(500, 'INTERNAL_SERVER_ERROR', 'Đăng ký không thành công. Vui lòng thử lại sau.');
    }
  } catch (err) {
    console.error('Newsletter subscription route failed:', err);
    return errorJson(500, 'INTERNAL_SERVER_ERROR', 'Đăng ký không thành công. Vui lòng thử lại sau.');
  }
}
