# ULink B2B Platform — Documentation Master Index

The complete documentation set required to **fully specify, decide, build, review,
test, fix, and refine** the ULink Industries B2B Procurement Platform.

All documents are **English Markdown**, versioned in this repo. This index is the
contract for what gets written; nothing is generated until it's approved.

## Conventions
- **Location:** every doc lives under `docs/<area>/`; templates live under `.github/` or repo root.
- **IDs:** stable prefixes (`SPEC-`, `ADR-`, `ENG-`, `REV-`, `TEST-`, `PROC-`, `OPS-`, `GUIDE-`).
- **Status:** ✅ exists · ✍️ to write · 🔗 covered elsewhere.
- **Priority:** **P1** = needed to start building · **P2** = needed during build · **P3** = needed for handover/go-live.
- **Source of truth:** the [delivery plan](plans/2026-06-03-ulink-delivery-plan-fullscope-8wk.md) governs scope & schedule; these docs detail *how*.

## Already in the repo
| Artifact | Path | Note |
|---|---|---|
| ✅ Delivery & Execution Plan (v1.2) | `docs/plans/2026-06-03-ulink-delivery-plan-fullscope-8wk.md` | Scope, architecture, 8-week schedule |
| ✅ Directus Schema spec | `directus/SCHEMA.md` | Collections + roles (SPEC-03 extends this) |
| ✅ Repo README / quickstart | `README.md` | Stack + run instructions |

---

## 1. Specs — *define* (`docs/specs/`)
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| SPEC-01 | Software Requirements Specification (SRS) | Consolidated functional + non-functional requirements; the master requirements baseline | P1 | ✅ |
| SPEC-02 | Functional Specification | Module-by-module behaviour: Home, Hubs, Products/SKU, Industry, Resources, Quick Order/RFQ, **B2B Portal**, CMS, About | P1 | ✅ |
| SPEC-03 | Data Model & ERD | Entities, relationships, ERD; extends `directus/SCHEMA.md` | P1 | ✅ |
| SPEC-04 | API Specification | Directus REST/GraphQL usage + `/api/sku`, `/api/rfq` + the ERP-ready interface contract | P1 | ✅ |
| SPEC-05 | Information Architecture & Sitemap | Route ↔ collection map, navigation, URL structure | P2 | ✅ |
| SPEC-06 | Design System Specification | Tokens, type scale, spacing, components — "Japanese Industrial Minimalism" | P1 | ✅ |
| SPEC-07 | Internationalization (i18n) Spec | VI/EN/JP strategy, hreflang, content-at-launch policy | P2 | ✅ |
| SPEC-08 | SEO Technical Spec & Schema Markup | URLs, metadata, JSON-LD, sitemap/robots, CWV | P2 | ✅ |
| SPEC-09 | Security & RBAC Spec | Roles, row-level access, auth, anti-spam, HTTPS, secrets | P2 | ✅ |

## 2. Decisions — *decide* (`docs/decisions/`)
| ID | Decision | Pri | Status |
|---|---|:--:|:--:|
| ADR-0001 | Headless CMS (Directus) over a custom backend | P1 | ✅ |
| ADR-0002 | Full contract scope on an 8-week timeline (vs MVP-first / 6 weeks) | P1 | ✅ |
| ADR-0003 | Portal data CMS-managed now; live ERP sync deferred to Integration phase | P1 | ✅ |
| ADR-0004 | Next.js App Router + next-intl for SEO & i18n | P1 | ✅ |
| ADR-0005 | Redis-cached SKU lookup for the <50ms Quick Order target | P1 | ✅ |
| ADR-0006 | Hosting topology: Vercel (FE) + VPS Docker Compose (Directus/PG/Redis) | P2 | ✅ |
| ADR-0007 | Directus-only for the build; NestJS deferred to the ERP/Integration phase | P1 | ✅ |
| ADR-0008 | RFQ-based commerce (no checkout/payments at launch) | P2 | ✅ |
| — | ADR index + template (`docs/decisions/README.md`) | P1 | ✅ |

## 3. Code — *build* (`docs/engineering/` + root)
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| ENG-01 | Architecture Overview | System diagram, components, data flow, deployment units | P1 | ✅ |
| ENG-02 | Coding Standards & Conventions | TS/React/Next + Directus conventions, naming, lint/format | P1 | ✅ |
| ENG-03 | Git & Branching Workflow | Branch model, commit convention, PR flow, releases | P1 | ✅ |
| ENG-04 | Definition of Done | Per-task DoD incl. operator-green bar | P1 | ✅ |
| ENG-05 | Local Development Setup | Full env setup beyond the README quickstart | P2 | ✅ |
| ENG-06 | **Coding Constraints** | Hard rules for complete/clean/inheritable/scalable code; tooling-enforced | P1 | ✅ |
| — | `CONTRIBUTING.md` (root) | Contributor entry point linking the above | P2 | ✅ |

