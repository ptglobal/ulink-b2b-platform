import assert from 'node:assert/strict';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from '../lib/config.mjs';
import { readItems, deleteItems } from '@directus/sdk';

const adminClient = createDirectusClient();

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function runNewsletterSubscriptionFlow() {
  const email = uniqueEmail('newsletter-test');
  console.log(`[newsletter-test] Generated test email: ${email}`);

  // 1. Submit a new email subscription using public visitor context (no auth token)
  console.log('[newsletter-test] Submitting new subscription as visitor...');
  const resSuccess = await fetch(`${DIRECTUS_URL}/items/newsletter_subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  assert(resSuccess.ok, `Expected success status, got ${resSuccess.status}`);
  const rawText = await resSuccess.text();
  console.log('[newsletter-test] Raw Response:', rawText);
  let jsonSuccess;
  let createdId;
  if (rawText) {
    jsonSuccess = JSON.parse(rawText);
    console.log('[newsletter-test] Subscription created successfully:', jsonSuccess.data);
    assert(jsonSuccess?.data?.id, 'Expected returned object to have an ID');
    assert.equal(jsonSuccess.data.email, email, 'Returned email should match submitted email');
    assert.equal(jsonSuccess.data.status, 'active', 'Default status should be active');
    createdId = jsonSuccess.data.id;
  } else {
    console.log('[newsletter-test] Got empty response from create (expected behavior when user lacks read permission).');
    // We can query the database or the admin API to find the ID of the subscriber with this email
    const items = await adminClient.request(
      readItems('newsletter_subscribers', {
        filter: {
          email: { _eq: email }
        }
      })
    );
    assert.equal(items.length, 1, 'Expected subscription to have been created in database');
    assert.equal(items[0].email, email);
    createdId = items[0].id;
    console.log('[newsletter-test] Found created subscriber ID via admin API:', createdId);
  }

  // 2. Attempt to submit the same email address again (should fail due to unique constraint)
  console.log('[newsletter-test] Submitting duplicate subscription to verify prevention...');
  const resDuplicate = await fetch(`${DIRECTUS_URL}/items/newsletter_subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  assert(!resDuplicate.ok, `Expected failure status for duplicate, got ${resDuplicate.status}`);
  const jsonDuplicate = await resDuplicate.json();
  console.log('[newsletter-test] Duplicate subscription correctly rejected. Response:', JSON.stringify(jsonDuplicate));
  
  // Directus validation / database unique constraint check returns standard error structure
  assert(jsonDuplicate?.errors?.[0], 'Expected error array in payload');
  const errorObj = jsonDuplicate.errors[0];
  assert(
    errorObj.extensions?.code === 'RECORD_NOT_UNIQUE' || 
    errorObj.message?.toLowerCase().includes('unique') ||
    resDuplicate.status === 400 ||
    resDuplicate.status === 409,
    `Unexpected error payload: ${JSON.stringify(errorObj)}`
  );
  console.log('[newsletter-test] Passed: Duplicate email was successfully blocked with validation/database error.');

  // 3. Verify a public visitor cannot read the newsletter_subscribers items (should return 403 Forbidden)
  console.log('[newsletter-test] Verifying public visitor cannot read newsletter_subscribers...');
  const resReadPublic = await fetch(`${DIRECTUS_URL}/items/newsletter_subscribers`, {
    method: 'GET'
  });
  
  assert.equal(resReadPublic.status, 403, 'Expected 403 Forbidden for public read');
  console.log('[newsletter-test] Passed: Public read request blocked with 403.');

  // 4. Verify Admin/Editor/Sales (authorized client) can read/manage the subscribers
  console.log('[newsletter-test] Verifying admin client can read newsletter_subscribers...');
  const items = await adminClient.request(
    readItems('newsletter_subscribers', {
      filter: {
        id: { _eq: createdId }
      }
    })
  );

  assert.equal(items.length, 1, 'Admin client should be able to read the created subscription');
  assert.equal(items[0].email, email);
  console.log('[newsletter-test] Passed: Authorized client successfully read the subscriber.');

  // 5. Clean up the test records
  console.log('[newsletter-test] Cleaning up test subscription...');
  await adminClient.request(deleteItems('newsletter_subscribers', [createdId]));
  console.log('[newsletter-test] Clean up completed.');

  // 6. Optional rate-limiting verification
  if (process.argv.includes('--rate-limit')) {
    console.log('[newsletter-test] Starting rate limit verification (sending 55 requests)...');
    let hitRateLimit = false;
    for (let i = 0; i < 55; i++) {
      const res = await fetch(`${DIRECTUS_URL}/items/newsletter_subscribers`, { method: 'GET' });
      if (res.status === 429) {
        console.log(`[newsletter-test] Successfully triggered rate limit at request #${i + 1}`);
        hitRateLimit = true;
        break;
      }
    }
    assert(hitRateLimit, 'Expected to hit HTTP 429 Too Many Requests within 55 requests, but did not.');
    console.log('[newsletter-test] Passed: Rate limiter is working as configured (HTTP 429 received).');
  }
}

async function main() {
  await loginAdmin(adminClient);
  console.log(`[newsletter-test] Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  await runNewsletterSubscriptionFlow();

  console.log('[newsletter-test] Directus newsletter subscription flow verification passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error('[newsletter-test] Verification failed:', error);
  process.exit(1);
});
