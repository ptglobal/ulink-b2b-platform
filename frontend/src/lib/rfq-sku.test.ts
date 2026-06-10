import test from 'node:test';
import assert from 'node:assert/strict';

import { assertRfqSkusExist } from './rfq-sku';

test('rejects unknown sku before write', async () => {
  const result = await assertRfqSkusExist([{ sku: 'MISSING-SKU', qty: 1 }], {
    fetchSkus: async () => []
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.error.details.invalidSkus, ['MISSING-SKU']);
});
