# ENG-03 — Git & Branching Workflow

**Status:** Baseline · **Owner:** Dev Lead

## Branch model (trunk-based, short-lived branches)
- `main` — always deployable; protected.
- `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>` — branch off `main`,
  merge back via PR. Keep them short-lived (< a few days).
- `release/*` tags for go-live cutovers if needed.

## Commit convention (Conventional Commits)
```
<type>(<scope>): <summary>

<body — what & why>
```
Types: `feat, fix, chore, docs, refactor, test, perf, style, ci`.
Scopes (examples): `home, products, portal, rfq, cms, i18n, seo, infra`.

## Pull requests
- Open a PR to `main`; fill the [PR template](../../.github/pull_request_template.md).
- CI must be green: typecheck, lint, build, (tests when present), Lighthouse on preview.
- ≥ 1 review approval (see [REV-01](../review/REV-01-code-review-checklist.md)).
- **Squash-merge** to keep `main` history linear and readable.

## Protections on `main`
- No direct pushes; PR + passing checks + approval required.
- Linear history (squash). Delete branch on merge.

## Releases
- Tag `vX.Y.Z` at go-live milestones; release notes summarize changes.
- Hotfix: `fix/*` off `main`, fast-tracked review, tag patch.

## Hygiene
- Never commit secrets (`.env*` are git-ignored). Rotate anything leaked.
- Don't commit `node_modules`/`.next`. Line endings normalized via `.gitattributes` (LF).
- Rebase or update branch before merge to avoid stale conflicts.
