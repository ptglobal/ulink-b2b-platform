import { readItems } from '@directus/sdk';
import { publicDirectus } from './directus';

export interface RfqSkuItem {
  sku: string;
  note?: string;
}

export type RfqSkuResult =
  | { ok: true; value: RfqSkuItem[] }
  | {
      ok: false;
      error: {
        code: 'UNPROCESSABLE_ENTITY';
        message: string;
        details: {
          invalidSkus: string[];
        };
      };
    };

interface RfqSkuDeps {
  fetchSkus?: (skus: string[]) => Promise<Array<{ sku_code: string }>>;
}

async function fetchPublishedSkus(skus: string[]) {
  if (skus.length === 0) {
    return [];
  }

  return publicDirectus.request(
    readItems('product_skus', {
      filter: {
        sku_code: { _in: skus },
        status: { _eq: 'published' }
      },
      fields: ['sku_code'],
      limit: -1
    })
  );
}

export async function assertRfqSkusExist(
  items: Array<{ sku: string; note?: string }>,
  deps: RfqSkuDeps = {}
): Promise<RfqSkuResult> {
  const normalized = items.map((item) => ({
    sku: item.sku.trim(),
    note: item.note
  }));

  const uniqueSkus = [...new Set(normalized.map((item) => item.sku))];
  const fetchSkus = deps.fetchSkus ?? fetchPublishedSkus;
  const rows = await fetchSkus(uniqueSkus);
  const found = new Set(rows.map((row) => row.sku_code));
  const invalidSkus = uniqueSkus.filter((sku) => !found.has(sku));

  if (invalidSkus.length > 0) {
    return {
      ok: false,
      error: {
        code: 'UNPROCESSABLE_ENTITY',
        message: 'One or more SKUs do not exist.',
        details: {
          invalidSkus
        }
      }
    };
  }

  return {
    ok: true,
    value: normalized
  };
}
