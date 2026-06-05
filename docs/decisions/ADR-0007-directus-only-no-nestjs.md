# ADR-0007 — Directus-only for the build; NestJS deferred to Integration

**Status:** Accepted · **Date:** 2026-06-03

## Context
An early draft listed "NestJS + Directus" as the backend. Directus is already a full
API backend; running NestJS alongside it duplicates deployment and ops surface and
costs time the 8-week budget needs elsewhere.

## Decision
Build on **Directus only**. Implement the two thin custom paths (`/api/sku`,
`/api/rfq`) as **Next.js route handlers**. Introduce **NestJS later** as the BFF /
ERP-sync layer in the Integration phase, when there is real cross-system business
logic to justify it.

## Consequences
- One backend to build, deploy, secure, and maintain during the project.
- Custom logic lives in Next.js handlers + Directus Flows.
- A clear, deferred home (NestJS) for ERP integration keeps the door open.

## Alternatives considered
- **NestJS + Directus now** — redundant double backend; rejected for this phase.
- **NestJS only** — see ADR-0001 (loses all Directus OOTB features).
