import { createItem, readItems } from '@directus/sdk';
import { NextResponse } from 'next/server';

import { errorJson, successJson } from '@/lib/api-response-next';
import { createRfqRateLimiter, createTurnstileVerifier } from '@/lib/rfq-anti-spam';
import { publicDirectus, createWriteDirectusClient } from '@/lib/directus';
import { createRfqIdempotencyStore } from '@/lib/rfq-idempotency';
import { submitRfq } from '@/lib/rfq-submit';
import { getRedis } from '@/lib/redis';
import { proxyToDirectus, getRequestCookieHeader, getCurrentUser } from '@/lib/auth-helpers';

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

  const user = await getCurrentUser();

  try {
    const writeDirectus = createWriteDirectusClient();
    const result = await submitRfq(body, {
      ip,
      verifyTurnstile: async (token, ipAddress) => {
        if (user) {
          return true;
        }
        const verify = createTurnstileVerifier();
        return verify(token, ipAddress);
      },
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
        const created = await writeDirectus.request(
          createItem('rfq_requests', {
            ...input,
            user: user?.id || undefined
          })
        );
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

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required.' },
        { status: 401 }
      );
    }
    console.log('GET /api/rfq - Authenticated User:', user);
    const cookieHeader = getRequestCookieHeader(req);
    const response = await proxyToDirectus('/items/rfq_requests?fields=*,assigned_sales.first_name,assigned_sales.last_name,assigned_sales.email,assigned_sales.avatar&sort=-created_at,-id', {
      method: 'GET',
      cookieHeader
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Directus rfq fetch failed:', response.status, errorText);
      return NextResponse.json(
        { error: 'failed_to_fetch_rfq', message: 'Failed to fetch RFQs from Directus.' },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (err) {
    console.error('RFQ GET handler failed:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

