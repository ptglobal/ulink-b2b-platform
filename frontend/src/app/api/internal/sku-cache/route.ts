import { errorJson, successJson } from '@/lib/api-response-next';
import { applySkuCachePlan, parseSkuCacheWebhookPayload, planSkuCacheMutation } from '@/lib/sku-cache';
import { getRedis } from '@/lib/redis';

function requireInternalToken(authorization: string | null | undefined, expected = process.env.INTERNAL_API_TOKEN) {
  if (!expected) {
    throw new Error('INTERNAL_API_TOKEN is required for SKU cache requests.');
  }

  const received = authorization?.startsWith('Bearer ') ? authorization.slice(7) : authorization ?? undefined;
  if (!received || received !== expected) {
    throw new Error('Invalid internal API token.');
  }
}

export async function POST(req: Request) {
  try {
    requireInternalToken(req.headers.get('authorization'));
  } catch (err) {
    if (err instanceof Error && err.message.includes('required')) {
      return errorJson(500, 'INTERNAL_SERVER_ERROR', 'SKU cache endpoint is not configured.');
    }

    return errorJson(403, 'FORBIDDEN', 'Invalid internal API token.');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'BAD_REQUEST', 'Request body must be valid JSON.');
  }

  const parsed = parseSkuCacheWebhookPayload(body);
  if (!parsed.ok) {
    return errorJson(400, 'BAD_REQUEST', parsed.error.message);
  }

  const plan = planSkuCacheMutation(parsed.data);

  try {
    await applySkuCachePlan(getRedis(), plan);
    return successJson({
      event: parsed.data.event,
      collection: parsed.data.collection,
      primed: plan.primedKeys,
      invalidated: plan.invalidatedKeys,
      deletedOldKeys: plan.deletedOldKeys
    });
  } catch (err) {
    console.error('SKU cache mutation failed', err);
    return errorJson(500, 'INTERNAL_SERVER_ERROR', 'Failed to update SKU cache.');
  }
}
