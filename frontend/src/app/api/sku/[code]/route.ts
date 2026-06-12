import { readItems } from '@directus/sdk';
import { errorJson, successJson } from '@/lib/api-response-next';
import { publicDirectus } from '@/lib/directus';
import { getRedis } from '@/lib/redis';
import { lookupSkuByCode } from '@/lib/sku-cache';

// Cached single-SKU lookup. Target: <50ms on a cache hit (Redis), per the
// delivery plan section 11. On a miss we read Directus once and prime the cache.
export async function GET(_req: Request, { params: { code } }: { params: { code: string } }) {
  try {
    const redis = getRedis();
    const result = await lookupSkuByCode(code, {
      redis,
      fetchSku: async (normalizedCode) => {
        const items = await publicDirectus.request(
          readItems('product_skus', {
            filter: {
              sku_code: { _eq: normalizedCode },
              status: { _eq: 'published' }
            },
            limit: 1
          })
        );

        return items?.[0] ?? null;
      }
    });

    if (!result.ok) {
      return errorJson(404, 'NOT_FOUND', 'SKU not found.');
    }

    return successJson(result.data, {
      init: { headers: { 'x-cache': result.cache } }
    });
  } catch (err) {
    console.error('SKU lookup failed', err);
    return errorJson(500, 'INTERNAL_SERVER_ERROR', 'Failed to resolve SKU.');
  }
}
