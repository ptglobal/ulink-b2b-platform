import test from 'node:test';
import assert from 'node:assert/strict';

import { requireInternalToken } from './internal-auth';

test('accepts the configured bearer secret', () => {
  assert.equal(
    requireInternalToken('Bearer dev-internal-token', 'dev-internal-token'),
    'dev-internal-token'
  );
});

test('rejects a mismatched bearer secret', () => {
  assert.throws(
    () => requireInternalToken('Bearer wrong-token', 'dev-internal-token'),
    /Invalid internal API token/
  );
});

test('throws when the internal token is not configured', () => {
  assert.throws(() => requireInternalToken('Bearer dev-internal-token', undefined), /required/);
});
