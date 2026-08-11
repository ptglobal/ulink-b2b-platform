import assert from 'node:assert/strict';
import test from 'node:test';

import { saveContactRequest } from './contact-request.server';

test('saveContactRequest maps the validated payload into contact_requests', async () => {
  const writes: Array<Record<string, unknown>> = [];

  const result = await saveContactRequest(
    {
      name: '  Nguyen Van A  ',
      email: '  Buyer@Company.vn  ',
      phone: ' 0901234567 ',
      subject: '  Bao gia vat tu  ',
      message: '  Toi can tu van  '
    },
    {
      writeContactRequest: async (payload) => {
        writes.push(payload);
        return { id: 77 };
      }
    }
  );

  assert.equal(result.id, 77);
  assert.deepEqual(writes[0], {
    full_name: 'Nguyen Van A',
    email: 'buyer@company.vn',
    phone: '0901234567',
    subject: 'Bao gia vat tu',
    message: 'Toi can tu van',
    status: 'unread'
  });
});
