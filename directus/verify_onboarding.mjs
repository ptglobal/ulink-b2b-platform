import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import {
  createDirectus,
  rest,
  authentication,
  readItems,
  readUsers,
  createUser,
  createItem,
  updateItem
} from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './config.mjs';
import { CUSTOMER_ROLE_ID } from './constants.mjs';

const adminClient = createDirectusClient();
const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://localhost:8025';

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

function normalizeToList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function extractMessageArray(payload) {
  return payload?.messages ?? payload?.items ?? payload?.data ?? payload ?? [];
}

function getMessageRecipients(message) {
  return [
    ...normalizeToList(message?.To),
    ...normalizeToList(message?.to),
    ...normalizeToList(message?.recipients?.to),
    ...normalizeToList(message?.envelope?.to)
  ]
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }

      return entry?.address ?? entry?.email ?? entry?.Address ?? entry?.Email ?? '';
    })
    .filter(Boolean);
}

function getMessageSubject(message) {
  return String(message?.Subject ?? message?.subject ?? message?.headers?.subject ?? '');
}

function getMessageBody(detail) {
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
    throw new Error(`Mailpit request failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

async function waitForMail({ to, subject, timeoutMs = 20000 }) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const payload = await fetchJson(`${MAILPIT_URL}/api/v1/messages`);
    const messages = extractMessageArray(payload);
    const match = messages.find((message) => {
      const recipients = getMessageRecipients(message);
      return recipients.includes(to) && getMessageSubject(message) === subject;
    });

    if (match) {
      const messageId = match?.id ?? match?.ID ?? match?.message_id ?? match?.MessageID;
      if (!messageId) {
        return { message: match, detail: null };
      }

      const detail = await fetchJson(`${MAILPIT_URL}/api/v1/message/${messageId}`);
      return { message: match, detail };
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for mail to ${to} with subject ${subject}`);
}

async function loginCustomer(email, password) {
  const client = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());
  await client.login(email, password);
  return client;
}

async function readCustomerByEmail(client, email) {
  const rows = await client.request(
    readItems('customers', {
      filter: { email: { _eq: email } },
      limit: 1
    })
  );

  return rows[0] ?? null;
}

async function readUserByEmail(client, email) {
  const rows = await client.request(
    readUsers({
      filter: { email: { _eq: email } },
      limit: 1
    })
  );

  return rows[0] ?? null;
}

async function expectCustomerPermission(client, customerId, updates, shouldSucceed) {
  let succeeded = false;

  try {
    await client.request(updateItem('customers', customerId, updates));
    succeeded = true;
  } catch {
    succeeded = false;
  }

  assert.equal(succeeded, shouldSucceed, `Update ${JSON.stringify(updates)} should ${shouldSucceed ? 'succeed' : 'fail'}.`);
}

async function waitForLinkedCustomer(client, email) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 15000) {
    const customer = await readCustomerByEmail(client, email);
    if (customer?.user && customer?.status === 'active') {
      return customer;
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for linked customer row for ${email}`);
}

async function runSelfRegisterFlow() {
  const email = uniqueEmail('buyer');
  const password = 'customer-password-123';
  const body = {
    company_name: 'ACME Vietnam',
    contact_name: 'Nguyen Van A',
    email,
    phone: '0901234567',
    password
  };

  const response = await fetch(`${DIRECTUS_URL}/customer-onboarding/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const responseText = await response.text();
  assert.equal(response.status, 201, responseText);
  const payload = JSON.parse(responseText);
  assert(payload?.data?.user_id, 'Self-register returns user_id');
  assert(payload?.data?.customer_id, 'Self-register returns customer_id');
  assert.equal(payload.data.status, 'inactive');

  const user = await readUserByEmail(adminClient, email);
  assert(user, 'Self-register creates directus_users row');
  const userRole = typeof user.role === 'object' ? user.role?.id ?? null : user.role;
  assert.equal(userRole, CUSTOMER_ROLE_ID, 'Self-register assigns Customer role');
  assert.equal(user.status, 'active', 'Self-register activates directus_users row');

  const customer = await readCustomerByEmail(adminClient, email);
  assert(customer, 'Self-register creates customer row');
  assert.equal(customer.status, 'inactive', 'Self-register leaves customer inactive');
  assert.equal(typeof customer.user === 'object' ? customer.user?.id : customer.user, user.id, 'Customer links to new user');
  assert.equal(customer.company_name, body.company_name);
  assert.equal(customer.contact_name, body.contact_name);
  assert.equal(customer.email, body.email);
  assert.equal(customer.phone, body.phone);

  const welcomeMail = await waitForMail({
    to: email,
    subject: '[ULINK] Tài khoản đã được tạo'
  });
  const messageBlob = `${JSON.stringify(welcomeMail.message)}\n${JSON.stringify(welcomeMail.detail)}`;
  assert.match(messageBlob, /\/login/, 'Welcome mail points to /login');

  const customerClient = await loginCustomer(email, password);
  const ownCustomer = await readCustomerByEmail(
    {
      request: (...args) => customerClient.request(...args)
    },
    email
  );
  assert(ownCustomer, 'Customer can read own record after login');

  await expectCustomerPermission(customerClient, customer.id, { contact_name: 'Nguyen Van B' }, true);
  await expectCustomerPermission(customerClient, customer.id, { phone: '0909999999' }, true);
  await expectCustomerPermission(customerClient, customer.id, { address: '123 Test Street' }, true);
  await expectCustomerPermission(customerClient, customer.id, { company_name: 'Blocked Co' }, false);
  await expectCustomerPermission(customerClient, customer.id, { tax_code: '123456789' }, false);
  await expectCustomerPermission(customerClient, customer.id, { sales_owner: user.id }, false);
}

async function runInviteFlow() {
  const email = uniqueEmail('invite');
  const customerSeed = {
    status: 'inactive',
    company_name: 'Invite Co',
    contact_name: 'Invite Contact',
    email,
    phone: '0900000001',
    address: 'Invite Address'
  };

  const seededCustomer = await adminClient.request(createItem('customers', customerSeed));
  const password = 'invite-password-123';

  const invitedUser = await adminClient.request(
    createUser({
      email,
      password,
      role: CUSTOMER_ROLE_ID,
      status: 'active',
      first_name: 'Invite'
    })
  );

  const linkedCustomer = await waitForLinkedCustomer(adminClient, email);
  assert.equal(typeof linkedCustomer.user === 'object' ? linkedCustomer.user?.id : linkedCustomer.user, invitedUser.id);
  assert.equal(linkedCustomer.status, 'active', 'Invite flow activates customer row');
  assert.equal(linkedCustomer.company_name, customerSeed.company_name);
  assert.equal(seededCustomer.id, linkedCustomer.id, 'Hook updates pre-created customer row');
}

async function main() {
  await loginAdmin(adminClient);
  console.log(`[onboarding] Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  await runSelfRegisterFlow();
  await runInviteFlow();

  console.log('[onboarding] Directus onboarding verify passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error('[onboarding] Verification failed:', error);
  process.exit(1);
});
