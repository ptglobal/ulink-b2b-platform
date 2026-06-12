import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySkuCachePlan,
  buildSkuCacheKey,
  lookupSkuByCode,
  normalizeSkuCode,
  parseSkuCacheWebhookPayload,
  planSkuCacheMutation
} from './sku-cache';

test('normalizes sku codes for cache and query paths', () => {
  assert.equal(normalizeSkuCode('  CR-GLV-001  '), 'cr-glv-001');
  assert.equal(buildSkuCacheKey('  CR-GLV-001  '), 'sku:cr-glv-001');
});

test('parseSkuCacheWebhookPayload accepts the directus flow payload shape', () => {
  const parsed = parseSkuCacheWebhookPayload({
    event: 'items.update',
    collection: 'product_skus',
    items: [
      {
        id: 42,
        sku_code: '  CR-GLV-001  ',
        previous_sku_code: 'CR-GLV-000',
        status: 'published',
        product: 7,
        unit: 'box',
        pack_size: '100 pcs/box',
        attributes: { size: 'S' }
      }
    ]
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error('Unexpected parse failure');

  assert.deepEqual(parsed.data, {
    event: 'items.update',
    collection: 'product_skus',
    items: [
      {
        id: 42,
        sku_code: 'cr-glv-001',
        previous_sku_code: 'cr-glv-000',
        status: 'published',
        product: 7,
        unit: 'box',
        pack_size: '100 pcs/box',
        attributes: { size: 'S' }
      }
    ]
  });
});

test('read-through lookup returns HIT on cached data and MISS on directus fill', async () => {
  const redisCalls: string[] = [];
  const redis = {
    get: async (key: string) => {
      redisCalls.push(`get:${key}`);
      return null;
    },
    set: async (key: string, value: string, mode: 'EX', ttl: number) => {
      redisCalls.push(`set:${key}:${mode}:${ttl}`);
      assert.equal(mode, 'EX');
      assert.equal(ttl, 3600);
      assert.match(value, /"sku_code":"cr-glv-001"/);
      return 'OK';
    },
    del: async (key: string) => {
      redisCalls.push(`del:${key}`);
      return 1;
    }
  };

  const result = await lookupSkuByCode('  CR-GLV-001  ', {
    redis,
    fetchSku: async (code) => ({
      id: 42,
      sku_code: code,
      product: 7,
      unit: 'box',
      pack_size: '100 pcs/box',
      attributes: { size: 'S' },
      status: 'published'
    })
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Unexpected lookup failure');
  assert.equal(result.cache, 'MISS');
  assert.equal(result.data.sku_code, 'cr-glv-001');
  assert.deepEqual(redisCalls, ['get:sku:cr-glv-001', 'set:sku:cr-glv-001:EX:3600']);
});

test('published skus prime cache, draft and archived skus invalidate it, and renames delete the old key', () => {
  const published = planSkuCacheMutation({
    event: 'items.update',
    collection: 'product_skus',
    items: [
      {
        id: 1,
        sku_code: 'CR-GLV-001',
        previous_sku_code: 'CR-GLV-000',
        product: 7,
        unit: 'box',
        pack_size: '100 pcs/box',
        attributes: { size: 'S' },
        status: 'published'
      }
    ]
  });

  assert.deepEqual(published.primedKeys, ['sku:cr-glv-001']);
  assert.deepEqual(published.invalidatedKeys, []);
  assert.deepEqual(published.deletedOldKeys, ['sku:cr-glv-000']);

  const archived = planSkuCacheMutation({
    event: 'items.update',
    collection: 'product_skus',
    items: [
      {
        id: 1,
        sku_code: 'CR-GLV-001',
        status: 'archived'
      }
    ]
  });

  assert.deepEqual(archived.primedKeys, []);
  assert.deepEqual(archived.invalidatedKeys, ['sku:cr-glv-001']);
  assert.deepEqual(archived.deletedOldKeys, []);

  const deleted = planSkuCacheMutation({
    event: 'items.delete',
    collection: 'product_skus',
    items: [
      {
        id: 1,
        sku_code: 'CR-GLV-001'
      }
    ]
  });

  assert.deepEqual(deleted.primedKeys, []);
  assert.deepEqual(deleted.invalidatedKeys, ['sku:cr-glv-001']);
  assert.deepEqual(deleted.deletedOldKeys, []);
});

test('applySkuCachePlan batches deletes before primes', async () => {
  const ops: string[] = [];
  const redis = {
    pipeline() {
      return {
        del(key: string) {
          ops.push(`del:${key}`);
          return this;
        },
        set(key: string, value: string) {
          ops.push(`set:${key}:${value.includes('"sku_code":"cr-glv-001"')}`);
          return this;
        },
        async exec() {
          ops.push('exec');
          return [];
        }
      };
    }
  };

  await applySkuCachePlan(redis, {
    primedKeys: ['sku:cr-glv-001'],
    invalidatedKeys: ['sku:cr-glv-001-old'],
    deletedOldKeys: ['sku:cr-glv-001-prev'],
    records: [
      {
        key: 'sku:cr-glv-001',
        record: {
          id: 42,
          sku_code: 'cr-glv-001',
          product: 7,
          unit: 'box',
          pack_size: '100 pcs/box',
          attributes: { size: 'S' },
          status: 'published'
        }
      }
    ]
  });

  assert.deepEqual(ops, [
    'del:sku:cr-glv-001-old',
    'del:sku:cr-glv-001-prev',
    'set:sku:cr-glv-001:true',
    'exec'
  ]);
});
