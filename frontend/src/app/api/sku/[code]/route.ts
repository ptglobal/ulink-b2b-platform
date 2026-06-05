import { NextResponse } from 'next/server';
import { readItems } from '@directus/sdk';
import { directus } from '@/lib/directus';
import { getRedis } from '@/lib/redis';

// Cached single-SKU lookup. Target: <50ms on a cache hit (Redis), per the
// delivery plan §11. On a miss we read Directus once and prime the cache.
export async function GET(
  _req: Request,
  { params: { code } }: { params: { code: string } }
) {
  const redis = getRedis();
  const key = `sku:${code.toLowerCase()}`;

  const cached = await redis.get(key);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), { headers: { 'x-cache': 'HIT' } });
  }

  const items = await directus.request(
    readItems('product_skus', {
      filter: { sku_code: { _eq: code } },
      limit: 1
    })
  );
  const sku = items?.[0] ?? null;

  if (!sku) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Cache for 1h; a Directus publish webhook should also prime/invalidate this.
  await redis.set(key, JSON.stringify(sku), 'EX', 3600);
  return NextResponse.json(sku, { headers: { 'x-cache': 'MISS' } });
}
