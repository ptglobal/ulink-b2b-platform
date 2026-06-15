import test from 'node:test';
import assert from 'node:assert/strict';

import { validateRfqPayload } from './rfq-validation';

test('rejects invalid email, empty items, and zero qty', () => {
  const result = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'not-an-email',
    phone: '+84 123 456',
    items: [{ sku: 'CR-GLV-001', qty: 0 }],
    message: 'Need quote'
  });

  assert.equal(result.ok, false);
  assert.ok(result.error.details.invalidFields);
  assert.deepEqual(result.error.details.invalidFields.email, ['INVALID_EMAIL']);
  assert.deepEqual(result.error.details.invalidFields.items, ['INVALID_QTY']);
});

test('normalizes phone and source and trims strings', () => {
  const result = validateRfqPayload({
    company: '  ACME  ',
    contact: '  Mr A  ',
    email: 'a@acme.vn',
    phone: ' (+84) 901-234-567 ',
    hub: ' 3 ',
    industry: '  Chemical  ',
    source: 'portal',
    items: [{ sku: 'CR-GLV-001', qty: 1 }]
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.company, 'ACME');
  assert.equal(result.value.contact_name, 'Mr A');
  assert.equal(result.value.phone, '+84901234567');
  assert.equal(result.value.hub, 3);
  assert.equal(result.value.industry, 'chemical');
  assert.equal(result.value.source, 'portal');
});

test('lowercases sku codes in RFQ items', () => {
  const result = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    items: [{ sku: '  CR-GLV-001  ', qty: 1 }]
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Unexpected validation failure');
  assert.deepEqual(result.value.items, [{ sku: 'cr-glv-001', qty: 1 }]);
});
