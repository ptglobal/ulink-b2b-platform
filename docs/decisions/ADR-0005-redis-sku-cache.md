# ADR-0005 — Redis-cached SKU lookup for the <50ms Quick Order target

**Status:** Accepted · **Date:** 2026-06-03

## Context
NFR-02 requires Quick Order SKU response < 50ms. A direct Directus/Postgres query
per keystroke cannot reliably meet that under load.

## Decision
Serve SKU lookups from a **Redis cache** via a Next.js route handler
`GET /api/sku/{code}`. Key `sku:{code}`, TTL 1h, primed on publish (Directus Flow →
webhook). On a miss, read Directus once and populate the cache. Scope of the <50ms
guarantee is the **cached single-SKU read**, stated explicitly in UAT.

## Consequences
- Cache hits return in single-digit ms; predictable latency.
- Requires cache invalidation/prime on SKU publish/update.
- Page loads and RFQ submission are not in the <50ms scope (documented).

## Alternatives considered
- **DB index only** — insufficient and variable under load.
- **In-memory per-instance cache** — not shared across serverless invocations; Redis
  is shared and already used by Directus.
