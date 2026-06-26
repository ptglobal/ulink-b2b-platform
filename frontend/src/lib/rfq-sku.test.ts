import test from 'node:test';
import assert from 'node:assert/strict';

import { assertRfqSkusExist } from './rfq-sku';

test('rejects unknown sku before write', async () => {
  const result = await assertRfqSkusExist([{ sku: 'MISSING-SKU' }], {
    fetchSkus: async () => []
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.error.details.invalidSkus, ['MISSING-SKU']);
});

test('preserves sku lookup keys casing before querying directus', async () => {
  const result = await assertRfqSkusExist([{ sku: '  CR-GLV-001  ', note: 'test' }], {
    fetchSkus: async (skus) => {
      assert.deepEqual(skus, ['CR-GLV-001']);
      return [{ sku_code: 'CR-GLV-001' }];
    }
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Unexpected RFQ SKU validation failure');
  assert.deepEqual(result.value, [{ sku: 'CR-GLV-001', note: 'test' }]);
});
