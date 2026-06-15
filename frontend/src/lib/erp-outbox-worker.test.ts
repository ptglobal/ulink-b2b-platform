import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyDrainResult, drainErpOutbox } from './erp-outbox-worker';

test('skips draining when ERP sync is disabled', async () => {
  const result = await drainErpOutbox({
    syncEnabled: false,
    batchSize: 5,
    fetchPendingEvents: async () => []
  });

  assert.equal(result.skipped, true);
  assert.equal(result.sent, 0);
  assert.equal(result.retried, 0);
  assert.equal(result.failed, 0);
});

test('retries 5xx and dead-letters 4xx', () => {
  assert.equal(classifyDrainResult(200), 'sent');
  assert.equal(classifyDrainResult(409), 'failed');
  assert.equal(classifyDrainResult(503), 'retry');
});
