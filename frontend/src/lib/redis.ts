import Redis from 'ioredis';

// Lazy singleton — one connection reused across route-handler invocations.
let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 2,
      lazyConnect: false
    });
  }
  return client;
}
