import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { createItem, deleteItem, readItems, readSingleton } from '@directus/sdk';
import {
  createDirectusClient,
  loginAdmin,
  DIRECTUS_ADMIN_EMAIL,
  DIRECTUS_ADMIN_PASSWORD,
  DIRECTUS_URL
} from './config.mjs';

const internalToken = process.env.INTERNAL_API_TOKEN;
const mailpitUrl = process.env.MAILPIT_URL ?? 'http://localhost:8025';
const adminClient = createDirectusClient();
const salesEmail = 'sales-rbac@example.com';
const salesPassword = 'sales-password-123';
const { POST: postRfqNotify } = await import(
  new URL('../frontend/src/app/api/internal/rfq-notify/route.ts', import.meta.url)
);

if (!internalToken) {
  throw new Error('INTERNAL_API_TOKEN is required for RFQ notification verification.');
}

function normalizeMessageList(payload) {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.messages)) {
    return payload.messages;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
}

function normalizeRecipient(entry) {
  if (typeof entry === 'string') {
    return entry;
  }

  return entry?.address ?? entry?.email ?? entry?.Address ?? entry?.Email ?? '';
}

function getRecipients(message) {
  return [
    ...(Array.isArray(message?.To) ? message.To : []),
    ...(Array.isArray(message?.to) ? message.to : []),
    ...(Array.isArray(message?.recipients?.to) ? message.recipients.to : []),
    ...(Array.isArray(message?.envelope?.to) ? message.envelope.to : [])
  ]
    .map(normalizeRecipient)
    .filter(Boolean);
}

function getSubject(message) {
  return String(message?.Subject ?? message?.subject ?? message?.headers?.subject ?? '');
}

function getBody(detail) {
  if (typeof detail === 'string') {
    return detail;
  }

  return (
    detail?.text ??
    detail?.Text ??
    detail?.body?.text ??
    detail?.body ??
    detail?.html ??
    detail?.message ??
    JSON.stringify(detail)
  );
}

async function fetchJson(url) {
  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

async function waitForMail({ to, subject, timeoutMs = 20000 }) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const payload = await fetchJson(`${mailpitUrl}/api/v1/messages`);
    const messages = normalizeMessageList(payload);
    const match = messages.find((message) => getRecipients(message).includes(to) && getSubject(message) === subject);

    if (match) {
      const messageId = match?.id ?? match?.ID ?? match?.message_id ?? match?.MessageID;
      if (!messageId) {
        return { message: match, detail: null };
      }

      const detail = await fetchJson(`${mailpitUrl}/api/v1/message/${messageId}`);
      return { message: match, detail };
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for mail to ${to} with subject ${subject}`);
}

async function callNotifier(rfqId) {
  const response = await postRfqNotify(
    new Request('http://localhost/api/internal/rfq-notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${internalToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: 'items.create',
        collection: 'rfq_requests',
        key: rfqId
      })
    })
  );

  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return { response, text, json };
}

async function fetchAdminAccessToken() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: DIRECTUS_ADMIN_EMAIL,
      password: DIRECTUS_ADMIN_PASSWORD
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to obtain Directus access token: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.data.access_token;
}

async function fetchSalesAccessToken() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: salesEmail,
      password: salesPassword
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to obtain sales access token: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.data.access_token;
}

async function createRfq(payload) {
  return adminClient.request(createItem('rfq_requests', payload));
}

async function readNotificationRows(rfqId, token) {
  const response = await fetch(
    `${DIRECTUS_URL}/notifications?limit=-1&filter[collection][_eq]=rfq_requests&filter[item][_eq]=${encodeURIComponent(String(rfqId))}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to read notifications: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.filter((row) => row?.collection === 'rfq_requests' && String(row?.item) === String(rfqId));
}

async function waitForNotificationRows(rfqId, token, timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const rows = await readNotificationRows(rfqId, token);
    if (rows.length > 0) {
      return rows;
    }

    await delay(250);
  }

  return readNotificationRows(rfqId, token);
}

