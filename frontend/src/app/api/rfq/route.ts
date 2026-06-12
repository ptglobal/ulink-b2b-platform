import { createItem, readItems } from '@directus/sdk';

import { errorJson, successJson } from '@/lib/api-response-next';
import { createRfqRateLimiter, createTurnstileVerifier } from '@/lib/rfq-anti-spam';
import { publicDirectus, createWriteDirectusClient } from '@/lib/directus';
import { createRfqIdempotencyStore } from '@/lib/rfq-idempotency';
import { submitRfq } from '@/lib/rfq-submit';
import { getRedis } from '@/lib/redis';

function getClientIp(req: Request): string {
  const headers = req.headers;
  const direct = headers.get('cf-connecting-ip') ?? headers.get('x-real-ip');
  if (direct) {
    return direct.trim();
  }

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || '127.0.0.1';
  }

  return '127.0.0.1';
}

function statusFromErrorCode(code: string): number {
  switch (code) {
    case 'BAD_REQUEST':
      return 400;
    case 'UNPROCESSABLE_ENTITY':
      return 422;
    case 'FORBIDDEN':
      return 403;
    case 'CONFLICT':
      return 409;
    case 'TOO_MANY_REQUESTS':
      return 429;
    case 'INTERNAL_SERVER_ERROR':
      return 500;
    case 'BAD_GATEWAY':
      return 502;
    default:
      return 500;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'BAD_REQUEST', 'Request body must be valid JSON.');
  }

  const ip = getClientIp(req);
  const redis = getRedis();
  const idempotencyStore = createRfqIdempotencyStore(redis);

  try {
    const writeDirectus = createWriteDirectusClient();
    const result = await submitRfq(body, {
      ip,
      verifyTurnstile: createTurnstileVerifier(),
      rateLimit: createRfqRateLimiter(redis),
      fetchSkus: async (skus: string[]) => {
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
      },
      getExistingRfqId: (key: string) => idempotencyStore.getExistingRfqId(key),
      reserveIdempotencyKey: (key: string) => idempotencyStore.reserveIdempotencyKey(key),
      saveIdempotencyKey: (key: string, rfqId: number | string) =>
        idempotencyStore.saveIdempotencyKey(key, rfqId),
      createRfq: async (input) => {
        const created = await writeDirectus.request(createItem('rfq_requests', input));
        return { id: (created as { id: number | string }).id };
      }
    });

    if (result.ok) {
      return successJson({ id: result.data.id });
    }

    return errorJson(
      statusFromErrorCode(result.error.code),
      result.error.code,
      result.error.message,
      result.error.details
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('DIRECTUS_TOKEN is required')) {
      return errorJson(500, 'INTERNAL_SERVER_ERROR', 'RFQ submission is not configured.');
    }

    console.error('RFQ submit failed', err);
    return errorJson(502, 'BAD_GATEWAY', 'Failed to submit RFQ.');
  }
}
