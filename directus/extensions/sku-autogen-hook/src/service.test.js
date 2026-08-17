import assert from 'node:assert/strict';
import test from 'node:test';

import { assertProductHasAssignedAttributes } from './service.js';

test('rejects a product with no assigned attributes before SKU creation', async () => {
  assert.throws(() => {
    assertProductHasAssignedAttributes({
      productId: 123,
      productSlug: 'demo-product',
      assignedAttributeCount: 0
    });
  }, /must have at least one assigned attribute/i);
});
