import assert from 'node:assert/strict';
import { readCollections, readFields, readPermissions } from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from '../lib/config.mjs';
import { EDITOR_POLICY_ID, FRONTEND_SERVICE_POLICY_ID, SALES_POLICY_ID } from '../lib/constants.mjs';
import { logDone, logFatal, logInfo, logPass, logStep } from '../lib/logging.mjs';

const client = createDirectusClient();

async function verify() {
  logInfo(`Connecting to Directus at ${DIRECTUS_URL}`);
  await loginAdmin(client);
  logInfo(`Authenticated as ${DIRECTUS_ADMIN_EMAIL}`);

  let failed = false;
  const check = (condition, message) => {
    if (condition) {
      logPass(message);
    } else {
      console.error(`[FAIL] ${message}`);
      failed = true;
    }
  };

  logStep('1/3 Check collection');
  const collections = await client.request(readCollections());
  const contactCollection = collections.find((entry) => entry.collection === 'contact_requests');
  check(Boolean(contactCollection), 'Collection "contact_requests" exists.');

  const fields = await client.request(readFields('contact_requests'));
  const fieldNames = fields.map((field) => field.field);
  for (const fieldName of ['id', 'full_name', 'email', 'phone', 'subject', 'message', 'status', 'created_at']) {
    check(fieldNames.includes(fieldName), `contact_requests field "${fieldName}" exists.`);
  }

  logStep('2/3 Check permissions');
  const permissions = await client.request(readPermissions());
  check(
    permissions.some(
      (permission) =>
        permission.policy === FRONTEND_SERVICE_POLICY_ID &&
        permission.collection === 'contact_requests' &&
        permission.action === 'create'
    ),
    'Frontend service policy can create contact_requests.'
  );
  check(
    permissions.some(
      (permission) =>
        permission.policy === SALES_POLICY_ID &&
        permission.collection === 'contact_requests' &&
        permission.action === 'read'
    ),
    'Sales policy can read contact_requests.'
  );
  check(
    permissions.some(
      (permission) =>
        permission.policy === SALES_POLICY_ID &&
        permission.collection === 'contact_requests' &&
        permission.action === 'update'
    ),
    'Sales policy can update contact_requests status.'
  );
  check(
    permissions.some(
      (permission) =>
        permission.policy === EDITOR_POLICY_ID &&
        permission.collection === 'contact_requests' &&
        permission.action === 'update'
    ),
    'Editor policy can update contact_requests status.'
  );

  logStep('3/3 Check bootstrap contract');
  check(
    contactCollection?.meta?.note === 'Contact Requests',
    'Collection note matches the contact request contract.'
  );

  if (failed) {
    logFatal('contact_requests verification failed.');
    process.exit(1);
  }

  logDone('contact_requests verification passed.');
  process.exit(0);
}

verify().catch((error) => {
  logFatal('contact_requests verification crashed.', error);
  process.exit(1);
});
