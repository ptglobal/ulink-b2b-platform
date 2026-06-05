# Architecture Decision Records (ADRs)

Each ADR captures one significant decision: its context, the choice, and the
consequences. Format is MADR-lite. ADRs are immutable once **Accepted** — supersede
with a new ADR rather than editing.

| ID | Decision | Status |
|---|---|---|
| [ADR-0001](ADR-0001-headless-cms-directus.md) | Headless CMS (Directus) over a custom backend | Accepted |
| [ADR-0002](ADR-0002-full-scope-8-weeks.md) | Full contract scope on an 8-week timeline | Accepted |
| [ADR-0003](ADR-0003-cms-managed-portal-data.md) | Portal data CMS-managed; ERP sync deferred | Accepted |
| [ADR-0004](ADR-0004-nextjs-app-router-next-intl.md) | Next.js App Router + next-intl | Accepted |
| [ADR-0005](ADR-0005-redis-sku-cache.md) | Redis-cached SKU lookup for <50ms | Accepted |
| [ADR-0006](ADR-0006-hosting-topology.md) | Vercel + VPS Docker Compose hosting | Accepted |
| [ADR-0007](ADR-0007-directus-only-no-nestjs.md) | Directus-only build; NestJS deferred | Accepted |
| [ADR-0008](ADR-0008-rfq-commerce-no-checkout.md) | RFQ-based commerce (no checkout) | Accepted |

## Template
```
# ADR-NNNN — <title>
**Status:** Proposed | Accepted | Superseded by ADR-XXXX
**Date:** YYYY-MM-DD
## Context
## Decision
## Consequences
## Alternatives considered
```
