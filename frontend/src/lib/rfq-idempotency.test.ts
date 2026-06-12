import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRfqIdempotencyKey } from './rfq-idempotency';

test('builds the same key for equivalent company, email, and item payloads', () => {
  const keyA = buildRfqIdempotencyKey({
    company: '  ACME  ',
    email: 'A@ACME.VN',
    items: [
      { sku: 'CR-GLV-002', qty: 2 },
      { sku: 'CR-GLV-001', qty: 1 }
    ]
  });

  const keyB = buildRfqIdempotencyKey({
    company: 'acme',
    email: 'a@acme.vn',
    items: [
      { sku: 'cr-glv-001', qty: 1 },
      { sku: 'cr-glv-002', qty: 2 }
    ]
  });

  assert.equal(keyA, keyB);
});

test('changes when the item list changes', () => {
  const keyA = buildRfqIdempotencyKey({
    company: 'ACME',
    email: 'a@acme.vn',
    items: [{ sku: 'CR-GLV-001', qty: 1 }]
  });

  const keyB = buildRfqIdempotencyKey({
    company: 'ACME',
    email: 'a@acme.vn',
    items: [{ sku: 'CR-GLV-002', qty: 1 }]
  });

  assert.notEqual(keyA, keyB);
});
