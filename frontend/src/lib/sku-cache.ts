import type { ProductSku } from './directus';

export const SKU_CACHE_TTL_SECONDS = 3600;

export type SkuCacheEvent = 'items.create' | 'items.update' | 'items.delete';

export interface SkuCacheWebhookItem {
  id?: number | string;
  sku_code: string;
  previous_sku_code?: string;
  product?: number | null;
  unit?: string | null;
  pack_size?: string | null;
  attributes?: Record<string, unknown> | null;
  stock_status?: ProductSku['stock_status'];
  status?: ProductSku['status'];
}

export interface SkuCacheWebhookPayload {
  event: SkuCacheEvent;
  collection: 'product_skus';
  items: SkuCacheWebhookItem[];
}

export interface SkuCachePlanRecord {
  key: string;
  record: ProductSku;
}

export interface SkuCachePlan {
  primedKeys: string[];
  invalidatedKeys: string[];
  deletedOldKeys: string[];
  records: SkuCachePlanRecord[];
}

export interface SkuCacheLookupDeps {
  redis: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode: 'EX', ttlSeconds: number): Promise<unknown>;
    del(key: string): Promise<unknown>;
  };
  fetchSku(code: string): Promise<ProductSku | null>;
}

export interface SkuCacheRedisPipeline {
  set(key: string, value: string, mode: 'EX', ttlSeconds: number): SkuCacheRedisPipeline;
  del(...keys: string[]): SkuCacheRedisPipeline;
  exec(): Promise<unknown>;
}

