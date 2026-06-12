import { parseCommercialCsv, renderCommercialImportErrorRows } from './csv.js';

const COLLECTIONS = new Set(['customers', 'orders', 'invoices', 'deliveries']);
const DELIVERY_STATUSES = new Set(['scheduled', 'in_transit', 'delivered', 'late', 'cancelled']);

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getItemsService(context, collection) {
  const { ItemsService } = context.services ?? {};
  if (!ItemsService) {
    throw new Error('Directus service classes are unavailable.');
  }

  return new ItemsService(collection, {
    schema: context.schema ?? null,
    accountability: null
  });
}

async function loadRows(service, fields) {
  const rows = await service.readByQuery({
    fields,
    limit: -1
  });

  return Array.isArray(rows) ? rows : [];
}

function indexRowsByKeys(rows, fields) {
  const map = new Map();
  for (const row of rows) {
    for (const field of fields) {
      const key = normalizeKey(row?.[field]);
      if (key) {
        map.set(key, row);
      }
    }
  }

  return map;
}

function indexRowsById(rows, idField = 'id') {
  const map = new Map();
  for (const row of rows) {
    const id = String(row?.[idField] ?? '');
    if (id) {
      map.set(id, row);
    }
  }

  return map;
}

function compareJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function parseOrderItemsJson(rawValue, errors) {
  const value = normalizeText(rawValue);
  if (!value) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    errors.push({ field: 'order_items_json', message: 'Must be valid JSON.' });
    return [];
  }

  if (!Array.isArray(parsed)) {
    errors.push({ field: 'order_items_json', message: 'Must be a JSON array.' });
    return [];
  }

  const items = [];
  parsed.forEach((item, index) => {
    if (!isRecord(item)) {
      errors.push({ field: `order_items_json[${index}]`, message: 'Each order item must be an object.' });
      return;
    }

    const skuCode = normalizeText(item.sku_code ?? item.sku ?? item.sku_erp_ref);
    const qty = toNumber(item.qty);
    const unitPrice = toNumber(item.unit_price);
    const lineTotal = toNumber(item.line_total);

    if (!skuCode) {
      errors.push({ field: `order_items_json[${index}].sku_code`, message: 'Required.' });
      return;
    }

    if (qty === null || qty < 0) {
      errors.push({ field: `order_items_json[${index}].qty`, message: 'Must be a non-negative number.' });
      return;
    }

    if (unitPrice === null || unitPrice < 0) {
      errors.push({ field: `order_items_json[${index}].unit_price`, message: 'Must be a non-negative number.' });
      return;
    }

    if (lineTotal === null || lineTotal < 0) {
      errors.push({ field: `order_items_json[${index}].line_total`, message: 'Must be a non-negative number.' });
      return;
    }

    items.push({
      sku_code: skuCode,
      description: normalizeText(item.description) || null,
      qty,
      unit_price: unitPrice,
      line_total: lineTotal
    });
  });

  return items;
}

