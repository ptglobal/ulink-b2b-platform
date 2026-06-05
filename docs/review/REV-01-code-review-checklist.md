# REV-01 — Code Review Checklist

**Status:** Baseline · **Owner:** Reviewers · **Pairs with:** [PR template](../../.github/pull_request_template.md), [ENG-04 DoD](../engineering/ENG-04-definition-of-done.md), [ENG-06 Coding Constraints](../engineering/ENG-06-coding-constraints.md)

Review for **real problems that matter**. Prefer fewer, high-confidence comments over
nitpicks. Block on correctness/security; suggest on style.

## Correctness
- [ ] Does it meet the acceptance criteria / ticket?
- [ ] Edge cases & error paths handled (empty, missing data, network failure)?
- [ ] No off-by-one / null / race issues; promises awaited.
- [ ] Server vs client component boundary correct; no client secrets.

## Security
- [ ] External input validated (zod) before use.
- [ ] No secrets in client bundle/logs; `DIRECTUS_TOKEN` server-only.
- [ ] Permissions/row-level correct (customer sees only own data).
- [ ] Anti-spam present on public mutations (RFQ/contact).

## Performance
- [ ] No N+1 / unbounded queries; appropriate `limit`/`fields`.
- [ ] Images via `next/image`; no heavy client JS added to static pages.
- [ ] Cache used/invalidated correctly (SKU path).

## i18n & accessibility
- [ ] No hard-coded user-facing strings; keys exist in all locales used.
- [ ] Semantic HTML, labels, focus-visible, AA contrast on changed UI.

## Conventions & maintainability
- [ ] Satisfies the [ENG-06 coding constraints](../engineering/ENG-06-coding-constraints.md) (complete · clean · inheritable · scalable).
- [ ] Follows ENG-02 (naming, tokens not hex, `cn()`, aliases).
- [ ] Reasonable size/duplication; no dead code; clear names.
- [ ] Tests present and meaningful (TEST-01).

## Hygiene
- [ ] CI green (typecheck, lint, build).
- [ ] PR scoped and described; docs updated if needed.

## Reviewer etiquette
- State severity: **blocking** vs **suggestion** vs **question**.
- Explain *why*; propose a fix when you can. Approve when blocking items resolve.
