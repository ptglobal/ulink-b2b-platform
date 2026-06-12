import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildErpIdempotencyKey,
  classifyErpResponse,
  nextErpRetryDelayMinutes,
  shouldEnqueueErpEvent
} from './erp-outbound';

test('ignores cosmetic order updates', () => {
  const result = shouldEnqueueErpEvent({
    entity: 'orders',
    op: 'update',
    before: {
      id: 7,
      status: 'processing',
      subtotal: 100,
      tax: 10,
      total: 110,
      notes: 'before',
      erp_ref: null
    },
    after: {
      id: 7,
      status: 'processing',
      subtotal: 100,
      tax: 10,
      total: 110,
      notes: 'after',
      erp_ref: null
    }
  });

  assert.equal(result.shouldEnqueue, false);
});

test('enqueues a delivery status transition with a revision-based idempotency key', () => {
  const result = shouldEnqueueErpEvent({
    entity: 'deliveries',
    op: 'update',
    before: {
      id: 15,
      status: 'scheduled',
      scheduled_date: '2026-06-12',
      delivered_date: null,
      tracking_ref: null,
      erp_ref: null
    },
    after: {
      id: 15,
      status: 'in_transit',
      scheduled_date: '2026-06-12',
      delivered_date: null,
      tracking_ref: 'TRK-001',
      erp_ref: null,
      date_updated: '2026-06-12T03:15:00.000Z'
    }
  });

  assert.equal(result.shouldEnqueue, true);
  assert.equal(result.idempotencyKey, 'deliveries:15:2026-06-12T03:15:00.000Z');
  assert.equal(result.payload.full.status, 'in_transit');
});

test('prefers erp_ref when present', () => {
  assert.equal(
    buildErpIdempotencyKey({
      entity: 'orders',
      recordId: 22,
      erpRef: 'ERP-ORD-2026-99901',
      revision: '2026-06-12T03:15:00.000Z'
    }),
    'ERP-ORD-2026-99901'
  );
});

test('classifies 4xx as dead-letter and 5xx as retry', () => {
  assert.equal(classifyErpResponse(409), 'failed');
  assert.equal(classifyErpResponse(502), 'retry');
  assert.equal(nextErpRetryDelayMinutes(1), 1);
  assert.equal(nextErpRetryDelayMinutes(2), 5);
  assert.equal(nextErpRetryDelayMinutes(3), 15);
});
