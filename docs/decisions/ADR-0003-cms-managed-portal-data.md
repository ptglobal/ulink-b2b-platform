# ADR-0003 — Portal data CMS-managed now; live ERP sync deferred

**Status:** Accepted · **Date:** 2026-06-03 · **Confirm with ULink at kickoff**

## Context
The B2B Portal needs Order History, Debt/Công nợ, Scheduled Delivery, and Re-order.
Those need a source of truth for orders and accounts-receivable. No ERP exists yet,
and the PRD roadmap places ERP/CRM integration in a future "Integration" phase.

## Decision
Build the portal features **fully functional with data managed in the system's own
database (Directus/PostgreSQL)** — entered/maintained by Sales/Admin via the CMS, or
imported via CSV. **Real-time ERP synchronization is the future Integration phase.**
We additionally build an ERP-ready interface (ADR-0006 / SPEC-04) so a future ERP
plugs in without schema change.

## Consequences
- "All features complete" is both feasible in 8 weeks and honest — the screens are
  real and demoable, not hollow shells.
- The system is the temporary source of truth; later the ERP becomes upstream.
- **Risk:** if ULink expects live ERP sync inside 8 weeks, that requires an ERP +
  credentials that do not exist → separate appendix (contract §3.3). Confirm at kickoff.

## Alternatives considered
- **Defer the whole portal** (MVP-first) — rejected (ADR-0002).
- **Live ERP integration now** — impossible; no ERP exists.
