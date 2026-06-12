import { normalizeSkuCode } from './sku-cache';

export interface NormalizedRfqItem {
  sku: string;
  qty: number;
}

export interface NormalizedRfqPayload {
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  hub?: number;
  industry?: string;
  message?: string;
  website?: string;
  source: 'web' | 'portal';
  items: NormalizedRfqItem[];
  token?: string;
}

export type RfqValidationResult =
  | { ok: true; value: NormalizedRfqPayload }
  | {
      ok: false;
      error: {
        code: 'UNPROCESSABLE_ENTITY';
        message: string;
        details: {
          missingFields?: string[];
          invalidFields?: Record<string, string[]>;
        };
      };
    };

interface ValidationState {
  missingFields: string[];
  invalidFields: Record<string, string[]>;
}

function createState(): ValidationState {
  return {
    missingFields: [],
    invalidFields: {}
  };
}

function addMissing(state: ValidationState, field: string) {
  if (!state.missingFields.includes(field)) {
    state.missingFields.push(field);
  }
}

function addInvalid(state: ValidationState, field: string, code: string) {
  const existing = state.invalidFields[field] ?? [];
  if (!existing.includes(code)) {
    state.invalidFields[field] = [...existing, code];
  }
}

function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeSlug(value: unknown, state: ValidationState, field: 'industry'): string | undefined {
  const raw = cleanString(value);
  if (!raw) {
    return undefined;
  }

  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized) {
    addInvalid(state, field, 'INVALID_SLUG');
    return undefined;
  }

  return normalized;
}

function normalizeEmail(value: unknown, state: ValidationState): string | undefined {
  const email = cleanString(value);
  if (!email) {
    addMissing(state, 'email');
    return undefined;
  }

  const normalized = email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    addInvalid(state, 'email', 'INVALID_EMAIL');
    return undefined;
  }

  return normalized;
}

function normalizePhone(value: unknown, state: ValidationState): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    addInvalid(state, 'phone', 'INVALID_PHONE');
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!/^[0-9+\s()-]+$/.test(trimmed)) {
    addInvalid(state, 'phone', 'INVALID_PHONE');
    return undefined;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    addInvalid(state, 'phone', 'INVALID_PHONE');
    return undefined;
  }

  return trimmed.includes('+') ? `+${digits}` : digits;
}

function normalizeHub(value: unknown, state: ValidationState): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  addInvalid(state, 'hub', 'INVALID_HUB');
  return undefined;
}

function normalizeSource(value: unknown): 'web' | 'portal' {
  if (typeof value !== 'string') {
    return 'web';
  }

  return value.trim().toLowerCase() === 'portal' ? 'portal' : 'web';
}

function normalizeItems(value: unknown, state: ValidationState): NormalizedRfqItem[] | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    addMissing(state, 'items');
    return undefined;
  }

  const items: NormalizedRfqItem[] = [];
  let hasInvalidQty = false;

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      addInvalid(state, 'items', 'INVALID_ITEM');
      continue;
    }

    const rawSku = cleanString((item as Record<string, unknown>).sku);
    const rawQty = (item as Record<string, unknown>).qty;

    if (!rawSku) {
      addInvalid(state, 'items', 'INVALID_SKU');
      continue;
    }

    if (typeof rawQty !== 'number' || !Number.isInteger(rawQty) || rawQty <= 0) {
      hasInvalidQty = true;
      continue;
    }

    items.push({
      sku: normalizeSkuCode(rawSku),
      qty: rawQty
    });
  }

  if (hasInvalidQty) {
    addInvalid(state, 'items', 'INVALID_QTY');
  }

  if (items.length === 0) {
    return undefined;
  }

  return items;
}

export function validateRfqPayload(input: unknown): RfqValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: 'UNPROCESSABLE_ENTITY',
        message: 'RFQ payload is invalid.',
        details: {
          missingFields: ['company', 'email', 'items']
        }
      }
    };
  }

  const state = createState();
  const record = input as Record<string, unknown>;

  const company = cleanString(record.company);
  if (!company) {
    addMissing(state, 'company');
  }

  const email = normalizeEmail(record.email, state);
  const phone = normalizePhone(record.phone, state);
  const hub = normalizeHub(record.hub, state);
  const items = normalizeItems(record.items, state);
  const contactName = cleanString(record.contact) ?? '';
  const industry = normalizeSlug(record.industry, state, 'industry');
  const message = cleanString(record.message);
  const website = cleanString(record.website);
  const source = normalizeSource(record.source);

  if (state.missingFields.length > 0 || Object.keys(state.invalidFields).length > 0) {
    return {
      ok: false,
      error: {
        code: 'UNPROCESSABLE_ENTITY',
        message: 'RFQ payload is invalid.',
        details: {
          ...(state.missingFields.length > 0 ? { missingFields: state.missingFields } : {}),
          ...(Object.keys(state.invalidFields).length > 0
            ? { invalidFields: state.invalidFields }
            : {})
        }
      }
    };
  }

  return {
    ok: true,
    value: {
      company: company as string,
      contact_name: contactName,
      email: email as string,
      ...(phone ? { phone } : {}),
      ...(hub ? { hub } : {}),
      ...(industry ? { industry } : {}),
      ...(message ? { message } : {}),
      ...(website ? { website } : {}),
      source,
      items: items as NormalizedRfqItem[]
    }
  };
}
