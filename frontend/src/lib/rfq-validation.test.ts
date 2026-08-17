import test from 'node:test';
import assert from 'node:assert/strict';

import { validateRfqPayload } from './rfq-validation';

test('rejects invalid email and items with missing sku', () => {
  const result = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'not-an-email',
    phone: '+84 123 456',
    address: '123 Test St',
    hub: '3',
    industry: 'Chemical',
    items: [{ sku: '', note: 'test' }],
    message: 'Need quote'
  });

  assert.equal(result.ok, false);
  assert.ok(result.error.details.invalidFields);
  assert.deepEqual(result.error.details.invalidFields.email, ['INVALID_EMAIL']);
  assert.deepEqual(result.error.details.invalidFields.items, ['INVALID_SKU']);
});

test('normalizes phone and source and trims strings', () => {
  const result = validateRfqPayload({
    company: '  ACME  ',
    contact: '  Mr A  ',
    email: 'a@acme.vn',
    phone: ' (+84) 901-234-567 ',
    address: '  123 Test St  ',
    hub: ' 3 ',
    industry: '  Chemical  ',
    message: '  Need quote  ',
    source: 'portal',
    items: [{ sku: 'CR-GLV-001', note: 'urgent' }]
  });

  assert.equal(result.ok, true);
  assert.equal(result.value.company, 'ACME');
  assert.equal(result.value.contact_name, 'Mr A');
  assert.equal(result.value.phone, '+84901234567');
  assert.equal(result.value.address, '123 Test St');
  assert.equal(result.value.hub, 3);
  assert.equal(result.value.industry, 'chemical');
  assert.equal(result.value.message, 'Need quote');
  assert.equal(result.value.source, 'portal');
});

test('preserves case of sku codes in RFQ items', () => {
  const result = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    address: '123 Test St',
    hub: 3,
    industry: 'Chemical',
    message: 'Need quote',
    items: [{ sku: '  CR-GLV-001  ' }]
  });

  assert.equal(result.ok, true);
  if (!result.ok) throw new Error('Unexpected validation failure');
  assert.deepEqual(result.value.items, [{ sku: 'CR-GLV-001', qty: 1 }]);
});

test('rejects missing address', () => {
  const result = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    hub: 3,
    industry: 'Chemical',
    items: [{ sku: 'CR-GLV-001' }],
    message: 'Need quote'
  });

  assert.equal(result.ok, false);
  assert.ok(result.error.details.missingFields);
  assert.ok(result.error.details.missingFields.includes('address'));
});

test('validates scheduled delivery fields', () => {
  // 1. Rejects if scheduled_delivery is true but requested_delivery_date is missing
  const result1 = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    address: '123 Test St',
    hub: 3,
    industry: 'Chemical',
    message: 'Need quote',
    scheduled_delivery: true,
    items: [{ sku: 'CR-GLV-001' }]
  });
  assert.equal(result1.ok, false);
  assert.ok(result1.error.details.missingFields);
  assert.ok(result1.error.details.missingFields.includes('requested_delivery_date'));

  // 2. Rejects past dates
  const result2 = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    address: '123 Test St',
    hub: 3,
    industry: 'Chemical',
    message: 'Need quote',
    scheduled_delivery: true,
    requested_delivery_date: '2020-01-01',
    items: [{ sku: 'CR-GLV-001' }]
  });
  assert.equal(result2.ok, false);
  assert.ok(result2.error.details.invalidFields);
  assert.deepEqual(result2.error.details.invalidFields.requested_delivery_date, ['PAST_DATE']);

  // 3. Rejects invalid date format
  const result3 = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    address: '123 Test St',
    hub: 3,
    industry: 'Chemical',
    message: 'Need quote',
    scheduled_delivery: true,
    requested_delivery_date: 'not-a-date',
    items: [{ sku: 'CR-GLV-001' }]
  });
  assert.equal(result3.ok, false);
  assert.ok(result3.error.details.invalidFields);
  assert.deepEqual(result3.error.details.invalidFields.requested_delivery_date, [
    'INVALID_DATE_FORMAT'
  ]);

  // 4. Accepts valid future dates
  const futureYear = new Date().getFullYear() + 1;
  const result4 = validateRfqPayload({
    company: 'ACME',
    contact: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    address: '123 Test St',
    hub: 3,
    industry: 'Chemical',
    message: 'Need quote',
    scheduled_delivery: true,
    requested_delivery_date: `${futureYear}-06-15`,
    items: [{ sku: 'CR-GLV-001' }]
  });
  assert.equal(result4.ok, true);
  if (!result4.ok) throw new Error('Unexpected validation failure');
  assert.equal(result4.value.scheduled_delivery, true);
  assert.equal(result4.value.requested_delivery_date, `${futureYear}-06-15`);
});
