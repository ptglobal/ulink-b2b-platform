import { createItem } from '@directus/sdk';
import { directus } from '@/lib/directus';
import { handleRoute, jsonOk } from '@/lib/route-helpers';
import { rfqSchema, type RfqInput } from '@/lib/validators';

// RFQ submission endpoint. Anti-spam is layered:
//   1. Honeypot field ("website") — bots fill it, humans don't.
//   2. Cloudflare Turnstile token verification (TODO — wire TURNSTILE_SECRET_KEY).
//   3. IP rate-limiting via Redis (TODO).
export async function POST(req: Request) {
  // Honeypot check — peek at raw body trước khi validate schema
  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    const { jsonErrorRaw } = await import('@/lib/route-helpers');
    return jsonErrorRaw(400, 'invalid_json', 'Request body must be valid JSON');
  }

  // Silently accept to avoid signalling bots
  if (raw.website) {
    return jsonOk({ ok: true });
  }

  // TODO: verify Turnstile token (raw.token) against TURNSTILE_SECRET_KEY.
  // TODO: rate-limit by client IP using Redis.

  // Validate with schema
  const result = rfqSchema.safeParse(raw);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || '_root';
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    const { jsonErrorRaw } = await import('@/lib/route-helpers');
    return jsonErrorRaw(422, 'validation_error', 'Input validation failed', details);
  }

  const data: RfqInput = result.data;

  try {
    const created = await directus.request(
      createItem('rfq_requests', {
        company: data.company,
        contact: data.contact,
        email: data.email,
        phone: data.phone ?? undefined,
        industry: data.industry ?? undefined,
        message: data.message ?? undefined,
        line_items: data.items,
        status: 'new'
      })
    );
    return jsonOk({ ok: true, id: created?.id });
  } catch (err) {
    console.error('RFQ submit failed', err);
    const { ApiError } = await import('@/lib/api-error');
    throw new ApiError(502, 'submit_failed', 'Could not submit RFQ');
  }
}
