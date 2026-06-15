export const COMMERCIAL_IMPORT_COLLECTIONS = ['customers', 'orders', 'invoices', 'deliveries'] as const;

export type CommercialImportCollection = (typeof COMMERCIAL_IMPORT_COLLECTIONS)[number];
export type CommercialImportMode = 'preview' | 'commit';
export type CommercialImportAction = 'created' | 'updated' | 'skipped' | 'failed';

export interface CommercialImportErrorRow {
  row: number;
  field: string;
  message: string;
}

export interface CommercialImportRow {
  row: number;
  key: string;
  action: CommercialImportAction;
  errors: CommercialImportErrorRow[];
  nested?: {
    order_items?: unknown[];
  };
}

export interface CommercialImportSummary {
  collection: CommercialImportCollection;
  mode: CommercialImportMode;
  allowPartial: boolean;
  counts: Record<CommercialImportAction, number>;
  rows: CommercialImportRow[];
  errorRows: CommercialImportErrorRow[];
  aborted?: boolean;
  committed?: boolean;
}

export interface CommercialImportSubmission {
  collection: CommercialImportCollection;
  csvText: string;
  allowPartial?: boolean;
  mode?: CommercialImportMode;
}

export interface CommercialImportCollectionMeta {
  label: string;
  description: string;
  keyHint: string;
  requiredColumns: string[];
  sampleCsv: string;
}

export const COMMERCIAL_IMPORT_COLLECTION_META: Record<CommercialImportCollection, CommercialImportCollectionMeta> = {
  customers: {
    label: 'Customers',
    description: 'Match by erp_ref first, then tax_code, then email.',
    keyHint: 'company_name + erp_ref or tax_code or email',
    requiredColumns: ['company_name', 'erp_ref', 'tax_code', 'email'],
    sampleCsv: [
      'erp_ref,company_name,tax_code,contact_name,email,phone,address,status',
      'ERP-CUST-2026-0001,Acme Industrial Co,0102030405-001,Minh Nguyen,acme@example.com,0900000000,"Lot 1, YP Industrial Park",active'
    ].join('\n')
  },
  orders: {
    label: 'Orders',
    description: 'Requires erp_ref and nested order_items_json for atomic upsert.',
    keyHint: 'erp_ref + customer reference + order_items_json',
    requiredColumns: ['erp_ref', 'customer_erp_ref', 'order_items_json'],
    sampleCsv: [
      'erp_ref,code,order_date,customer_erp_ref,subtotal,tax,total,notes,status,order_items_json',
      'ERP-ORD-2026-1001,ORD-2026-1001,2026-06-12,ERP-CUST-2026-0001,15000000,1500000,16500000,Quarterly glove restock,pending,"[{""sku_code"":""sku-gloves-nitrile-s"",""qty"":50,""unit_price"":200000,""line_total"":10000000},{""sku_code"":""sku-gloves-nitrile-m"",""qty"":25,""unit_price"":200000,""line_total"":5000000}]"'
    ].join('\n')
  },
  invoices: {
    label: 'Invoices',
    description: 'Match by erp_ref first, then code.',
    keyHint: 'erp_ref or code + customer/order reference',
    requiredColumns: ['erp_ref', 'code', 'customer_erp_ref', 'order_erp_ref'],
    sampleCsv: [
      'erp_ref,code,customer_erp_ref,order_erp_ref,issue_date,due_date,amount,paid_amount,balance,paid_status',
      'ERP-INV-2026-88001,INV-2026-0001,ERP-CUST-2026-0001,ERP-ORD-2026-1001,2026-06-12,2026-07-12,16500000,10000000,6500000,partial'
    ].join('\n')
  },
  deliveries: {
    label: 'Deliveries',
    description: 'Match by erp_ref and reference the order.',
    keyHint: 'erp_ref + order reference',
    requiredColumns: ['erp_ref', 'order_erp_ref'],
    sampleCsv: [
      'erp_ref,order_erp_ref,hub,status,scheduled_date,delivered_date,tracking_ref',
      'ERP-DLV-2026-77001,ERP-ORD-2026-1001,3,delivered,2026-06-13,2026-06-13,TRK-ULINK-20260613'
    ].join('\n')
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isCommercialImportCollection(value: unknown): value is CommercialImportCollection {
  return typeof value === 'string' && COMMERCIAL_IMPORT_COLLECTIONS.includes(value as CommercialImportCollection);
}

export function normalizeCommercialImportMode(value: unknown, fallback: CommercialImportMode = 'preview'): CommercialImportMode {
  return value === 'commit' ? 'commit' : fallback;
}

export function normalizeCommercialImportAllowPartial(value: unknown): boolean {
  return value === true || value === 'true' || value === '1';
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function escapeCsvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function buildCommercialImportErrorCsv(rows: CommercialImportErrorRow[]): string {
  const lines = ['row,field,message'];
  for (const row of rows) {
    lines.push([row.row, row.field, row.message].map((value) => escapeCsvCell(String(value))).join(','));
  }

  return lines.join('\n');
}

export function buildCommercialImportFormData(input: CommercialImportSubmission, file?: File | null): FormData {
  const formData = new FormData();
  formData.set('collection', input.collection);
  formData.set('mode', input.mode ?? 'preview');
  formData.set('allowPartial', input.allowPartial ? 'true' : 'false');
  formData.set('csvText', input.csvText);

  if (file) {
    formData.set('file', file, file.name);
  }

  return formData;
}

async function readCommercialImportCsvText(formData: FormData): Promise<string> {
  const csvText = formData.get('csvText');
  if (typeof csvText === 'string' && csvText.trim()) {
    return csvText.trim();
  }

  const file = formData.get('file');
  if (file instanceof File) {
    const text = await file.text();
    return text.trim();
  }

  return '';
}

export async function parseCommercialImportRequest(request: Request): Promise<CommercialImportSubmission> {
  const contentType = request.headers.get('content-type') ?? '';

  let body: Record<string, unknown> = {};
  let csvText = '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    body = Object.fromEntries(formData.entries());
    csvText = await readCommercialImportCsvText(formData);
  } else {
    const json = await request.json().catch(() => ({}));
    if (isRecord(json)) {
      body = json;
    }
    csvText = normalizeText(body.csvText);
  }

  const collection = body.collection;
  if (!isCommercialImportCollection(collection)) {
    throw new Error(`Unsupported commercial import collection: ${String(collection ?? '')}`);
  }

  if (!csvText) {
    throw new Error('CSV text or file is required.');
  }

  return {
    collection,
    csvText,
    allowPartial: normalizeCommercialImportAllowPartial(body.allowPartial),
    mode: normalizeCommercialImportMode(body.mode)
  };
}
