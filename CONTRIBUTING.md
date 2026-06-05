# Contributing to ULink B2B Platform

Welcome. This is the contributor entry point; the deep docs live in [`docs/`](docs/README.md).

## Before you start
- Read [ENG-05 Local Setup](docs/engineering/ENG-05-local-development-setup.md).
- Skim [ENG-02 Coding Standards](docs/engineering/ENG-02-coding-standards.md) and
  [ENG-04 Definition of Done](docs/engineering/ENG-04-definition-of-done.md).

## Workflow ([ENG-03](docs/engineering/ENG-03-git-workflow.md))
1. Branch off `main`: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
2. Make focused changes; keep PRs small.
3. Green locally: `npm run typecheck && npm run lint && npm run build`.
4. Open a PR; fill the template; ensure CI is green.
5. Get ≥1 review ([REV-01](docs/review/REV-01-code-review-checklist.md)); squash-merge.

## Commits
Conventional Commits: `type(scope): summary` (e.g. `feat(products): SKU search`).

## Definition of Done
A task isn't done until it meets [ENG-04](docs/engineering/ENG-04-definition-of-done.md),
including the **operator-green** bar for releases (a human verifies the live URL).

## Reporting issues
Use the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) or
[feature request](.github/ISSUE_TEMPLATE/feature_request.md) templates. Bugs follow
[PROC-01](docs/process/PROC-01-bug-tracking-process.md). Out-of-scope requests follow
the [Change Request process](docs/process/PROC-03-change-request-process.md).

## Don't
- Commit secrets (`.env*` are ignored). Rotate anything leaked.
- Hard-code user-facing strings (use i18n) or colors (use design tokens).
- Merge red CI or skip review.
