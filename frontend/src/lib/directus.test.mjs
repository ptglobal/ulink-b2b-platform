import test from 'node:test';
import assert from 'node:assert/strict';

import { getDirectusUrl, requireDirectusToken } from './directus-runtime.mjs';

test('getDirectusUrl falls back to local Directus', () => {
  assert.equal(getDirectusUrl(undefined), 'http://localhost:8055');
});

test('getDirectusUrl preserves an explicit URL', () => {
  assert.equal(getDirectusUrl('https://cms.example.com'), 'https://cms.example.com');
});

test('requireDirectusToken throws when missing', () => {
  assert.throws(
    () => requireDirectusToken(undefined),
    /DIRECTUS_TOKEN is required for server-side RFQ writes/
  );
});

test('requireDirectusToken returns the provided token', () => {
  assert.equal(requireDirectusToken('token-123'), 'token-123');
});

test('requireDirectusToken strips BOM and surrounding whitespace', () => {
  assert.equal(requireDirectusToken('\uFEFF  token-123  '), 'token-123');
});
