import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCommercialImportErrorCsv,
  buildCommercialImportFormData,
  isCommercialImportCollection,
  normalizeCommercialImportAllowPartial,
  normalizeCommercialImportMode,
  parseCommercialImportRequest
} from './commercial-import';

test('identifies supported commercial import collections', () => {
  assert.equal(isCommercialImportCollection('customers'), true);
  assert.equal(isCommercialImportCollection('portal'), false);
});

test('builds a CSV error download with escaping', () => {
  const csv = buildCommercialImportErrorCsv([
    { row: 2, field: 'company_name', message: 'Required, must not be blank' },
    { row: 3, field: 'message', message: 'Contains "quotes"' }
  ]);

  assert.equal(
    csv,
    [
      'row,field,message',
      '2,company_name,"Required, must not be blank"',
      '3,message,"Contains ""quotes"""'
    ].join('\n')
  );
});

test('builds form data for commercial import requests', () => {
  const formData = buildCommercialImportFormData({
    collection: 'orders',
    csvText: 'erp_ref,customer_erp_ref\nERP-1,ERP-CUST-1',
    allowPartial: true,
    mode: 'commit'
  });

  assert.equal(formData.get('collection'), 'orders');
  assert.equal(formData.get('csvText'), 'erp_ref,customer_erp_ref\nERP-1,ERP-CUST-1');
  assert.equal(formData.get('allowPartial'), 'true');
  assert.equal(formData.get('mode'), 'commit');
});

test('parses commercial import requests from JSON and multipart bodies', async () => {
  const jsonRequest = new Request('http://localhost/api/import', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      collection: 'customers',
      csvText: 'erp_ref,company_name\nERP-1,Acme',
      allowPartial: 'true',
      mode: 'commit'
    })
  });

  const jsonSubmission = await parseCommercialImportRequest(jsonRequest);
  assert.deepEqual(jsonSubmission, {
    collection: 'customers',
    csvText: 'erp_ref,company_name\nERP-1,Acme',
    allowPartial: true,
    mode: 'commit'
  });

  const file = new File(['erp_ref,company_name\nERP-2,Zen'], 'customers.csv', { type: 'text/csv' });
  const formData = new FormData();
  formData.set('collection', 'customers');
  formData.set('mode', 'preview');
  formData.set('allowPartial', 'false');
  formData.set('file', file, file.name);

  const multipartRequest = new Request('http://localhost/api/import', {
    method: 'POST',
    body: formData
  });

  const multipartSubmission = await parseCommercialImportRequest(multipartRequest);
  assert.deepEqual(multipartSubmission, {
    collection: 'customers',
    csvText: 'erp_ref,company_name\nERP-2,Zen',
    allowPartial: false,
    mode: 'preview'
  });
});

test('normalizes commercial import flags', () => {
  assert.equal(normalizeCommercialImportMode('commit'), 'commit');
  assert.equal(normalizeCommercialImportMode(undefined), 'preview');
  assert.equal(normalizeCommercialImportAllowPartial('1'), true);
  assert.equal(normalizeCommercialImportAllowPartial('false'), false);
});
