import test from 'node:test';
import assert from 'node:assert/strict';

import { enforceRfqAntiSpam } from './rfq-anti-spam';

test('blocks request when Turnstile verification fails', async () => {
  let rateLimitCalls = 0;

  const result = await enforceRfqAntiSpam(
    { token: 'bad-token', ip: '1.2.3.4' },
    {
      verifyTurnstile: async () => false,
      rateLimit: async () => {
        rateLimitCalls += 1;
        return { ok: true };
      }
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'FORBIDDEN');
  assert.equal(rateLimitCalls, 0);
});

test('blocks request after IP rate limit is exceeded', async () => {
  const result = await enforceRfqAntiSpam(
    { token: 'good-token', ip: '1.2.3.4' },
    {
      verifyTurnstile: async () => true,
      rateLimit: async () => ({ ok: false, retryAfterSeconds: 600 })
    }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'TOO_MANY_REQUESTS');
});

test('allows the request once Turnstile and rate limit pass', async () => {
  const result = await enforceRfqAntiSpam(
    { token: 'good-token', ip: '1.2.3.4' },
    {
      verifyTurnstile: async () => true,
      rateLimit: async () => ({ ok: true })
    }
  );

  assert.equal(result.ok, true);
});
