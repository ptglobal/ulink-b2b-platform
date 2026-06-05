# PROC-01 — Bug Tracking Process

**Status:** Baseline · **Owner:** BA/Tester · **Intake:** [bug report template](../../.github/ISSUE_TEMPLATE/bug_report.md)

## 1. Lifecycle
```
New → Triaged → In Progress → In Review → In Test → Closed
                     └────────── Reopened ◀── (failed retest)
                     Won't Fix / Duplicate / Cannot Reproduce (terminal)
```

## 2. Severity (impact)
| Sev | Definition | Example |
|---|---|---|
| **S1 Critical** | Core flow broken / data loss / security breach | RFQ submit fails; customer sees another's orders |
| **S2 Major** | Important feature broken, no reasonable workaround | SKU search returns wrong SKU |
| **S3 Minor** | Feature impaired, workaround exists | Filter mis-sorts |
| **S4 Trivial** | Cosmetic / copy | Misaligned icon, typo |

## 3. Priority (urgency)
P1 (now) · P2 (this sprint) · P3 (backlog) · P4 (someday). Severity guides but does
not equal priority; BA sets priority.

## 4. SLA targets (working hours)
| Sev | Triage | Target fix |
|---|---|---|
| S1 | ≤ 2h | ≤ 1 day (hotfix) |
| S2 | ≤ 1 day | within sprint |
| S3 | ≤ 2 days | scheduled |
| S4 | best-effort | backlog |

## 5. Required fields (intake)
Title, environment (local/staging/prod + browser/device), steps to reproduce,
expected vs actual, severity, screenshots/console/network, affected module, build/commit.

## 6. Triage
Daily during active sprints. Confirm reproducibility, set severity+priority, assign,
link to the failing requirement/test case. Deduplicate.

## 7. Resolution & verification
Fix on a `fix/<scope>` branch (ENG-03) with a regression test where feasible. Tester
**retests on the same environment**; only the Tester moves a bug to Closed. Failed
retest → Reopened.

## 8. Release gate
No release ships with an **open S1 in the RFQ/Order critical path** (NFR-10, ENG-04).
Weekly bug report: open by severity, ageing, critical-path status.
