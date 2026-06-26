import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRfqIdempotencyKey } from './rfq-idempotency';
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
      address: '123 Test St',
      hub: '3',
      industry: 'Chemical',
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
      getExistingRfqId: async (key) => {
        calls.push(`get-existing:${key}`);
        return null;
      },
      reserveIdempotencyKey: async (key) => {
        calls.push(`reserve:${key}`);
        return { ok: true };
      },
      fetchSkus: async () => {
        calls.push('fetch-skus');
        return [{ sku_code: 'CR-GLV-001' }];
      },
      saveIdempotencyKey: async (key, rfqId) => {
        calls.push(`save:${key}:${rfqId}`);
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
  const idempotencyKey = buildRfqIdempotencyKey({
    company: 'ACME',
    email: 'a@acme.vn',
    items: [{ sku: 'cr-glv-001', qty: 1 }]
  });
  assert.deepEqual(submitted, {
    company: 'ACME',
    contact_name: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    address: '123 Test St',
    hub: 3,
    industry: 'chemical',
    message: 'Need quote',
    scheduled_delivery: false,
    requested_delivery_date: undefined,
    line_items: [{ sku: 'CR-GLV-001', qty: 1 }],
    status: 'pending',
    source: 'web'
  });
  assert.deepEqual(calls, [
    `get-existing:${idempotencyKey}`,
    'turnstile',
    'rate-limit',
    `reserve:${idempotencyKey}`,
    'create-rfq',
    `save:${idempotencyKey}:123`
  ]);
});

test('returns the existing RFQ id for an exact duplicate payload', async () => {
  let createCalled = false;

  const result = await submitRfq(
    {
      company: 'ACME',
      contact: 'Mr A',
      email: 'a@acme.vn',
      phone: '+84901234567',
      address: '123 Test St',
      hub: '3',
      industry: 'Chemical',
      items: [{ sku: 'CR-GLV-001', qty: 1 }],
      message: 'Need quote',
      token: 'good-token'
    },
    {
      ip: '1.2.3.4',
      verifyTurnstile: async () => {
        throw new Error('turnstile should not run for exact duplicates');
      },
      rateLimit: async () => {
        throw new Error('rate limit should not run for exact duplicates');
      },
      getExistingRfqId: async () => 123,
      reserveIdempotencyKey: async () => {
        throw new Error('reserve should not run for exact duplicates');
      },
      fetchSkus: async () => {
        throw new Error('sku lookup should not run for exact duplicates');
      },
      saveIdempotencyKey: async () => {
        throw new Error('save should not run for exact duplicates');
      },
      createRfq: async () => {
        createCalled = true;
        return { id: 1 };
      }
    }
  );

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Unexpected duplicate failure');
  assert.equal(result.data.id, 123);
  assert.equal(createCalled, false);
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
    getExistingRfqId: async () => {
      called = true;
      return null;
    },
    reserveIdempotencyKey: async () => {
      called = true;
      return { ok: true };
    },
    fetchSkus: async () => {
      called = true;
      return [];
    },
    saveIdempotencyKey: async () => {
      called = true;
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