function resolveReferenceId(row, keys, map, label, errors) {
  for (const key of keys) {
    const rawValue = normalizeText(row[key]);
    if (!rawValue) {
      continue;
    }

    const directMatch = map.get(normalizeKey(rawValue));
    if (directMatch) {
      return directMatch.id;
    }

    const numeric = Number(rawValue);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  errors.push({ field: label, message: 'Referenced record was not found.' });
  return null;
}

function normalizeCustomerRow(row, refData) {
  const errors = [];
  const payload = {
    erp_ref: normalizeText(row.erp_ref) || null,
    company_name: normalizeText(row.company_name),
    tax_code: normalizeText(row.tax_code) || null,
    contact_name: normalizeText(row.contact_name) || null,
    email: normalizeText(row.email) || null,
    phone: normalizeText(row.phone) || null,
    address: normalizeText(row.address) || null,
    sales_owner: normalizeText(row.sales_owner) || null,
    status: normalizeText(row.status) || 'active'
  };

  if (!payload.company_name) {
    errors.push({ field: 'company_name', message: 'Required.' });
  }

  if (!payload.erp_ref && !payload.tax_code && !payload.email) {
    errors.push({ field: 'erp_ref', message: 'Provide erp_ref, tax_code, or email.' });
  }

  const key = resolveCommercialImportKey('customers', row);
  const existing = key ? refData.customersByKey.get(normalizeKey(key)) ?? null : null;

  return {
    key,
    errors,
    existing,
    payload,
    comparable: {
      erp_ref: payload.erp_ref,
      company_name: payload.company_name,
      tax_code: payload.tax_code,
      contact_name: payload.contact_name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      sales_owner: payload.sales_owner,
      status: payload.status
    }
  };
}

function normalizeOrderRow(row, refData) {
  const errors = [];
  const payload = {
    erp_ref: normalizeText(row.erp_ref) || null,
    code: normalizeText(row.code) || null,
    order_date: normalizeText(row.order_date) || null,
    customer: resolveReferenceId(
      row,
      ['customer_erp_ref', 'customer_tax_code', 'customer_email', 'customer'],
      refData.customersByKey,
      'customer',
      errors
    ),
    hub: null,
    subtotal: toNumber(row.subtotal),
    tax: toNumber(row.tax),
    total: toNumber(row.total),
    notes: normalizeText(row.notes) || null,
    status: normalizeText(row.status) || 'pending'
  };

  if (!payload.erp_ref) {
    errors.push({ field: 'erp_ref', message: 'Required.' });
  }

  const hubValue = normalizeText(row.hub);
  if (hubValue) {
    const hubId = Number(hubValue);
    if (Number.isFinite(hubId)) {
      payload.hub = hubId;
    } else {
      errors.push({ field: 'hub', message: 'Must be a numeric id.' });
    }
  }

  if (payload.subtotal === null || payload.subtotal < 0) {
    errors.push({ field: 'subtotal', message: 'Must be a non-negative number.' });
  }

  if (payload.tax === null || payload.tax < 0) {
    errors.push({ field: 'tax', message: 'Must be a non-negative number.' });
  }

  if (payload.total === null || payload.total < 0) {
    errors.push({ field: 'total', message: 'Must be a non-negative number.' });
  }

  const nested = {
    order_items: parseOrderItemsJson(row.order_items_json, errors)
  };

  const key = resolveCommercialImportKey('orders', row);
  const existing = key ? refData.ordersByKey.get(normalizeKey(key)) ?? null : null;
  const existingItems = existing ? refData.orderItemsByOrderId.get(String(existing.id)) ?? [] : [];

  return {
    key,
    errors,
    existing,
    payload,
    nested,
    comparable: {
      erp_ref: payload.erp_ref,
      code: payload.code,
      customer: payload.customer,
      order_date: payload.order_date,
      hub: payload.hub,
      subtotal: payload.subtotal,
      tax: payload.tax,
      total: payload.total,
      notes: payload.notes,
      status: payload.status,
      order_items: nested.order_items,
      existing_items: existingItems.map((item) => ({
        sku_code: refData.productSkusById.get(String(item.sku))?.sku_code ?? String(item.sku ?? ''),
        description: normalizeText(item.description) || null,
        qty: toNumber(item.qty),
        unit_price: toNumber(item.unit_price),
        line_total: toNumber(item.line_total)
      }))
    }
  };
}

function normalizeInvoiceRow(row, refData) {
  const errors = [];
  const payload = {
    erp_ref: normalizeText(row.erp_ref) || null,
    code: normalizeText(row.code) || null,
    customer: resolveReferenceId(
      row,
      ['customer_erp_ref', 'customer_tax_code', 'customer_email', 'customer'],
      refData.customersByKey,
      'customer',
      errors
    ),
    order: resolveReferenceId(
      row,
      ['order_erp_ref', 'order_code', 'order'],
      refData.ordersByKey,
      'order',
      errors
    ),
    issue_date: normalizeText(row.issue_date) || null,
    due_date: normalizeText(row.due_date) || null,
    amount: toNumber(row.amount),
    paid_amount: toNumber(row.paid_amount),
    balance: toNumber(row.balance),
    paid_status: normalizeText(row.paid_status) || 'unpaid'
  };

  if (!payload.erp_ref && !payload.code) {
    errors.push({ field: 'erp_ref', message: 'Provide erp_ref or code.' });
  }

  if (payload.amount === null || payload.amount < 0) {
    errors.push({ field: 'amount', message: 'Must be a non-negative number.' });
  }

  if (payload.paid_amount !== null && payload.paid_amount < 0) {
    errors.push({ field: 'paid_amount', message: 'Must be a non-negative number.' });
  }

  if (payload.balance !== null && payload.balance < 0) {
    errors.push({ field: 'balance', message: 'Must be a non-negative number.' });
  }

  const key = resolveCommercialImportKey('invoices', row);
  const existing = key ? refData.invoicesByKey.get(normalizeKey(key)) ?? null : null;

  return {
    key,
    errors,
    existing,
    payload,
    comparable: payload
  };
}

function normalizeDeliveryRow(row, refData) {
  const errors = [];
  const payload = {
    erp_ref: normalizeText(row.erp_ref) || null,
    order: resolveReferenceId(
      row,
      ['order_erp_ref', 'order_code', 'order'],
      refData.ordersByKey,
      'order',
      errors
    ),
    hub: null,
    scheduled_date: normalizeText(row.scheduled_date) || null,
    delivered_date: normalizeText(row.delivered_date) || null,
    status: normalizeText(row.status) || 'scheduled',
    tracking_ref: normalizeText(row.tracking_ref) || null
  };

  if (!payload.erp_ref) {
    errors.push({ field: 'erp_ref', message: 'Required.' });
  }

  const hubValue = normalizeText(row.hub);
  if (hubValue) {
    const hubId = Number(hubValue);
    if (Number.isFinite(hubId)) {
      payload.hub = hubId;
    } else {
      errors.push({ field: 'hub', message: 'Must be a numeric id.' });
    }
  }

  if (!DELIVERY_STATUSES.has(payload.status)) {
    errors.push({ field: 'status', message: 'Must be a valid delivery status.' });
  }

  const key = resolveCommercialImportKey('deliveries', row);
  const existing = key ? refData.deliveriesByKey.get(normalizeKey(key)) ?? null : null;

  return {
    key,
    errors,
    existing,
    payload,
    comparable: payload
  };
}

function normalizeImportRow(collection, row, refData) {
  if (collection === 'customers') {
    return normalizeCustomerRow(row, refData);
  }

  if (collection === 'orders') {
    return normalizeOrderRow(row, refData);
  }

  if (collection === 'invoices') {
    return normalizeInvoiceRow(row, refData);
  }

  if (collection === 'deliveries') {
    return normalizeDeliveryRow(row, refData);
  }

  throw new Error(`Unsupported commercial import collection: ${collection}`);
}

function buildComparableExisting(collection, existing, refData) {
  if (!existing) {
    return null;
  }

  if (collection === 'customers') {
    return {
      erp_ref: normalizeText(existing.erp_ref) || null,
      company_name: normalizeText(existing.company_name) || null,
      tax_code: normalizeText(existing.tax_code) || null,
      contact_name: normalizeText(existing.contact_name) || null,
      email: normalizeText(existing.email) || null,
      phone: normalizeText(existing.phone) || null,
      address: normalizeText(existing.address) || null,
      sales_owner: normalizeText(existing.sales_owner) || null,
      status: normalizeText(existing.status) || 'active'
    };
  }

  if (collection === 'orders') {
    const orderItems = refData.orderItemsByOrderId.get(String(existing.id)) ?? [];
    return {
      erp_ref: normalizeText(existing.erp_ref) || null,
      code: normalizeText(existing.code) || null,
      customer: existing.customer ?? null,
      order_date: normalizeText(existing.order_date) || null,
      hub: existing.hub ?? null,
      subtotal: toNumber(existing.subtotal),
      tax: toNumber(existing.tax),
      total: toNumber(existing.total),
      notes: normalizeText(existing.notes) || null,
      status: normalizeText(existing.status) || 'pending',
      order_items: orderItems.map((item) => ({
        sku_code: refData.productSkusById.get(String(item.sku))?.sku_code ?? String(item.sku ?? ''),
        description: normalizeText(item.description) || null,
        qty: toNumber(item.qty),
        unit_price: toNumber(item.unit_price),
        line_total: toNumber(item.line_total)
      }))
    };
  }

  if (collection === 'invoices') {
    return {
      erp_ref: normalizeText(existing.erp_ref) || null,
      code: normalizeText(existing.code) || null,
      customer: existing.customer ?? null,
      order: existing.order ?? null,
      issue_date: normalizeText(existing.issue_date) || null,
      due_date: normalizeText(existing.due_date) || null,
      amount: toNumber(existing.amount),
      paid_amount: toNumber(existing.paid_amount),
      balance: toNumber(existing.balance),
      paid_status: normalizeText(existing.paid_status) || 'unpaid'
    };
  }

  return {
    erp_ref: normalizeText(existing.erp_ref) || null,
    order: existing.order ?? null,
    hub: existing.hub ?? null,
    scheduled_date: normalizeText(existing.scheduled_date) || null,
    delivered_date: normalizeText(existing.delivered_date) || null,
    status: normalizeText(existing.status) || 'scheduled',
    tracking_ref: normalizeText(existing.tracking_ref) || null
  };
}

function determineAction(collection, normalized, refData) {
  if (normalized.errors.length > 0) {
    return 'failed';
  }

  const existingComparable = buildComparableExisting(collection, normalized.existing, refData);
  if (!existingComparable) {
    return 'created';
  }

  return compareJson(existingComparable, normalized.comparable) ? 'skipped' : 'updated';
}

async function loadReferenceData(context) {
  const customersService = getItemsService(context, 'customers');
  const ordersService = getItemsService(context, 'orders');
  const invoicesService = getItemsService(context, 'invoices');
  const deliveriesService = getItemsService(context, 'deliveries');
  const orderItemsService = getItemsService(context, 'order_items');
  const productSkusService = getItemsService(context, 'product_skus');

  const [customers, orders, invoices, deliveries, orderItems, productSkus] = await Promise.all([
    loadRows(customersService, ['id', 'erp_ref', 'tax_code', 'email', 'company_name', 'contact_name', 'phone', 'address', 'sales_owner', 'status']),
    loadRows(ordersService, ['id', 'erp_ref', 'code', 'customer', 'order_date', 'hub', 'subtotal', 'tax', 'total', 'notes', 'status']),
    loadRows(invoicesService, ['id', 'erp_ref', 'code', 'customer', 'order', 'issue_date', 'due_date', 'amount', 'paid_amount', 'balance', 'paid_status']),
    loadRows(deliveriesService, ['id', 'erp_ref', 'order', 'hub', 'scheduled_date', 'delivered_date', 'status', 'tracking_ref']),
    loadRows(orderItemsService, ['id', 'order', 'sku', 'description', 'qty', 'unit_price', 'line_total']),
    loadRows(productSkusService, ['id', 'sku_code'])
  ]);

  return {
    customersByKey: indexRowsByKeys(customers, ['erp_ref', 'tax_code', 'email']),
    ordersByKey: indexRowsByKeys(orders, ['erp_ref', 'code']),
    invoicesByKey: indexRowsByKeys(invoices, ['erp_ref', 'code']),
    deliveriesByKey: indexRowsByKeys(deliveries, ['erp_ref']),
    productSkusByCode: indexRowsByKeys(productSkus, ['sku_code']),
    productSkusById: indexRowsById(productSkus),
    orderItemsByOrderId: orderItems.reduce((map, item) => {
      const orderId = String(item.order ?? '');
      if (!map.has(orderId)) {
        map.set(orderId, []);
      }
      map.get(orderId).push(item);
      return map;
    }, new Map())
  };
}

export function resolveCommercialImportKey(collection, row) {
  if (collection === 'customers') {
    return normalizeText(row.erp_ref) || normalizeText(row.tax_code) || normalizeText(row.email) || '';
  }

  if (collection === 'invoices') {
    return normalizeText(row.erp_ref) || normalizeText(row.code) || '';
  }

  return normalizeText(row.erp_ref) || '';
}

export function buildCommercialImportPreview(collection, rows, options = {}) {
  if (!COLLECTIONS.has(collection)) {
    throw new Error(`Unsupported commercial import collection: ${collection}`);
  }

  const previewRows = [];
  const counts = { created: 0, updated: 0, skipped: 0, failed: 0 };

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const errors = [];
    const key = resolveCommercialImportKey(collection, row);

    if (collection === 'customers') {
      if (!normalizeText(row.company_name)) {
        errors.push({ field: 'company_name', message: 'Required.' });
      }
      if (!key) {
        errors.push({ field: 'erp_ref', message: 'Provide erp_ref, tax_code, or email.' });
      }
    } else if (collection === 'orders') {
      if (!normalizeText(row.erp_ref)) {
        errors.push({ field: 'erp_ref', message: 'Required.' });
      }
      if (!normalizeText(row.customer_erp_ref) && !normalizeText(row.customer_tax_code) && !normalizeText(row.customer_email) && !normalizeText(row.customer)) {
        errors.push({ field: 'customer', message: 'Required.' });
      }
      parseOrderItemsJson(row.order_items_json, errors);
    } else if (collection === 'invoices') {
      if (!normalizeText(row.erp_ref) && !normalizeText(row.code)) {
        errors.push({ field: 'erp_ref', message: 'Provide erp_ref or code.' });
      }
      if (!normalizeText(row.customer_erp_ref) && !normalizeText(row.customer_tax_code) && !normalizeText(row.customer_email) && !normalizeText(row.customer)) {
        errors.push({ field: 'customer', message: 'Required.' });
      }
      if (!normalizeText(row.order_erp_ref) && !normalizeText(row.order_code) && !normalizeText(row.order)) {
        errors.push({ field: 'order', message: 'Required.' });
      }
    } else if (collection === 'deliveries') {
      if (!normalizeText(row.erp_ref)) {
        errors.push({ field: 'erp_ref', message: 'Required.' });
      }
      if (!normalizeText(row.order_erp_ref) && !normalizeText(row.order_code) && !normalizeText(row.order)) {
        errors.push({ field: 'order', message: 'Required.' });
      }
      if (!DELIVERY_STATUSES.has(normalizeText(row.status) || 'scheduled')) {
        errors.push({ field: 'status', message: 'Must be a valid delivery status.' });
      }
    }

    const action = errors.length > 0 ? 'failed' : 'created';
    counts[action] += 1;
    previewRows.push({
      row: rowNumber,
      key,
      action,
      errors,
      nested: {
        order_items: collection === 'orders' ? parseOrderItemsJson(row.order_items_json, []) : []
      }
    });
  });

  return {
    collection,
    mode: 'preview',
    allowPartial: Boolean(options.allowPartial),
    counts,
    rows: previewRows,
    errorRows: previewRows.flatMap((item) =>
      item.errors.map((error) => ({
        row: item.row,
        field: error.field,
        message: error.message
      }))
    )
  };
}

