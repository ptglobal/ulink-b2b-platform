import { createItem } from '@directus/sdk';
import { errorJson, successJson } from '@/lib/api-response-next';
import { directus } from '@/lib/directus';

// RFQ submission endpoint. Anti-spam is layered:
//   1. Honeypot field ("website") - bots fill it, humans don't.
//   2. Cloudflare Turnstile token verification (TODO - wire TURNSTILE_SECRET_KEY).
//   3. IP rate-limiting via Redis (TODO).
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'BAD_REQUEST', 'Request body must be valid JSON.');
  }

  // Honeypot: silently accept to avoid signalling bots.
  if (body.website) {
    return successJson({ accepted: true });
  }

  // TODO: verify Turnstile token (body.token) against TURNSTILE_SECRET_KEY.
  // TODO: rate-limit by client IP using Redis.

  const missingFields = ['company', 'email'].filter((field) => !body[field]);
  if (missingFields.length > 0) {
    return errorJson(422, 'UNPROCESSABLE_ENTITY', 'Missing required RFQ fields.', {
      missingFields
    });
  }

  try {
    const created = await directus.request(
      createItem('rfq_requests', {
        company: String(body.company),
        contact_name: body.contact ? String(body.contact) : '',
        email: String(body.email),
        phone: body.phone ? String(body.phone) : undefined,
        industry: body.industry ? String(body.industry) : undefined,
        message: body.message ? String(body.message) : undefined,
        line_items: Array.isArray(body.items) ? body.items : [],
        status: 'new'
      })
    );

    return successJson({ id: created?.id });
  } catch (err) {
    console.error('RFQ submit failed', err);
    return errorJson(502, 'BAD_GATEWAY', 'Failed to submit RFQ.');
  }
}
