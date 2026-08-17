export interface NormalizedRfqItem {
  sku: string;
  qty: number;
  note?: string;
}

export interface NormalizedRfqPayload {
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  hub: number;
  industry: string;
  message: string;
  scheduled_delivery?: boolean;
  requested_delivery_date?: string;
  website?: string;
  source: 'web' | 'portal';
  items?: NormalizedRfqItem[];
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

function normalizeSlug(
  value: unknown,
  state: ValidationState,
  field: 'industry'
): string | undefined {
  const raw = cleanString(value);
  if (!raw) {
    addMissing(state, field);
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
    addMissing(state, 'phone');
    return undefined;
  }

  if (typeof value !== 'string') {
    addInvalid(state, 'phone', 'INVALID_PHONE');
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    addMissing(state, 'phone');
    return undefined;
  }

  if (!/^[0-9+\s()-]+$/.test(trimmed)) {
    addInvalid(state, 'phone', 'INVALID_PHONE');
    return undefined;
  }

  const rawLength = trimmed.replace(/\s/g, '').length;
  if (rawLength < 8 || rawLength > 20) {
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
    addMissing(state, 'hub');
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

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      addInvalid(state, 'items', 'INVALID_ITEM');
      continue;
    }

    const rec = item as Record<string, unknown>;
    const rawSku = cleanString(rec.sku);
    const rawNote = cleanString(rec.note);

    if (!rawSku) {
      addInvalid(state, 'items', 'INVALID_SKU');
      continue;
    }

    // Parse quantity: accept number or numeric string, default to 1
    let qty = 1;
    if (typeof rec.qty === 'number' && Number.isFinite(rec.qty) && rec.qty > 0) {
      qty = Math.floor(rec.qty);
    } else if (typeof rec.qty === 'string') {
      const parsed = parseInt(rec.qty, 10);
      if (Number.isFinite(parsed) && parsed > 0) qty = parsed;
    }

    items.push({
      sku: rawSku.trim(),
      qty,
      ...(rawNote ? { note: rawNote } : {})
    });
  }

  if (items.length === 0) {
    return undefined;
  }

  return items;
}

function normalizeScheduledDelivery(value: unknown): boolean {
  if (value === true || String(value).trim().toLowerCase() === 'true') {
    return true;
  }
  return false;
}

function normalizeDeliveryDate(
  value: unknown,
  scheduled: boolean,
  state: ValidationState
): string | undefined {
  if (!scheduled) {
    return undefined;
  }

  const raw = cleanString(value);
  if (!raw) {
    addMissing(state, 'requested_delivery_date');
    return undefined;
  }

  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    addInvalid(state, 'requested_delivery_date', 'INVALID_DATE_FORMAT');
    return undefined;
  }

  const [, yStr, mStr, dStr] = match;
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10) - 1;
  const day = parseInt(dStr, 10);

  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    addInvalid(state, 'requested_delivery_date', 'INVALID_DATE');
    return undefined;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedDate = new Date(year, month, day);
  if (parsedDate.getTime() < today.getTime()) {
    addInvalid(state, 'requested_delivery_date', 'PAST_DATE');
    return undefined;
  }

  return `${yStr}-${mStr}-${dStr}`;
}

export function validateRfqPayload(input: unknown): RfqValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      ok: false,
      error: {
        code: 'UNPROCESSABLE_ENTITY',
        message: 'RFQ payload is invalid.',
        details: {
          missingFields: ['company', 'contact', 'email', 'phone', 'hub', 'industry']
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

  const contactName = cleanString(record.contact);
  if (!contactName) {
    addMissing(state, 'contact');
  }

  const email = normalizeEmail(record.email, state);
  const phone = normalizePhone(record.phone, state);
  const address = cleanString(record.address);
  if (!address) {
    addMissing(state, 'address');
  }

  const hub = normalizeHub(record.hub, state);
  const items = Array.isArray(record.items) ? normalizeItems(record.items, state) : undefined;
  const industry = normalizeSlug(record.industry, state, 'industry');

  const message = cleanString(record.message);

  const scheduledDelivery = normalizeScheduledDelivery(record.scheduled_delivery);
  const requestedDeliveryDate = normalizeDeliveryDate(
    record.requested_delivery_date,
    scheduledDelivery,
    state
  );

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
      contact_name: contactName as string,
      email: email as string,
      phone: phone as string,
      address: address as string,
      hub: hub as number,
      industry: industry as string,
      message: message as string,
      scheduled_delivery: scheduledDelivery,
      ...(requestedDeliveryDate ? { requested_delivery_date: requestedDeliveryDate } : {}),
      ...(website ? { website } : {}),
      source,
      ...(items && items.length > 0 ? { items } : {})
    }
  };
}