async function rollbackOrderItems(orderItemsService, orderId, orderItemsSnapshot) {
  const current = await orderItemsService.readByQuery({
    filter: { order: { _eq: orderId } },
    fields: ['id'],
    limit: -1
  });

  for (const row of Array.isArray(current) ? current : []) {
    await orderItemsService.deleteOne(row.id).catch(() => {});
  }

  for (const item of orderItemsSnapshot) {
    await orderItemsService.createOne({
      order: orderId,
      sku: item.sku,
      description: item.description,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.line_total
    }).catch(() => {});
  }
}

async function commitSimpleRow(context, collection, normalized) {
  const service = getItemsService(context, collection);
  const existing = normalized.existing;
  const original = existing ? structuredClone(existing) : null;

  if (!existing) {
    const created = await service.createOne(normalized.payload);
    const id = created?.id ?? created;
    return {
      status: 'created',
      rollback: async () => {
        await service.deleteOne(id).catch(() => {});
      }
    };
  }

  await service.updateOne(existing.id, normalized.payload);
  return {
    status: 'updated',
    rollback: async () => {
      await service.updateOne(existing.id, original).catch(() => {});
    }
  };
}

async function commitOrderRow(context, normalized, refData) {
  const orderService = getItemsService(context, 'orders');
  const orderItemsService = getItemsService(context, 'order_items');
  const existing = normalized.existing;
  const originalOrder = existing ? structuredClone(existing) : null;
  const originalItems = existing ? (refData.orderItemsByOrderId.get(String(existing.id)) ?? []).map((item) => ({ ...item })) : [];
  const createdItemIds = [];

  let orderId;
  if (!existing) {
    const created = await orderService.createOne(normalized.payload);
    orderId = created?.id ?? created;
  } else {
    await orderService.updateOne(existing.id, normalized.payload);
    orderId = existing.id;
  }

  try {
    for (const item of normalized.comparable.order_items) {
      const skuRecord = refData.productSkusByCode.get(normalizeKey(item.sku_code));
      if (!skuRecord) {
        throw new Error(`Unknown SKU code: ${item.sku_code}`);
      }

      const created = await orderItemsService.createOne({
        order: orderId,
        sku: skuRecord.id,
        description: item.description,
        qty: item.qty,
        unit_price: item.unit_price,
        line_total: item.line_total
      });
      createdItemIds.push(created?.id ?? created);
    }

    if (existing) {
      for (const oldItem of originalItems) {
        await orderItemsService.deleteOne(oldItem.id).catch(() => {});
      }
    }
  } catch (error) {
    for (const id of createdItemIds.reverse()) {
      await orderItemsService.deleteOne(id).catch(() => {});
    }

    if (existing) {
      await orderService.updateOne(existing.id, originalOrder).catch(() => {});
      await rollbackOrderItems(orderItemsService, existing.id, originalItems);
    } else {
      await orderService.deleteOne(orderId).catch(() => {});
    }

    throw error;
  }

  return {
    status: existing ? 'updated' : 'created',
    rollback: async () => {
      for (const id of createdItemIds.reverse()) {
        await orderItemsService.deleteOne(id).catch(() => {});
      }

      if (existing) {
        await orderService.updateOne(existing.id, originalOrder).catch(() => {});
        await rollbackOrderItems(orderItemsService, existing.id, originalItems);
      } else {
        await orderService.deleteOne(orderId).catch(() => {});
      }
    }
  };
}

