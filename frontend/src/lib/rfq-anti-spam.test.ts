import test from 'node:test';
import assert from 'node:assert/strict';

import { enforceRfqAntiSpam } from './rfq-anti-spam';

test('blocks request when Turnstile verification fails', async () => {
  let rateLimitCalls = 0;
  let reserveCalls = 0;

  const result = await enforceRfqAntiSpam(
    { token: 'bad-token', ip: '1.2.3.4', fingerprint: 'abc' },
    {
      verifyTurnstile: async () => false,
      rateLimit: async () => {
        rateLimitCalls += 1;
        return { ok: true };
      },
      reserveFingerprint: async () => {
        reserveCalls += 1;
        return { ok: true };
      }
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'FORBIDDEN');
  assert.equal(rateLimitCalls, 0);
  assert.equal(reserveCalls, 0);
});

test('blocks request after IP rate limit is exceeded', async () => {
  let reserveCalls = 0;

  const result = await enforceRfqAntiSpam(
    { token: 'good-token', ip: '1.2.3.4', fingerprint: 'abc' },
    {
      verifyTurnstile: async () => true,
      rateLimit: async () => ({ ok: false, retryAfterSeconds: 600 }),
      reserveFingerprint: async () => {
        reserveCalls += 1;
        return { ok: true };
      }
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'TOO_MANY_REQUESTS');
  assert.equal(reserveCalls, 0);
});

test('blocks duplicate submit within dedupe window', async () => {
  const result = await enforceRfqAntiSpam(
    { token: 'good-token', ip: '1.2.3.4', fingerprint: 'abc' },
    {
      verifyTurnstile: async () => true,
      rateLimit: async () => ({ ok: true }),
      reserveFingerprint: async () => ({ ok: false })
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'CONFLICT');
});
