import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parsePublishWebhookPayload,
  requireRevalidateSecret,
  resolveRevalidationTargets
} from './content-revalidation';

test('rejects a missing webhook secret', () => {
  assert.throws(
    () => requireRevalidateSecret(undefined, undefined),
    /REVALIDATE_SECRET is required/
  );
});

test('accepts the configured bearer secret', () => {
  assert.equal(
    requireRevalidateSecret('Bearer dev-revalidate-secret', 'dev-revalidate-secret'),
    'dev-revalidate-secret'
  );
});

test('rejects a mismatched bearer secret', () => {
  assert.throws(
    () => requireRevalidateSecret('Bearer wrong-secret', 'dev-revalidate-secret'),
    /Invalid webhook secret/
  );
});

test('maps a published product update to list, entity, and detail paths', () => {
  const parsed = parsePublishWebhookPayload({
    event: 'items.update',
    collection: 'products',
    id: 42,
    slug: 'cr-glv-001',
    locale: 'en',
    status: 'published'
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error('Unexpected parse failure');

  assert.deepEqual(resolveRevalidationTargets(parsed.data), {
    tags: ['col:products', 'entity:products:42'],
    paths: ['/en/solutions', '/en/products/cr-glv-001']
  });
});

test('maps a bulk blog update to the collection tag and list path only', () => {
  const parsed = parsePublishWebhookPayload({
    event: 'items.update',
    collection: 'blog_posts',
    keys: [1001, 1002],
    locale: 'ja',
    status: 'published'
  });

  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error('Unexpected parse failure');

  assert.deepEqual(resolveRevalidationTargets(parsed.data), {
    tags: ['col:blog_posts', 'entity:blog_posts:1001', 'entity:blog_posts:1002'],
    paths: ['/ja/resources']
  });
});