async function commitNormalizedRow(context, collection, normalized, refData) {
  if (collection === 'orders') {
    return commitOrderRow(context, normalized, refData);
  }

  if (collection === 'customers' || collection === 'invoices' || collection === 'deliveries') {
    return commitSimpleRow(context, collection, normalized);
  }

  throw new Error(`Unsupported commercial import collection: ${collection}`);
}

function summarizePlans(collection, plans, allowPartial, mode) {
  const counts = { created: 0, updated: 0, skipped: 0, failed: 0 };

  for (const plan of plans) {
    counts[plan.action] += 1;
  }

  const rows = plans.map((plan) => ({
    row: plan.row,
    key: plan.key,
    action: plan.action,
    errors: plan.errors,
    nested: plan.nested
  }));

  return {
    collection,
    mode,
    allowPartial,
    counts,
    rows,
    errorRows: rows.flatMap((item) =>
      item.errors.map((error) => ({
        row: item.row,
        field: error.field,
        message: error.message
      }))
    )
  };
}

function planRows(collection, rawRows, refData) {
  return rawRows.map((row, index) => {
    const normalized = normalizeImportRow(collection, row, refData);
    const action = determineAction(collection, normalized, refData);

    return {
      row: index + 2,
      key: normalized.key,
      action,
      errors: normalized.errors,
      nested: collection === 'orders' ? normalized.nested : { order_items: [] },
      normalized
    };
  });
}

