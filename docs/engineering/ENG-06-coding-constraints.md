# ENG-06 — Coding Constraints

**Status:** Baseline (enforced) · **Owner:** Dev Lead · **Gates:** [REV-01 review](../review/REV-01-code-review-checklist.md), [ENG-04 DoD](ENG-04-definition-of-done.md)

These are **hard constraints** — non-negotiable rules that gate merge and "Done".
They exist so the output is **complete, clean, inheritable, and scalable**: any new
developer can pick up the code and grow it without archaeology or rewrites.
(ENG-02 covers *style conventions*; this covers *the rules that must hold*.)

Keywords: **MUST** / **MUST NOT** are binding. Many are machine-enforced (see §6).

---

## 1. Complete — nothing half-built ships
- **MUST** satisfy the unit's acceptance criteria (SPEC-01/02) before merge.
- **MUST** handle every state of data-driven UI: **loading, empty, error, success**.
- **MUST** handle errors explicitly — no empty `catch`, no unhandled promise, no
  swallowed failure. Public APIs return the SPEC-04 error model.
- **MUST NOT** leave dead code, commented-out blocks, unused exports/files, or
  unreachable branches (lint-enforced).
- **MUST NOT** leave `console.log` debugging or stray `TODO`/`FIXME` **without** a
  tracked issue ID referenced inline (`// TODO(#123): …`).
- **MUST** update the relevant SPEC and add tests to the level in TEST-01.
- A release is complete only at **operator-green** (ENG-04) — not "it compiles".

## 2. Clean — readable, consistent, minimal
- **MUST** pass `typecheck` (strict; **no `any`** without a written reason),
  `lint`, and `format:check` — all CI-gated.
- **MUST** keep functions/components **single-responsibility and small**; cyclomatic
  complexity ≤ ~10; refactor a file before it sprawls (soft cap ~300 lines).
- **MUST** use meaningful names; **no magic numbers/strings** — name constants.
- **MUST** be DRY — extract shared logic to `lib/` or shared components; no copy-paste.
- **MUST NOT** nest more than ~3 levels — prefer early returns / guard clauses.
- **MUST** use **design tokens, not hard-coded colors**; **i18n keys, not hard-coded
  strings** (ENG-02).
- **MUST** write comments that explain **why**, not what; keep them true to the code.

## 3. Inheritable — a new dev can take it over
- **MUST** follow the **established structure**: features map to the IA/routes
  (SPEC-05); like things live in like places; predictable file naming (ENG-02).
- **MUST** give public functions/modules **clear, typed signatures**; export the types
  next to them. No implicit `any` at boundaries.
- **MUST** keep modules **free of hidden side effects**; dependencies are explicit
  (e.g. Directus/Redis only via `@/lib/*`), so units are understandable in isolation.
- **MUST** drive configuration from **typed, validated env** — one source of truth,
  never hard-coded; document new env in `.env*.example`.
- **MUST** keep history legible: Conventional Commits + filled PR template (ENG-03).
- **MUST NOT** be clever/obscure — optimize for the next reader. Prefer boring,
  obvious code over terse tricks.
- **Onboarding test:** a new dev can run the app (ENG-05) and locate any feature from
  the IA + naming alone, and add a sibling feature by following an existing one.

## 4. Scalable — grows without a rewrite
- **MUST** separate concerns: **presentation** (components) / **data access**
  (`lib/`, Directus SDK) / **business rules** (route handlers, server, Directus
  Flows). **No** Directus/Redis calls inside React components.
- **MUST** keep data access behind a **thin layer** (SPEC-04) so a backend swap
  doesn't ripple — the ERP-ready interface (ADR-0003) is the canonical example.
- **MUST** keep the frontend **stateless**; cache deliberately (Redis SKU path) with
  explicit invalidation.
- **MUST** **paginate / `limit` every list query** — no unbounded fetches.
- **MUST** be **additive, open/closed**: a new module/collection should *add* files,
  not edit unrelated ones. No god-files, no shared mutable globals.
- **MUST** keep schema changes **additive + migration-tracked**; a breaking
  rename/removal needs a migration **and** an ADR.
- **MUST** apply cross-cutting concerns (i18n, RBAC, SEO, caching) **uniformly** via
  shared mechanisms — never per-page hacks.
- **MUST** respect the performance budget as the app grows (PROC-04 / TEST-04);
  **measure before optimizing**.

## 5. Security & data (always-on constraints)
- **MUST** validate all external input (zod) server-side before use.
- **MUST NOT** expose secrets/admin tokens to the client; server-only env stays server-side.
- **MUST** enforce RBAC + row-level access (a customer reads only their own data, SPEC-09).
- **MUST** rate-limit + anti-spam public mutations (RFQ/contact).

---

## 6. Enforcement — constraints are real, not vibes
| Area | Enforced by | Command / config |
|---|---|---|
| Formatting | **Prettier** + **EditorConfig** | `npm run format:check` · `.prettierrc`, `.editorconfig` |
| Lint rules (no-unused, no-explicit-any, no-console, eqeqeq, prefer-const) | **ESLint** | `npm run lint` · `frontend/.eslintrc.json` |
| Types (strict, no implicit any) | **TypeScript** | `npm run typecheck` |
| Build integrity | **Next build** | `npm run build` |
| Tests | **Vitest / Playwright** | per TEST-01 |
| Performance budget | **Lighthouse CI** | per TEST-04 / PROC-04 |
| Judgment (SRP, structure, naming, completeness, scalability) | **Code review** | REV-01 |

CI must be green (format, lint, types, build, tests) before review; review covers
what tools can't. Both gate merge.

## 7. Pre-merge constraint checklist (condensed → REV-01 / PR template)
- [ ] Complete: all states handled; no dead code / stray debug / untracked TODO.
- [ ] Clean: typecheck + lint + format green; small, named, DRY; tokens & i18n, not literals.
- [ ] Inheritable: follows structure; typed boundaries; explicit deps; env-driven; docs updated.
- [ ] Scalable: concerns separated; queries bounded; additive change; perf budget held.
- [ ] Secure: input validated; no secret leak; RBAC/row-level correct.
