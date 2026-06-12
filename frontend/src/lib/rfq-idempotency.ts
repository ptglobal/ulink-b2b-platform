import { createHash } from 'node:crypto';
import type Redis from 'ioredis';

function normalizeCompany(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeItems(items: Array<{ sku: string; qty: number }>) {
  return [...items]
    .map((item) => ({
      sku: item.sku.trim().toLowerCase(),
      qty: item.qty
    }))
    .sort((a, b) => a.sku.localeCompare(b.sku) || a.qty - b.qty);
}

export function buildRfqIdempotencyKey(input: {
  company: string;
  email: string;
  items: Array<{ sku: string; qty: number }>;
}): string {
  const payload = {
    company: normalizeCompany(input.company),
    email: input.email.trim().toLowerCase(),
    items: normalizeItems(input.items)
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export interface RfqIdempotencyStore {
  getExistingRfqId(key: string): Promise<number | string | null>;
  reserveIdempotencyKey(key: string): Promise<{ ok: true } | { ok: false }>;
  saveIdempotencyKey(key: string, rfqId: number | string): Promise<void>;
}

const FINAL_PREFIX = 'rfq:idempotency:';
const PENDING_PREFIX = 'rfq:idempotency:pending:';

function finalKey(key: string) {
  return `${FINAL_PREFIX}${key}`;
}

function pendingKey(key: string) {
  return `${PENDING_PREFIX}${key}`;
}

export function createRfqIdempotencyStore(redis: Redis): RfqIdempotencyStore {
  return {
    async getExistingRfqId(key: string) {
      const value = await redis.get(finalKey(key));
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    },

    async reserveIdempotencyKey(key: string) {
      const result = await redis.set(pendingKey(key), '1', 'EX', 300, 'NX');
      return result === 'OK' ? { ok: true as const } : { ok: false as const };
    },

    async saveIdempotencyKey(key: string, rfqId: number | string) {
      await redis
        .multi()
        .set(finalKey(key), String(rfqId), 'EX', 86400)
        .del(pendingKey(key))
        .exec();
    }
  };
}

export async function waitForExistingRfqId(
  store: Pick<RfqIdempotencyStore, 'getExistingRfqId'>,
  key: string,
  attempts = 5,
  delayMs = 25
): Promise<number | string | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const existing = await store.getExistingRfqId(key);
    if (existing !== null) {
      return existing;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}
