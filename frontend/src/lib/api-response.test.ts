import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSuccessPayload, buildErrorPayload } from './api-response';
import type { SuccessPayload, ErrorPayload } from './api-response';

test('buildSuccessPayload wraps data in success envelope', () => {
  const payload = buildSuccessPayload({ id: 123, name: 'sku-1' }) as SuccessPayload;

  assert.deepEqual(payload, {
    success: true,
    data: { id: 123, name: 'sku-1' }
  });
});

test('buildSuccessPayload includes meta when provided', () => {
  const payload = buildSuccessPayload([{ id: 1 }], {
    page: 1,
    limit: 20,
    total: 1
  }) as SuccessPayload;

  assert.deepEqual(payload, {
    success: true,
    data: [{ id: 1 }],
    meta: {
      page: 1,
      limit: 20,
      total: 1
    }
  });
});

test('buildSuccessPayload keeps pre-wrapped success payload unchanged', () => {
  const original = {
    success: true,
    data: { accepted: true },
    meta: { source: 'existing' }
  };

  const payload = buildSuccessPayload(original);

  assert.equal(payload, original);
});

test('buildErrorPayload returns normalized error envelope', () => {
  const payload = buildErrorPayload('BAD_REQUEST', 'Body invalid', {
    field: 'email'
  }) as ErrorPayload;

  assert.equal(payload.success, false);
  assert.equal(payload.error.code, 'BAD_REQUEST');
  assert.equal(payload.error.message, 'Body invalid');
  assert.deepEqual(payload.error.details, { field: 'email' });
  assert.match(payload.error.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});
