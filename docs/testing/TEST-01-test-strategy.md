# TEST-01 — Test Strategy / Master Test Plan

**Status:** Baseline · **Owner:** Tester · **Related:** TEST-02 (cases), TEST-03 (UAT), TEST-04 (perf/browser)

## 1. Objective
Verify the platform meets SPEC-01 functional + non-functional requirements and the
contract acceptance criteria, with **zero Critical bugs in the RFQ/Order flow**.

## 2. Test levels
| Level | What | Tooling |
|---|---|---|
| Unit | Pure logic, utils, validators, route-handler logic | Vitest |
| Component | React components (rendering, states) | Vitest + Testing Library |
| Integration | Frontend ↔ Directus ↔ Redis (RFQ submit, SKU cache, portal data) | Vitest + ephemeral Directus or mocks |
| E2E | Critical user journeys across the running app | Playwright |
| Non-functional | Performance, SEO, a11y, cross-browser | Lighthouse CI, axe, manual matrix (TEST-04) |
| UAT | Client acceptance vs criteria | Manual checklist (TEST-03) |

## 3. Scope by priority (critical journeys first)
1. **RFQ/Order path** (Quick Order → cart → submit → Sales) — must be bug-free.
2. SKU search + cached lookup (<50ms hit).
3. Portal: login, order history, debt, delivery, re-order (row-level isolation).
4. Product browse + TDS/MSDS download + request sample.
5. CMS publish → site reflects change; i18n switch; SEO metadata/schema.

## 4. Environments
- **Local** (Docker Compose + `npm run dev`), **Staging** (continuous from Week 1),
  **Production** (Week 8). Test data via Directus seed/bootstrap.

## 5. Entry / exit criteria
- **Entry:** feature meets DoD (ENG-04), build green, test data available.
- **Exit (per release):** all planned cases executed; **0 open S1**, **0 open S2** in
  critical paths; PageSpeed ≥90 on key pages; cross-browser matrix passed; UAT signed.

## 6. Defect management
Bugs logged per [PROC-01](../process/PROC-01-bug-tracking-process.md) with severity/
priority; critical-path S1 blocks release.

## 7. Cadence (maps to the 8-week plan)
Functional testing each sprint (Wk2+); full regression + Lighthouse/SEO verification
in Wk7; UAT rounds Wk7 (dry-run/round 1) and Wk8 (final). Automate the critical
journeys in Playwright as they stabilize.

## 8. Responsibilities
Tester owns strategy, cases, execution, sign-off; Devs write unit/component tests and
fix defects; BA owns UAT scenarios + acceptance mapping.
