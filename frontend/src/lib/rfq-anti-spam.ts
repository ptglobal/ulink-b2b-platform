import type Redis from 'ioredis';

export type RfqAntiSpamResult =
  | { ok: true }
  | {
      ok: false;
      error: {
        code: 'FORBIDDEN' | 'TOO_MANY_REQUESTS' | 'CONFLICT';
        message: string;
        details?: Record<string, unknown>;
      };
    };

interface RfqAntiSpamDeps {
  verifyTurnstile: (token: string, ip: string) => Promise<boolean>;
  rateLimit: (ip: string) => Promise<{ ok: true } | { ok: false; retryAfterSeconds: number }>;
  reserveFingerprint: (fingerprint: string) => Promise<{ ok: true } | { ok: false }>;
}

export async function enforceRfqAntiSpam(
  input: { token: string; ip: string; fingerprint: string },
  deps: RfqAntiSpamDeps
): Promise<RfqAntiSpamResult> {
  const verified = await deps.verifyTurnstile(input.token, input.ip);
  if (!verified) {
    return {
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Turnstile verification failed.'
      }
    };
  }

  const rateLimit = await deps.rateLimit(input.ip);
  if (!rateLimit.ok) {
    return {
      ok: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many RFQ submissions from this IP.',
        details: {
          retryAfterSeconds: rateLimit.retryAfterSeconds
        }
      }
    };
  }

  const reserved = await deps.reserveFingerprint(input.fingerprint);
  if (!reserved.ok) {
    return {
      ok: false,
      error: {
        code: 'CONFLICT',
        message: 'Duplicate RFQ submission detected.'
      }
    };
  }

  return { ok: true };
}

export function createTurnstileVerifier(secret = process.env.TURNSTILE_SECRET_KEY) {
  return async (token: string, ip: string) => {
    if (!secret) {
      return false;
    }

    const form = new FormData();
    form.set('secret', secret);
    form.set('response', token);
    form.set('remoteip', ip);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  };
}

export function createRfqRateLimiter(redis: Redis) {
  const keyPrefix = 'rfq:ip:';
  const limit = 5;
  const windowSeconds = 600;

  return async (ip: string) => {
    const key = `${keyPrefix}${ip}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > limit) {
      return {
        ok: false as const,
        retryAfterSeconds: windowSeconds
      };
    }

    return { ok: true as const };
  };
}

export function createRfqFingerprintReserver(redis: Redis) {
  const keyPrefix = 'rfq:dedupe:';
  const windowSeconds = 900;

  return async (fingerprint: string) => {
    const key = `${keyPrefix}${fingerprint}`;
    const result = await redis.set(key, '1', 'EX', windowSeconds, 'NX');
    return result === 'OK' ? { ok: true as const } : { ok: false as const };
  };
}
