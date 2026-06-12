import assert from 'node:assert/strict';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const internalToken = process.env.INTERNAL_API_TOKEN;

if (!internalToken) {
  throw new Error('INTERNAL_API_TOKEN is required for SKU cache verification.');
}

const skuCode = 'sku-gloves-nitrile-s';
const skuPath = `${baseUrl}/api/sku/${skuCode}`;
const internalPath = `${baseUrl}/api/internal/sku-cache`;

async function postJson(url, token, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { response, text, json };
}

async function getSku() {
  const response = await fetch(skuPath);
  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { response, text, json };
}

async function main() {
  const bad = await postJson(
    internalPath,
    'wrong-token',
    {
      event: 'items.update',
      collection: 'product_skus',
      items: [
        {
          id: 1,
          sku_code: skuCode,
          status: 'published',
          product: 1,
          unit: 'box',
          pack_size: '100 pcs/box',
          attributes: { size: 'S' }
        }
      ]
    }
  );

  assert.equal(bad.response.status, 403, bad.text);

  const prime = await postJson(
    internalPath,
    internalToken,
    {
      event: 'items.update',
      collection: 'product_skus',
      items: [
        {
          id: 1,
          sku_code: skuCode,
          status: 'published',
          product: 1,
          unit: 'box',
          pack_size: '100 pcs/box',
          attributes: { size: 'S' }
        }
      ]
    }
  );

  assert.equal(prime.response.status, 200, prime.text);
  assert.equal(prime.json?.success, true);
  assert.deepEqual(prime.json?.data?.primed, [`sku:${skuCode}`]);

  const hit = await getSku();
  assert.equal(hit.response.status, 200, hit.text);
  assert.equal(hit.response.headers.get('x-cache'), 'HIT');
  assert.equal(hit.json?.success, true);
  assert.equal(hit.json?.data?.sku_code, skuCode);

  const invalidate = await postJson(
    internalPath,
    internalToken,
    {
      event: 'items.update',
      collection: 'product_skus',
      items: [
        {
          id: 1,
          sku_code: skuCode,
          status: 'archived'
        }
      ]
    }
  );

  assert.equal(invalidate.response.status, 200, invalidate.text);
  assert.deepEqual(invalidate.json?.data?.invalidated, [`sku:${skuCode}`]);

  const miss = await getSku();
  assert.equal(miss.response.status, 200, miss.text);
  assert.equal(miss.response.headers.get('x-cache'), 'MISS');
  assert.equal(miss.json?.success, true);
  assert.equal(miss.json?.data?.sku_code, skuCode);

  const refillHit = await getSku();
  assert.equal(refillHit.response.status, 200, refillHit.text);
  assert.equal(refillHit.response.headers.get('x-cache'), 'HIT');
  assert.equal(refillHit.json?.success, true);
  assert.equal(refillHit.json?.data?.sku_code, skuCode);

  console.log('[sku-cache] Verification passed.');
}

main().catch((error) => {
  console.error('[sku-cache] Verification failed:', error);
  process.exit(1);
});
