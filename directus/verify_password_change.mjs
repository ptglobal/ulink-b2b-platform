import assert from 'node:assert/strict';
import { createDirectus, rest, authentication, createUser, deleteUser, updateMe } from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './config.mjs';
import { CUSTOMER_ROLE_ID } from './constants.mjs';

const adminClient = createDirectusClient();

function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function loginUser(email, password) {
  const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status}`);
  }

  const payload = await loginRes.json();
  return payload.data.access_token;
}

async function runPasswordChangeFlow() {
  const email = uniqueEmail('change-test');
  const initialPassword = 'OldPassword123!';
  const newPassword = 'NewPassword123!';

  console.log(`[password-change-test] Creating test user with email: ${email}`);
  const testUser = await adminClient.request(
    createUser({
      email,
      password: initialPassword,
      role: CUSTOMER_ROLE_ID,
      status: 'active',
      first_name: 'ChangeTest'
    })
  );

  assert(testUser?.id, 'Test user creation failed');
  console.log(`[password-change-test] Test user created with ID: ${testUser.id}`);

  // 1. Verify initial login works
  console.log('[password-change-test] Verifying initial login works...');
  const userToken = await loginUser(email, initialPassword);
  assert(userToken, 'Initial login failed');
  console.log('[password-change-test] Initial login verified.');

  // 2. Helper to call the custom password change endpoint
  const callChangePassword = async (payload) => {
    return await fetch(`${DIRECTUS_URL}/password-change/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify(payload)
    });
  };

  // 3. Test validation error: Mismatched new passwords
  console.log('[password-change-test] Testing mismatched new passwords...');
  const resMismatch = await callChangePassword({
    current_password: initialPassword,
    new_password: newPassword,
    confirm_password: 'DifferentPassword123!'
  });
  assert.equal(resMismatch.status, 422, 'Expected 422 for mismatched password');
  const jsonMismatch = await resMismatch.json();
  assert.equal(jsonMismatch.error, 'New passwords do not match.');
  console.log('[password-change-test] Passed: Mismatched passwords rejected.');

  // 4. Test validation error: Weak new password
  console.log('[password-change-test] Testing weak new password complexity...');
  const resWeak = await callChangePassword({
    current_password: initialPassword,
    new_password: 'weak',
    confirm_password: 'weak'
  });
  assert.equal(resWeak.status, 422, 'Expected 422 for weak password');
  const jsonWeak = await resWeak.json();
  assert(jsonWeak.error.includes('Password must be at least 8 characters'), 'Expected complexity error message');
  console.log('[password-change-test] Passed: Weak password rejected.');

  // 5. Test validation error: Invalid current password
  console.log('[password-change-test] Testing invalid current password...');
  const resWrongCurrent = await callChangePassword({
    current_password: 'WrongCurrentPassword123!',
    new_password: newPassword,
    confirm_password: newPassword
  });
  assert.equal(resWrongCurrent.status, 401, 'Expected 401 for wrong current password');
  const jsonWrongCurrent = await resWrongCurrent.json();
  assert.equal(jsonWrongCurrent.error, 'Invalid current password.');
  console.log('[password-change-test] Passed: Invalid current password rejected.');

  // 6. Test successful password change
  console.log('[password-change-test] Submitting valid password change...');
  const resSuccess = await callChangePassword({
    current_password: initialPassword,
    new_password: newPassword,
    confirm_password: newPassword
  });
  assert.equal(resSuccess.status, 204, 'Expected 204 for successful password change');
  console.log('[password-change-test] Passed: Password successfully changed.');

  // 7. Verify login with OLD password fails
  console.log('[password-change-test] Verifying login with OLD password fails...');
  try {
    await loginUser(email, initialPassword);
    assert.fail('Expected login with old password to throw an error');
  } catch (error) {
    console.log('[password-change-test] Passed: Login with old password failed as expected.');
  }

  // 8. Verify login with NEW password works
  console.log('[password-change-test] Verifying login with NEW password works...');
  const newClient = await loginUser(email, newPassword);
  assert(newClient, 'Login with new password failed');
  console.log('[password-change-test] Passed: Login with new password succeeded.');

  // 9. Clean up test user
  console.log('[password-change-test] Cleaning up test user...');
  await adminClient.request(deleteUser(testUser.id));
  console.log('[password-change-test] Clean up completed.');
}

async function main() {
  await loginAdmin(adminClient);
  console.log(`[password-change-test] Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  await runPasswordChangeFlow();

  console.log('[password-change-test] Directus password change validation verification passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error('[password-change-test] Verification failed:', error);
  process.exit(1);
});
