import { readItems } from '@directus/sdk';
import { errorJson, successJson } from '@/lib/api-response-next';
import { directus } from '@/lib/directus';
import { getRedis } from '@/lib/redis';

// Cached single-SKU lookup. Target: <50ms on a cache hit (Redis), per the
// delivery plan section 11. On a miss we read Directus once and prime the cache.
export async function GET(_req: Request, { params: { code } }: { params: { code: string } }) {
  try {
    const redis = getRedis();
    const key = `sku:${code.toLowerCase()}`;

    const cached = await redis.get(key);
    if (cached) {
      return successJson(JSON.parse(cached), {
        init: { headers: { 'x-cache': 'HIT' } }
      });
    }

    const items = await directus.request(
      readItems('product_skus', {
        filter: { sku_code: { _eq: code } },
        limit: 1
      })
    );
    const sku = items?.[0] ?? null;

    if (!sku) {
      return errorJson(404, 'NOT_FOUND', 'SKU not found.');
    }

    // Cache for 1h; a Directus publish webhook should also prime/invalidate this.
    await redis.set(key, JSON.stringify(sku), 'EX', 3600);
    return successJson(sku, {
      init: { headers: { 'x-cache': 'MISS' } }
    });
  } catch (err) {
    console.error('SKU lookup failed', err);
    return errorJson(500, 'INTERNAL_SERVER_ERROR', 'Failed to resolve SKU.');
  }
}
