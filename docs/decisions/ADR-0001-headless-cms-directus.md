# ADR-0001 — Headless CMS (Directus) over a custom backend

**Status:** Accepted · **Date:** 2026-06-03

## Context
The contract lists 17 CMS management modules, RBAC, multi-language, and a media
library, on a fixed low budget and a short timeline. The spec permits "NestJS /
Strapi / Directus". A hand-built backend would consume most of the budget on an
admin UI, auth, permissions, i18n, and file handling that are commodity features.

## Decision
Use **Directus** as the backend on PostgreSQL. It provides an admin panel, REST +
GraphQL APIs, authentication, role-based + row-level permissions, translations
(i18n), and a media library out of the box.

## Consequences
- ~70% of backend effort removed; the team builds content models + a frontend.
- 4 of the 17 CMS modules are native features (Media, Users/Roles, Publish state, i18n).
- Custom business logic uses Directus Flows + thin Next.js route handlers.
- Coupling to Directus conventions; mitigated by an API layer (SPEC-04) and the
  ERP-ready interface (ADR-0003).

## Alternatives considered
- **Strapi** — similar OOTB, but more code for granular RBAC + i18n here.
- **Custom NestJS** — maximum control, but does not fit the budget/timeline (ADR-0007).