async function deleteNotificationRows(rows, token) {
  for (const row of rows) {
    if (row?.id) {
      const response = await fetch(`${DIRECTUS_URL}/notifications/${row.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        await response.text();
      }
    }
  }
}

async function deleteRfq(row) {
  if (row?.id) {
    await adminClient.request(deleteItem('rfq_requests', row.id));
  }
}

async function main() {
  await loginAdmin(adminClient);
  console.log(`[rfq-notify] Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);
  process.env.DIRECTUS_TOKEN = await fetchAdminAccessToken();
  const salesToken = await fetchSalesAccessToken();
  process.env.MAIL_HOST = 'localhost';
  process.env.MAIL_PORT = '1025';
  process.env.MAIL_FROM = 'ULINK <no-reply@ulink.local>';

  const [siteSettings, rules] = await Promise.all([
    adminClient.request(readSingleton('site_settings', { fields: ['contact_email'] })),
    adminClient.request(
      readItems('rfq_assignment_rules', {
        fields: [
          'id',
          'priority',
          'is_default',
          'hub.id',
          'hub.name',
          'hub.slug',
          'industry.id',
          'industry.name',
          'industry.slug',
          'assigned_sales.id',
          'assigned_sales.email',
          'assigned_sales.first_name',
          'assigned_sales.last_name'
        ],
        sort: ['-priority', 'id'],
        limit: 10
      })
    )
  ]);

  const exactRule = rules.find(
    (rule) => rule?.is_default !== true && rule?.hub?.id && rule?.industry?.slug && rule?.assigned_sales?.id
  );
  const fallbackRule = rules.find((rule) => rule?.is_default === true);

  assert(exactRule, 'Seeded exact RFQ assignment rule exists.');
  assert(fallbackRule, 'Seeded fallback RFQ assignment rule exists.');
  assert(siteSettings?.contact_email, 'site_settings contains a fallback contact email.');

  const exactCompany = `RFQ Smoke Exact ${Date.now()}`;
  const exactRfq = await createRfq({
    company: exactCompany,
    contact_name: 'Exact Match',
    email: `rfq-exact-${Date.now()}@example.com`,
    phone: '0900000001',
    industry: exactRule.industry.slug,
    hub: exactRule.hub.id,
    line_items: [{ sku: 'sku-gloves-nitrile-s', qty: 2 }],
    message: 'Exact routing smoke test',
    status: 'new',
    source: 'web'
  });

  const exactSubject = `RFQ #${exactRfq.id} - ${exactCompany}`;
  const exactResponse = await callNotifier(exactRfq.id);
  assert.equal(exactResponse.response.status, 200, exactResponse.text);
  assert.equal(exactResponse.json?.success, true, exactResponse.text);
  assert.equal(exactResponse.json?.data?.rfq_id, exactRfq.id, exactResponse.text);
  assert.equal(exactResponse.json?.data?.assigned_sales, exactRule.assigned_sales.id, exactResponse.text);
  assert.equal(exactResponse.json?.data?.notified_to, exactRule.assigned_sales.email, exactResponse.text);
  assert.equal(exactResponse.json?.data?.mail_status, 'sent', exactResponse.text);
  assert.equal(exactResponse.json?.data?.notification_status, 'sent', exactResponse.text);

  const exactMail = await waitForMail({
    to: exactRule.assigned_sales.email,
    subject: exactSubject
  });
  const exactBody = `${JSON.stringify(exactMail.message)}\n${JSON.stringify(exactMail.detail)}\n${getBody(exactMail.detail)}`;
  assert.match(exactBody, new RegExp(exactCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'Exact-match mail includes the RFQ company name.');
  assert.match(exactBody, /Directus/i, 'Exact-match mail includes the admin link text.');

  const exactNotifications = await waitForNotificationRows(exactRfq.id, salesToken);
  assert.equal(exactNotifications.length, 1, 'Exact-match RFQ creates one Directus notification.');
  assert.equal(
    typeof exactNotifications[0].recipient === 'object' ? exactNotifications[0].recipient?.id : exactNotifications[0].recipient,
    exactRule.assigned_sales.id,
    'Exact-match notification targets the assigned sales user.'
  );

  const fallbackCompany = `RFQ Smoke Fallback ${Date.now()}`;
  const fallbackRfq = await createRfq({
    company: fallbackCompany,
    contact_name: 'Fallback Match',
    email: `rfq-fallback-${Date.now()}@example.com`,
    phone: '0900000002',
    industry: 'medical-devices',
    hub: exactRule.hub.id,
    line_items: [{ sku: 'sku-wipers-poly-9', qty: 1 }],
    message: 'Fallback routing smoke test',
    status: 'new',
    source: 'web'
  });

  const fallbackSubject = `RFQ #${fallbackRfq.id} - ${fallbackCompany}`;
  const fallbackResponse = await callNotifier(fallbackRfq.id);
  assert.equal(fallbackResponse.response.status, 200, fallbackResponse.text);
  assert.equal(fallbackResponse.json?.success, true, fallbackResponse.text);
  assert.equal(fallbackResponse.json?.data?.rfq_id, fallbackRfq.id, fallbackResponse.text);
  assert.equal(fallbackResponse.json?.data?.assigned_sales, null, fallbackResponse.text);
  assert.equal(fallbackResponse.json?.data?.notified_to, siteSettings.contact_email, fallbackResponse.text);
  assert.equal(fallbackResponse.json?.data?.mail_status, 'sent', fallbackResponse.text);
  assert.equal(fallbackResponse.json?.data?.notification_status, 'skipped', fallbackResponse.text);

  const fallbackMail = await waitForMail({
    to: siteSettings.contact_email,
    subject: fallbackSubject
  });
  const fallbackBody = `${JSON.stringify(fallbackMail.message)}\n${JSON.stringify(fallbackMail.detail)}\n${getBody(fallbackMail.detail)}`;
  assert.match(fallbackBody, new RegExp(fallbackCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'Fallback mail includes the RFQ company name.');
  assert.match(fallbackBody, /Directus/i, 'Fallback mail includes the admin link text.');

  const fallbackNotifications = await readNotificationRows(fallbackRfq.id, salesToken);
  assert.equal(fallbackNotifications.length, 0, 'Fallback RFQ does not create a Directus notification without an assignee.');

  await deleteNotificationRows(exactNotifications, salesToken);
  await deleteRfq(exactRfq);
  await deleteRfq(fallbackRfq);

  console.log('[rfq-notify] Verification passed.');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('[rfq-notify] Verification failed:', error);
    process.exit(1);
  });
