import test from 'node:test';
import assert from 'node:assert/strict';

import { assertRfqSkusExist } from './rfq-sku';

test('rejects unknown sku before write', async () => {
  const result = await assertRfqSkusExist([{ sku: 'MISSING-SKU', qty: 1 }], {
    fetchSkus: async () => []
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.error.details.invalidSkus, ['missing-sku']);
});

test('lowercases sku lookup keys before querying directus', async () => {
  const result = await assertRfqSkusExist([{ sku: '  CR-GLV-001  ', qty: 1 }], {
    fetchSkus: async (skus) => {
      assert.deepEqual(skus, ['cr-glv-001']);
      return [{ sku_code: 'cr-glv-001' }];
    }
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Unexpected RFQ SKU validation failure');
  assert.deepEqual(result.value, [{ sku: 'cr-glv-001', qty: 1 }]);
});
