import assert from 'node:assert/strict';

import { buildCommercialImportPreview, parseCommercialCsv, renderCommercialImportErrorRows, resolveCommercialImportKey } from '../extensions/commercial-import-endpoint/src/service.js';

function runCustomerSmokeTest() {
  const rows = parseCommercialCsv([
    'erp_ref,company_name,tax_code,email,phone',
    'ERP-CUST-0001,Acme Industrial Co,0102030405,acme@example.com,0900000000'
  ].join('\n'));

  const preview = buildCommercialImportPreview('customers', rows);
  assert.equal(preview.collection, 'customers');
  assert.equal(preview.counts.created, 1);
  assert.equal(resolveCommercialImportKey('customers', rows[0]), 'ERP-CUST-0001');
}

function runOrderSmokeTest() {
  const rows = parseCommercialCsv([
    'erp_ref,code,customer_erp_ref,order_date,subtotal,tax,total,order_items_json',
    'ERP-ORD-0001,ORD-0001,ERP-CUST-0001,2026-06-12,15000000,1500000,16500000,"[{""sku_code"":""sku-gloves-nitrile-s"",""qty"":50,""unit_price"":200000,""line_total"":10000000}]"'
  ].join('\n'));

  const preview = buildCommercialImportPreview('orders', rows);
  assert.equal(preview.collection, 'orders');
  assert.equal(preview.counts.created, 1);
  assert.equal(preview.rows[0]?.nested?.order_items?.length, 1);
}

function runErrorCsvSmokeTest() {
  const csv = renderCommercialImportErrorRows([
    { row: 2, field: 'erp_ref', message: 'Required.' }
  ]);

  assert.match(csv, /row,field,message/);
  assert.match(csv, /2,erp_ref,Required\./);
}

function main() {
  runCustomerSmokeTest();
  runOrderSmokeTest();
  runErrorCsvSmokeTest();
  console.log('Commercial import smoke checks passed.');
}

main();
