# ADR-0002 — Full contract scope on an 8-week timeline

**Status:** Accepted · **Date:** 2026-06-03

## Context
The PRD roadmap splits MVP → Scale-up → Integration. An MVP-first 6-week plan was
proposed (portal deferred). The client requires **all contract features** complete.
A 6-week full-scope attempt collided Portal + Quick Order + i18n + performance into
one week with no buffer.

## Decision
Deliver **full contract scope** over **8 weeks**. The two extra weeks add a dedicated
i18n + performance + QA week (Week 7) and a real UAT/go-live week (Week 8), and fund
the ERP-ready interface (Week 6).

## Consequences
- Feasible without the Week-5 cram; buffer before go-live.
- Two parallel dev tracks (site/content vs platform/commerce) cover the scope.
- At a fixed price, 8 weeks deepens the upfront loss-leader — justified by the
  royalty + per-site maintenance recurring revenue (see delivery plan §1, §12).

## Alternatives considered
- **MVP-first 6 weeks** — rejected; client wants all features now.
- **Full scope in 6 weeks** — rejected; unacceptable density/risk to acceptance.
