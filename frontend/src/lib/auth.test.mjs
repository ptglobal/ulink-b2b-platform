import test from 'node:test';
import assert from 'node:assert/strict';

import { register } from './auth';

test('register sends onboarding payload to directus endpoint', async () => {
  const calls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 201,
      json: async () => ({ data: { ok: true } }),
      text: async () => JSON.stringify({ data: { ok: true } })
    };
  };

  try {
    await register({
      company: 'ACME Vietnam',
      contact: 'Nguyen Van A',
      email: 'buyer@acme.vn',
      phone: '0901234567',
      password: 'customer-password-123',
      confirm: 'customer-password-123'
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://localhost:8055/customer-onboarding/register');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    company_name: 'ACME Vietnam',
    contact_name: 'Nguyen Van A',
    email: 'buyer@acme.vn',
    phone: '0901234567',
    password: 'customer-password-123',
    confirm_password: 'customer-password-123'
  });
});
