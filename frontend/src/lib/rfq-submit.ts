import { createHash } from 'node:crypto';

import { assertRfqSkusExist } from './rfq-sku';
import { enforceRfqAntiSpam } from './rfq-anti-spam';
import { validateRfqPayload } from './rfq-validation';

type CreateRfqInput = {
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry?: string;
  message?: string;
  line_items: Array<{ sku: string; qty: number }>;
  status: 'new';
  source: 'web' | 'portal';
};

export interface SubmitRfqDeps {
  ip: string;
  verifyTurnstile: (token: string, ip: string) => Promise<boolean>;
  rateLimit: (ip: string) => Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }>;
  reserveFingerprint: (fingerprint: string) => Promise<{ ok: true } | { ok: false }>;
  fetchSkus: (skus: string[]) => Promise<Array<{ sku_code: string }>>;
  createRfq: (input: CreateRfqInput) => Promise<{ id: number | string }>;
}

export type SubmitRfqResult =
  | { ok: true; data: { id: number | string } }
  | { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeToken(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function createFingerprint(input: {
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  message?: string;
  source: 'web' | 'portal';
  items: Array<{ sku: string; qty: number }>;
}) {
  const payload = {
    company: input.company,
    email: input.email,
    phone: input.phone ?? '',
    industry: input.industry ?? '',
    message: input.message ?? '',
    source: input.source,
    items: [...input.items]
      .map((item) => ({ sku: item.sku, qty: item.qty }))
      .sort((a, b) => a.sku.localeCompare(b.sku) || a.qty - b.qty)
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function mapValidationError(error: {
  code: 'UNPROCESSABLE_ENTITY';
  message: string;
  details: {
    missingFields?: string[];
    invalidFields?: Record<string, string[]>;
  };
}) {
  return {
    ok: false as const,
    error
  };
}

export async function submitRfq(body: unknown, deps: SubmitRfqDeps): Promise<SubmitRfqResult> {
  if (!isRecord(body)) {
    return {
      ok: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Request body must be valid JSON.'
      }
    };
  }

  const validation = validateRfqPayload(body);
  if (!validation.ok) {
    return mapValidationError(validation.error);
  }

  const token = normalizeToken(body.token);
  const fingerprint = createFingerprint(validation.value);

  const antiSpam = await enforceRfqAntiSpam(
    {
      token,
      ip: deps.ip,
      fingerprint
    },
    {
      verifyTurnstile: deps.verifyTurnstile,
      rateLimit: deps.rateLimit,
      reserveFingerprint: deps.reserveFingerprint
    }
  );

  if (!antiSpam.ok) {
    return {
      ok: false,
      error: antiSpam.error
    };
  }

  const skuCheck = await assertRfqSkusExist(validation.value.items, {
    fetchSkus: deps.fetchSkus
  });

  if (!skuCheck.ok) {
    return {
      ok: false,
      error: skuCheck.error
    };
  }

  try {
    const created = await deps.createRfq({
      company: validation.value.company,
      contact_name: validation.value.contact_name,
      email: validation.value.email,
      ...(validation.value.phone ? { phone: validation.value.phone } : {}),
      ...(validation.value.industry ? { industry: validation.value.industry } : {}),
      ...(validation.value.message ? { message: validation.value.message } : {}),
      line_items: skuCheck.value,
      status: 'new',
      source: validation.value.source === 'portal' ? 'portal' : 'web'
    });

    return {
      ok: true,
      data: {
        id: created.id
      }
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('DIRECTUS_TOKEN is required')) {
      return {
        ok: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'RFQ submission is not configured.'
        }
      };
    }

    return {
      ok: false,
      error: {
        code: 'BAD_GATEWAY',
        message: 'Failed to submit RFQ.'
      }
    };
  }
}
