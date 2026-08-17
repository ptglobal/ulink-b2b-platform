export type ErpEntity = 'orders' | 'invoices' | 'deliveries';
export type ErpOperation = 'create' | 'update';

export type ErpOutboundInput = {
  entity: ErpEntity;
  op: ErpOperation;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
};

export type ErpOutboundResult = {
  shouldEnqueue: boolean;
  idempotencyKey: string;
  payload: {
    entity: ErpEntity;
    op: ErpOperation;
    changedFields: string[];
    full: Record<string, unknown>;
  };
};

const ENTITY_MEANINGFUL_FIELDS: Record<ErpEntity, Set<string>> = {
  orders: new Set(['status', 'subtotal', 'tax', 'total', 'hub', 'order_items', 'erp_ref']),
  invoices: new Set([
    'paid_status',
    'amount',
    'paid_amount',
    'balance',
    'due_date',
    'order',
    'erp_ref'
  ]),
  deliveries: new Set([
    'status',
    'hub',
    'scheduled_date',
    'delivered_date',
    'tracking_ref',
    'erp_ref'
  ])
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function valuesDiffer(left: unknown, right: unknown): boolean {
  if (Array.isArray(left) || Array.isArray(right)) {
    return JSON.stringify(left) !== JSON.stringify(right);
  }

  if (isPlainObject(left) || isPlainObject(right)) {
    return JSON.stringify(left) !== JSON.stringify(right);
  }

  return left !== right;
}

export function buildErpIdempotencyKey(input: {
  entity: ErpEntity;
  recordId: number | string;
  erpRef: string | null;
  revision: string;
}) {
  const erpRef = input.erpRef?.trim();
  if (erpRef) {
    return erpRef;
  }

  return `${input.entity}:${input.recordId}:${input.revision}`;
}

export function classifyErpResponse(status: number) {
  if (status >= 200 && status < 300) return 'sent';
  if (status >= 400 && status < 500) return 'failed';
  return 'retry';
}

export function nextErpRetryDelayMinutes(attempt: number) {
  if (attempt <= 1) return 1;
  if (attempt === 2) return 5;
  return 15;
}

export function shouldEnqueueErpEvent(input: ErpOutboundInput): ErpOutboundResult {
  const meaningfulFields = ENTITY_MEANINGFUL_FIELDS[input.entity];
  const changedFields = Object.keys(input.after).filter((key) => {
    return meaningfulFields.has(key) && valuesDiffer(input.before[key], input.after[key]);
  });

  const revision =
    typeof input.after.date_updated === 'string' && input.after.date_updated.trim()
      ? input.after.date_updated
      : typeof input.after.date_created === 'string' && input.after.date_created.trim()
        ? input.after.date_created
        : String(input.after.id ?? '');

  const idempotencyKey = buildErpIdempotencyKey({
    entity: input.entity,
    recordId: input.after.id as number | string,
    erpRef: (input.after.erp_ref as string | null | undefined) ?? null,
    revision
  });

  return {
    shouldEnqueue: input.op === 'create' ? true : changedFields.length > 0,
    idempotencyKey,
    payload: {
      entity: input.entity,
      op: input.op,
      changedFields,
      full: input.after
    }
  };
}
