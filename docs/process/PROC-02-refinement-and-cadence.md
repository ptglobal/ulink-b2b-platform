# PROC-02 — Backlog Refinement & Iteration Cadence

**Status:** Baseline · **Owner:** BA · **Related:** delivery plan §8 (8-week schedule)

## Iteration model
One-week iterations aligned to the 8-week plan. Each week has a theme and ends with a
**clickable staging URL** (operator-green checkpoint) and a client demo.

## Weekly rhythm
| Day | Ceremony | Purpose |
|---|---|---|
| Mon | Planning | Pull refined items for the week; confirm goals |
| Daily | Standup (async ok) | Progress, blockers |
| Wed | Refinement | Groom next week's items: clarify, split, estimate |
| Fri | Demo + review | Show staging; gather ULink feedback; retro notes |

## Story format
`As a <role>, I want <capability>, so that <value>.` Each story has:
acceptance criteria, the SPEC/FR it traces to, design/notes, and a Definition of Ready.

## Definition of Ready (to start)
- Clear acceptance criteria; dependencies known; design/content available or stubbed;
  estimable; fits one iteration (else split).

## Estimation
Relative sizing (S/M/L or points). Track velocity to protect the Wk7/Wk8 buffer.

## Scope control
Freeze scope at end of Week 4 (per plan). New/changed scope → [PROC-03 Change
Request](PROC-03-change-request-process.md). Refinement keeps the backlog ordered by
value and risk (critical RFQ/Order path first).

## Inputs
ULink feedback (Fri demo), bug backlog (PROC-01), tech debt, UAT findings (Wk7).
