import assert from 'node:assert/strict';
import test from 'node:test';

import { submitContactRequest } from './contact-submit';

test('submitContactRequest posts the contact payload to /api/contact', async () => {
  let capturedUrl = '';
  let capturedBody = '';

  const result = await submitContactRequest(
    {
      name: 'Nguyễn Văn A',
      email: 'buyer@company.vn',
      phone: '0901234567',
      subject: 'Báo giá',
      message: 'Cần tư vấn'
    },
    async (url, init) => {
      capturedUrl = typeof url === 'string' ? url : url.toString();
      capturedBody = String(init?.body ?? '');
      return new Response(JSON.stringify({ success: true, data: { id: 91 } }), { status: 201 });
    }
  );

  assert.equal(capturedUrl, '/api/contact');
  assert.deepEqual(JSON.parse(capturedBody), {
    name: 'Nguyễn Văn A',
    email: 'buyer@company.vn',
    phone: '0901234567',
    subject: 'Báo giá',
    message: 'Cần tư vấn'
  });
  assert.equal(result.ok, true);
});
