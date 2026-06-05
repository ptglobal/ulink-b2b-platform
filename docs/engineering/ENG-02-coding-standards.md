# ENG-02 — Coding Standards & Conventions

**Status:** Baseline · **Owner:** Dev Lead · **Applies to:** `frontend/`, `directus/`

> The **hard rules** that gate merge are in [ENG-06 Coding Constraints](ENG-06-coding-constraints.md) (complete · clean · inheritable · scalable). This doc is the day-to-day style guide.

## Language & tooling
- **TypeScript strict** everywhere (`tsconfig` `strict: true`). No `any` without a
  written reason. `npm run typecheck` must pass.
- **Lint/format:** ESLint (`eslint-config-next`) + Prettier defaults. CI gates both.
- **Node 20**, npm. Lockfile committed.

## Next.js / React
- **Server Components by default;** add `'use client'` only when needed (state,
  effects, browser APIs, event handlers).
- Data fetching in Server Components / route handlers, not the client, where possible.
- Use **next-intl** navigation (`@/i18n/navigation`) — never raw `next/link` for
  localized routes. Use `setRequestLocale(locale)` in localized pages/layouts.
- Images via `next/image`. No render-blocking third-party scripts.

## Files & naming
- Components: `kebab-case.tsx` files, `PascalCase` exports.
- One component per file for shared components; co-locate page-only pieces.
- Path alias `@/*` → `src/*`. No deep relative `../../../`.
- Route folders mirror the IA (SPEC-05).

## Styling
- **Tailwind only**, consuming design tokens (SPEC-06). **No hard-coded hex**; use
  `bg-primary`, `text-muted-foreground`, etc.
- Compose class names with `cn()` (`@/lib/utils`).
- Shadcn components live in `src/components/ui`.

## Data & API
- Directus access through `@/lib/directus`; Redis through `@/lib/redis`.
- Validate external input (RFQ, forms) with zod before use.
- Never expose `DIRECTUS_TOKEN`/admin secrets to the client. Server-only env stays
  server-side; public env is `NEXT_PUBLIC_*`.

## Errors & logging
- Route handlers return the SPEC-04 error model; no stack traces to clients.
- Log server errors with context; no secrets in logs.

## i18n & a11y (always)
- No hard-coded user-facing strings — use message catalogs (`messages/*.json`).
- Semantic HTML, labels, focus-visible, alt text. AA contrast.

## Commits
- Conventional Commits (ENG-03). Small, focused PRs. Green typecheck/lint/build
  before review.