## 4. Review — *review* (`docs/review/` + `.github/`)
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| REV-01 | Code Review Checklist | What reviewers verify: correctness, security, perf, a11y, i18n, conventions | P1 | ✅ |
| — | Pull Request template (`.github/pull_request_template.md`) | Standardize PR descriptions + self-review | P2 | ✅ |

## 5. Test — *test* (`docs/testing/`)
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| TEST-01 | Test Strategy / Master Test Plan | Levels, scope, environments, entry/exit criteria, tooling | P1 | ✅ |
| TEST-02 | Test Cases (by module) | Concrete cases incl. RFQ/Order critical paths | P2 | ✅ |
| TEST-03 | UAT Checklist & Acceptance Criteria | Maps contract §1.5 / PRD §8 → verifiable checks (sign-off) | P2/P3 | ✅ |
| TEST-04 | Performance & Cross-browser Test Plan | Lighthouse/CWV budgets, Safari/Chrome/Edge, responsive matrix | P2 | ✅ |

## 6. Fix bug — *fix* (`docs/process/` + `.github/`)
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| PROC-01 | Bug Tracking Process | Lifecycle, severity/priority matrix, SLAs, triage | P1 | ✅ |
| — | Issue templates (`.github/ISSUE_TEMPLATE/bug_report.md`, `feature_request.md`) | Standard bug/feature intake | P2 | ✅ |

## 7. Refinement — *refine* (`docs/process/`)
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| PROC-02 | Backlog Refinement & Iteration Cadence | Weekly demo/refinement rhythm, story format, estimation | P2 | ✅ |
| PROC-03 | Change Request Process | Out-of-scope handling per contract §3.3 | P2 | ✅ |
| PROC-04 | Performance & SEO Tuning Checklist | Repeatable hardening pass to hit PageSpeed ≥90 | P2 | ✅ |
| PROC-05 | Release & Go-live Runbook | Cutover steps, smoke tests, rollback, operator-green sign-off | P3 | ✅ |

## 8. Operations & Handover (`docs/operations/`) — contract deliverables §2.3
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| OPS-01 | Deployment Guide | Provision VPS, Docker Compose, Vercel, DNS/SSL, env | P3 | ✅ |
| OPS-02 | Technical Handover | System map, credentials handover, ownership, support | P3 | ✅ |
| OPS-03 | Backup, Recovery & Monitoring | Postgres backups, restore drill, uptime/log monitoring | P3 | ✅ |

## 9. Guides & Training (`docs/guides/`) — contract deliverables §2.3
| ID | Document | Purpose | Pri | Status |
|---|---|---|:--:|:--:|
| GUIDE-01 | CMS Admin Guide | For Editor/Sales: content, products, RFQ, orders/debt | P3 | ✅ |
| GUIDE-02 | End-User / B2B Portal Guide | For customers: RFQ, portal, re-order | P3 | ✅ |
| GUIDE-03 | Training Plan | Sessions, agenda, materials for ULink's team | P3 | ✅ |

---

## Generation plan (batches)
- **Batch 1 — Define & Decide (all P1):** SPEC-01..04, SPEC-06, all ADRs + index, ENG-01..04, REV-01, TEST-01, PROC-01. *Enough to start building correctly.*
- **Batch 2 — Build support (P2):** SPEC-05, 07, 08, 09, ENG-05, CONTRIBUTING, PR template, TEST-02, TEST-04, PROC-02, PROC-03, PROC-04, issue templates.
- **Batch 3 — Handover & Go-live (P3):** TEST-03, PROC-05, OPS-01..03, GUIDE-01..03.

**Totals:** 9 specs · 8 ADRs (+index) · 7 engineering · 2 review · 4 testing · 5 process · 3 ops · 3 guides ≈ **41 documents/templates** (+ enforcement config: `.editorconfig`, `.prettierrc`, `.eslintrc.json`).

> ✅ **All three batches generated** (2026-06-03), committed per batch. The set above is complete; keep statuses current as docs evolve. Templates (PR / issue / ADR) live under `.github/` and `docs/decisions/`.
