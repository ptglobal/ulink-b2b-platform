import { NextResponse } from 'next/server';
import { createItem } from '@directus/sdk';
import { directus } from '@/lib/directus';

// RFQ submission endpoint. Anti-spam is layered:
//   1. Honeypot field ("website") — bots fill it, humans don't.
//   2. Cloudflare Turnstile token verification (TODO — wire TURNSTILE_SECRET_KEY).
//   3. IP rate-limiting via Redis (TODO).
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot — silently accept to avoid signalling bots.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  // TODO: verify Turnstile token (body.token) against TURNSTILE_SECRET_KEY.
  // TODO: rate-limit by client IP using Redis.

  if (!body.company || !body.email) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 422 });
  }

  try {
    const created = await directus.request(
      createItem('rfq_requests', {
        company: String(body.company),
        contact: body.contact ? String(body.contact) : '',
        email: String(body.email),
        phone: body.phone ? String(body.phone) : undefined,
        industry: body.industry ? String(body.industry) : undefined,
        message: body.message ? String(body.message) : undefined,
        line_items: Array.isArray(body.items) ? body.items : [],
        status: 'new'
      })
    );
    return NextResponse.json({ ok: true, id: created?.id });
  } catch (err) {
    console.error('RFQ submit failed', err);
    return NextResponse.json({ error: 'submit_failed' }, { status: 502 });
  }
}
