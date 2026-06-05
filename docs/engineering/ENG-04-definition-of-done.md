# ENG-04 — Definition of Done (DoD)

**Status:** Baseline · **Owner:** Team · **Applies to:** every task / story / PR

A task is **Done** only when **all** of the following hold. "Code on disk + green
tests" is *not* Done.

## Per-task checklist
- [ ] Meets its acceptance criteria (traces to SPEC-01/02).
- [ ] Meets the [coding constraints](ENG-06-coding-constraints.md) — complete · clean · inheritable · scalable.
- [ ] TypeScript: `npm run typecheck` clean.
- [ ] Lint/format: `npm run lint` clean.
- [ ] Build: `npm run build` succeeds.
- [ ] Tests: relevant unit/integration tests written and passing (see TEST-01).
- [ ] **i18n:** no hard-coded strings; VI present (EN/JP per content policy).
- [ ] **Accessibility:** keyboard + focus + labels + AA contrast on changed UI.
- [ ] **Performance:** no regression to Core Web Vitals / PageSpeed budget on changed pages.
- [ ] **Responsive:** verified desktop / tablet / mobile.
- [ ] **Security:** input validated; no secrets exposed; permissions correct.
- [ ] Code reviewed and approved (REV-01); PR template completed.
- [ ] Docs updated (relevant SPEC/README/CHANGELOG).

## Definition of Done for the release (operator-green)
A feature/release is Done only when:
1. The artifact is rebuilt (frontend bundle / Directus image).
2. The running service is force-recreated/redeployed with the new artifact.
3. Schema migrations + any required seed/config are applied to the live environment.
4. **A human opens the production URL in a browser and sees the expected output.**

CI-green ≠ staging-green ≠ operator-green. "Done" claims must reflect operator-green.

## Critical-path gate
No release ships with a **Critical (S1) bug in the RFQ/Order flow** (NFR-10).
