import { revalidatePath, revalidateTag } from 'next/cache';

import { errorJson, successJson } from '@/lib/api-response-next';
import {
  parsePublishWebhookPayload,
  requireRevalidateSecret,
  resolveRevalidationTargets
} from '@/lib/content-revalidation';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');

  try {
    requireRevalidateSecret(auth, process.env.REVALIDATE_SECRET);
  } catch {
    return errorJson(403, 'FORBIDDEN', 'Invalid webhook secret.');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'BAD_REQUEST', 'Request body must be valid JSON.');
  }

  const parsed = parsePublishWebhookPayload(body);
  if (!parsed.ok) {
    return errorJson(400, 'BAD_REQUEST', parsed.error.message);
  }

  const targets = resolveRevalidationTargets(parsed.data);

  for (const tag of targets.tags) {
    revalidateTag(tag);
  }

  for (const path of targets.paths) {
    revalidatePath(path);
  }

  return successJson({
    event: parsed.data.event,
    collection: parsed.data.collection,
    revalidated: targets
  });
}
