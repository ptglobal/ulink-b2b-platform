import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildCommercialImportPreview,
  renderCommercialImportErrorRows,
  resolveCommercialImportKey
} from './service.js';
import { parseCommercialCsv } from './csv.js';

test('parses nested order items from the orders CSV', () => {
  const csv = [
    'erp_ref,customer_erp_ref,subtotal,tax,total,order_items_json',
    'ERP-ORD-2026-0001,ERP-CUS-1001,150000,15000,165000,"[{""sku_code"":""SKU-1"",""qty"":2,""unit_price"":50000,""line_total"":100000}]"'
  ].join('\n');

  const rows = parseCommercialCsv(csv);
  const preview = buildCommercialImportPreview('orders', rows, {
    allowPartial: false
  });

  assert.equal(preview.counts.created, 1);
  assert.equal(preview.rows[0].nested.order_items.length, 1);
  assert.equal(preview.rows[0].key, 'ERP-ORD-2026-0001');
});

test('uses erp_ref, then tax_code, then email for customers', () => {
  assert.equal(
    resolveCommercialImportKey('customers', {
      erp_ref: null,
      tax_code: ' 0102030405 ',
      email: 'buyer@acme.vn'
    }),
    '0102030405'
  );
});

test('renders downloadable error rows', () => {
  const csv = renderCommercialImportErrorRows([
    { row: 3, field: 'erp_ref', message: 'required' }
  ]);

  assert.match(csv, /row,field,message/);
  assert.match(csv, /3,erp_ref,required/);
});