export interface SkuCachePipelineRedis {
  pipeline(): SkuCacheRedisPipeline;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeRecord(record: ProductSku): ProductSku {
  return {
    ...record,
    sku_code: normalizeSkuCode(record.sku_code),
    attributes:
      record.attributes && typeof record.attributes === 'object' && !Array.isArray(record.attributes)
        ? record.attributes
        : null
  };
}

export function normalizeSkuCode(value: string): string {
  return value.trim().toLowerCase();
}

export function buildSkuCacheKey(value: string): string {
  return `sku:${normalizeSkuCode(value)}`;
}

export function parseSkuCacheWebhookPayload(
  value: unknown
): { ok: true; data: SkuCacheWebhookPayload } | { ok: false; error: Error } {
  if (!isRecord(value)) {
    return { ok: false, error: new Error('Request body must be an object.') };
  }

  const event = value.event;
  const collection = value.collection;
  const rawItems = Array.isArray(value.items)
    ? value.items
    : isRecord(value.item)
      ? [value.item]
      : isRecord(value.data)
        ? [value.data]
        : [];

  if (event !== 'items.create' && event !== 'items.update' && event !== 'items.delete') {
    return { ok: false, error: new Error('Unsupported webhook event.') };
  }

  if (collection !== 'product_skus') {
    return { ok: false, error: new Error('Unsupported SKU cache collection.') };
  }

  if (rawItems.length === 0) {
    return { ok: false, error: new Error('Request body must include at least one item.') };
  }

  const items: SkuCacheWebhookItem[] = [];

  for (const candidate of rawItems) {
    if (!isRecord(candidate) || typeof candidate.sku_code !== 'string') {
      return { ok: false, error: new Error('Each SKU cache item must include sku_code.') };
    }

    const status = candidate.status;
    const normalizedStatus =
      status === 'published' || status === 'draft' || status === 'archived' ? status : undefined;
    const previousSkuCode =
      typeof candidate.previous_sku_code === 'string'
        ? normalizeSkuCode(candidate.previous_sku_code)
        : undefined;

    items.push({
      id: candidate.id as number | string | undefined,
      sku_code: normalizeSkuCode(candidate.sku_code),
      ...(previousSkuCode ? { previous_sku_code: previousSkuCode } : {}),
      ...(typeof candidate.product === 'number' || candidate.product === null
        ? { product: candidate.product }
        : {}),
      ...(typeof candidate.unit === 'string' || candidate.unit === null ? { unit: candidate.unit } : {}),
      ...(typeof candidate.pack_size === 'string' || candidate.pack_size === null
        ? { pack_size: candidate.pack_size }
        : {}),
      ...(candidate.attributes && typeof candidate.attributes === 'object' && !Array.isArray(candidate.attributes)
        ? { attributes: candidate.attributes as Record<string, unknown> }
        : candidate.attributes === null
          ? { attributes: null }
          : {}),
      ...(normalizedStatus ? { status: normalizedStatus } : {})
    });
  }

  return {
    ok: true,
    data: {
      event,
      collection,
      items
    }
  };
}

export function planSkuCacheMutation(payload: SkuCacheWebhookPayload): SkuCachePlan {
  const primedKeys = new Set<string>();
  const invalidatedKeys = new Set<string>();
  const deletedOldKeys = new Set<string>();
  const records: SkuCachePlanRecord[] = [];

  for (const item of payload.items) {
    const skuCode = normalizeSkuCode(item.sku_code);
    if (!skuCode) {
      continue;
    }

    const key = buildSkuCacheKey(skuCode);
    const normalizedRecord: ProductSku = normalizeRecord({
      id: item.id as ProductSku['id'],
      sku_code: skuCode,
      product: item.product ?? null,
      unit: item.unit ?? null,
      pack_size: item.pack_size ?? null,
      attributes: item.attributes ?? null,
      stock_status: item.stock_status ?? 'in_stock',
      status: item.status ?? 'draft'
    });

    records.push({ key, record: normalizedRecord });

    if (item.previous_sku_code) {
      const previousKey = buildSkuCacheKey(item.previous_sku_code);
      if (previousKey !== key) {
        deletedOldKeys.add(previousKey);
      }
    }

    if (payload.event === 'items.delete') {
      invalidatedKeys.add(key);
      continue;
    }

    if (item.status === 'published') {
      primedKeys.add(key);
      continue;
    }

    invalidatedKeys.add(key);
  }

  return {
    primedKeys: Array.from(primedKeys),
    invalidatedKeys: Array.from(invalidatedKeys),
    deletedOldKeys: Array.from(deletedOldKeys),
    records
  };
}

export async function applySkuCachePlan(
  redis: SkuCachePipelineRedis,
  plan: SkuCachePlan
): Promise<void> {
  const pipeline = redis.pipeline();

  for (const key of plan.invalidatedKeys) {
    pipeline.del(key);
  }

  for (const key of plan.deletedOldKeys) {
    pipeline.del(key);
  }

  for (const entry of plan.records) {
    if (!plan.primedKeys.includes(entry.key)) {
      continue;
    }

    pipeline.set(entry.key, JSON.stringify(entry.record), 'EX', SKU_CACHE_TTL_SECONDS);
  }

  await pipeline.exec();
}

export async function lookupSkuByCode(
  rawCode: string,
  deps: SkuCacheLookupDeps
): Promise<
  { ok: true; cache: 'HIT' | 'MISS'; data: ProductSku } | { ok: false; status: 404 }
> {
  const skuCode = normalizeSkuCode(rawCode);
  if (!skuCode) {
    return { ok: false, status: 404 };
  }

  const key = buildSkuCacheKey(skuCode);
  const cached = await deps.redis.get(key);

  if (cached) {
    try {
      return {
        ok: true,
        cache: 'HIT',
        data: normalizeRecord(JSON.parse(cached) as ProductSku)
      };
    } catch {
      await deps.redis.del(key);
    }
  }

  const sku = await deps.fetchSku(skuCode);
  if (!sku) {
    return { ok: false, status: 404 };
  }

  const normalized = normalizeRecord(sku);
  await deps.redis.set(key, JSON.stringify(normalized), 'EX', SKU_CACHE_TTL_SECONDS);

  return {
    ok: true,
    cache: 'MISS',
    data: normalized
  };
}
