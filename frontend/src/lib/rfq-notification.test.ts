import test from 'node:test';
import assert from 'node:assert/strict';

import { buildRfqSummaryEmail, resolveRfqAssignment } from './rfq-notification';

test('routes by exact hub and industry match first', () => {
  const result = resolveRfqAssignment({
    rfq: {
      id: 123,
      company: 'ACME',
      contact_name: 'Mr A',
      email: 'a@acme.vn',
      phone: '+84901234567',
      hub: { id: 3, name: 'South Hub', slug: 'south-hub' },
      industry: 'Chemical',
      message: 'Need quote',
      line_items: [{ sku: 'cr-glv-001', qty: 1 }],
      source: 'web'
    },
    rules: [
      {
        id: 7,
        hub: { id: 3, name: 'South Hub', slug: 'south-hub' },
        industry: { id: 11, name: 'Chemical', slug: 'chemical' },
        assigned_sales: {
          id: 'sales-a-id',
          email: 'sales-a@example.com',
          first_name: 'Sales',
          last_name: 'A'
        },
        priority: 10,
        is_default: false
      }
    ],
    siteSettings: { contact_email: 'contact@ulink.com' }
  });

  assert.equal(result.assignedSalesId, 'sales-a-id');
  assert.equal(result.assignedSalesEmail, 'sales-a@example.com');
  assert.equal(result.notifyTo, 'sales-a@example.com');
  assert.equal(result.fallbackUsed, false);
  assert.equal(result.matchedRuleId, 7);
});

test('falls back to the sales inbox when no rule matches', () => {
  const result = resolveRfqAssignment({
    rfq: {
      id: 123,
      company: 'ACME',
      contact_name: 'Mr A',
      email: 'a@acme.vn',
      phone: '+84901234567',
      hub: null,
      industry: 'chemical',
      message: 'Need quote',
      line_items: [{ sku: 'cr-glv-001', qty: 1 }],
      source: 'web'
    },
    rules: [],
    siteSettings: { contact_email: 'contact@ulink.com' }
  });

  assert.equal(result.assignedSalesId, null);
  assert.equal(result.assignedSalesEmail, null);
  assert.equal(result.notifyTo, 'contact@ulink.com');
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.matchedRuleId, null);
});

test('builds a summary email with the Directus admin link', () => {
  const email = buildRfqSummaryEmail({
    baseUrl: 'https://cms.ulink.vn',
    rfqId: 123,
    company: 'ACME',
    contactName: 'Mr A',
    email: 'a@acme.vn',
    phone: '+84901234567',
    hubName: 'South Hub',
    industryName: 'Chemical',
    message: 'Need quote',
    lineItems: [{ sku: 'cr-glv-001', qty: 1 }],
    assignedSales: {
      id: 'sales-a-id',
      email: 'sales-a@example.com',
      first_name: 'Sales',
      last_name: 'A'
    }
  });

  assert.match(email.subject, /RFQ #123/);
  assert.match(email.text, /South Hub/);
  assert.match(email.text, /Chemical/);
  assert.match(email.text, /cms\.ulink\.vn\/admin\/content\/rfq_requests\/123/);
  assert.match(email.text, /Sales A/);
});
