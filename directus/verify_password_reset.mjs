import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import {
  createDirectus,
  rest,
  authentication,
  createUser,
  deleteUser
} from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './config.mjs';
import { CUSTOMER_ROLE_ID } from './constants.mjs';

const adminClient = createDirectusClient();
const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://localhost:8025';

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Mailpit request failed: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

function normalizeToList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function getMessageRecipients(message) {
  return [
    ...normalizeToList(message?.To),
    ...normalizeToList(message?.to),
    ...normalizeToList(message?.recipients?.to),
    ...normalizeToList(message?.envelope?.to)
  ]
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      return entry?.address ?? entry?.email ?? entry?.Address ?? entry?.Email ?? '';
    })
    .filter(Boolean);
}

function getMessageBody(detail) {
  if (typeof detail === 'string') return detail;
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

async function waitForResetMail({ to, timeoutMs = 20000 }) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const payload = await fetchJson(`${MAILPIT_URL}/api/v1/messages`);
    const messages = payload?.messages ?? payload?.items ?? payload?.data ?? payload ?? [];
    const match = messages.find((message) => {
      const recipients = getMessageRecipients(message);
      return recipients.includes(to);
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

  throw new Error(`Timed out waiting for reset password mail to ${to}`);
}

async function loginUser(email, password) {
  const client = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());
  await client.login(email, password);
  return client;
}

async function runPasswordResetFlow() {
  const email = uniqueEmail('reset-test');
  const initialPassword = 'initial-password-123';
  const newPassword = 'new-secure-password-456';

  console.log(`[reset-password] Creating test user with email: ${email}`);
  const testUser = await adminClient.request(
    createUser({
      email,
      password: initialPassword,
      role: CUSTOMER_ROLE_ID,
      status: 'active',
      first_name: 'ResetTest'
    })
  );

  assert(testUser?.id, 'Test user creation failed');
  console.log(`[reset-password] Test user created with ID: ${testUser.id}`);

  // 1. Verify initial login works
  console.log('[reset-password] Verifying initial login works...');
  const initialClient = await loginUser(email, initialPassword);
  assert(initialClient, 'Initial login failed');
  console.log('[reset-password] Initial login verified.');

  // 2. Request password reset
  const resetUrl = 'http://localhost:3000/reset-password';
  console.log(`[reset-password] Requesting password reset with reset_url: ${resetUrl}`);
  
  const requestResponse = await fetch(`${DIRECTUS_URL}/auth/password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, reset_url: resetUrl })
  });

  if (!requestResponse.ok) {
    const errorText = await requestResponse.text();
    throw new Error(`Request password reset failed: ${requestResponse.status} ${errorText}`);
  }
  console.log('[reset-password] Password reset request submitted successfully.');

  // 3. Wait for reset mail in Mailpit
  console.log('[reset-password] Waiting for reset email in Mailpit...');
  const mailResult = await waitForResetMail({ to: email });
  const bodyText = getMessageBody(mailResult.detail);
  console.log('[reset-password] Reset email received.');

  // 4. Extract token from email body
  const tokenMatch = bodyText.match(/token=([a-zA-Z0-9_\-\.]+)/);
  assert(tokenMatch && tokenMatch[1], `Failed to extract token from email body: ${bodyText}`);
  const token = tokenMatch[1];
  console.log(`[reset-password] Extracted reset token: ${token.slice(0, 10)}...`);

  // 5. Submit password reset request
  console.log('[reset-password] Submitting password reset confirmation...');
  const resetResponse = await fetch(`${DIRECTUS_URL}/auth/password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password: newPassword })
  });

  if (!resetResponse.ok) {
    const errorText = await resetResponse.text();
    throw new Error(`Reset password confirmation failed: ${resetResponse.status} ${errorText}`);
  }
  console.log('[reset-password] Password reset confirmation completed.');

  // 6. Verify login with the NEW password works
  console.log('[reset-password] Verifying login with the NEW password...');
  const newClient = await loginUser(email, newPassword);
  assert(newClient, 'Login with new password failed');
  console.log('[reset-password] Login with new password verified successfully.');

  // 7. Clean up the test user
  console.log('[reset-password] Cleaning up test user...');
  await adminClient.request(deleteUser(testUser.id));
  console.log('[reset-password] Clean up completed.');
}

async function main() {
  await loginAdmin(adminClient);
  console.log(`[reset-password] Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  await runPasswordResetFlow();

  console.log('[reset-password] Directus password reset verify passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error('[reset-password] Verification failed:', error);
  process.exit(1);
});