export async function runCommercialImport(context, input) {
  if (!COLLECTIONS.has(input.collection)) {
    throw new Error(`Unsupported commercial import collection: ${input.collection}`);
  }

  const rawRows = parseCommercialCsv(input.csvText);
  const refData = await loadReferenceData(context);
  const plans = planRows(input.collection, rawRows, refData);

  if (input.mode === 'preview') {
    return summarizePlans(input.collection, plans, Boolean(input.allowPartial), 'preview');
  }

  const result = summarizePlans(input.collection, plans, Boolean(input.allowPartial), 'commit');
  if (result.errorRows.length > 0 && !input.allowPartial) {
    result.aborted = true;
    return result;
  }

  const committed = [];
  try {
    for (const plan of plans) {
      if (plan.action === 'failed') {
        continue;
      }

      if (plan.action === 'skipped') {
        continue;
      }

      const commit = await commitNormalizedRow(context, input.collection, plan.normalized, refData);
      committed.push(commit);
      result.committed = true;
    }

    return result;
  } catch (error) {
    if (!input.allowPartial) {
      for (const commit of committed.reverse()) {
        await commit.rollback().catch(() => {});
      }
      result.aborted = true;
      return result;
    }

    throw error;
  }
}

export { parseCommercialCsv, renderCommercialImportErrorRows };
