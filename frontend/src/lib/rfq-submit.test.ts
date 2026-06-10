import test from 'node:test';
import assert from 'node:assert/strict';

import { submitRfq } from './rfq-submit';

test('submits only after validation, sku check, and anti-spam pass', async () => {
  const calls: string[] = [];
  let submitted: unknown;

  const result = await submitRfq(
    {
      company: 'ACME',
      contact: 'Mr A',
      email: 'a@acme.vn',
      phone: '+84901234567',
      items: [{ sku: 'CR-GLV-001', qty: 1 }],
      message: 'Need quote',
      token: 'good-token',
      website: ''
    },
    {
      ip: '1.2.3.4',
      verifyTurnstile: async () => {
        calls.push('turnstile');
        return true;
      },
      rateLimit: async () => {
        calls.push('rate-limit');
        return { ok: true };
      },
      reserveFingerprint: async () => {
        calls.push('reserve-fingerprint');
        return { ok: true };
      },
      fetchSkus: async () => {
        calls.push('fetch-skus');
        return [{ sku_code: 'CR-GLV-001' }];
      },
      createRfq: async (input) => {
        calls.push('create-rfq');
        submitted = input;
        return { id: 123 };
      }
    }
  );

  assert.equal(result.ok, true);
  assert.equal(result.data.id, 123);
  assert.deepEqual(submitted, {
    company: 'ACME',
    contact_name: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    message: 'Need quote',
    line_items: [{ sku: 'CR-GLV-001', qty: 1 }],
    status: 'new',
    source: 'web'
  });
  assert.deepEqual(calls, [
    'turnstile',
    'rate-limit',
    'reserve-fingerprint',
    'fetch-skus',
    'create-rfq'
  ]);
});

test('rejects non-object payloads before external calls', async () => {
  let called = false;

  const result = await submitRfq('not-json', {
    ip: '1.2.3.4',
    verifyTurnstile: async () => {
      called = true;
      return true;
    },
    rateLimit: async () => {
      called = true;
      return { ok: true };
    },
    reserveFingerprint: async () => {
      called = true;
      return { ok: true };
    },
    fetchSkus: async () => {
      called = true;
      return [];
    },
    createRfq: async () => {
      called = true;
      return { id: 1 };
    }
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'BAD_REQUEST');
  assert.equal(called, false);
});
