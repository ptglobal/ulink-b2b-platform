# PROC-03 — Change Request (CR) Process

**Status:** Baseline · **Owner:** BA/PM · **Basis:** Contract Appendix §3.3, PRD §9

Any work outside the agreed scope (delivery plan / SPEC-01) requires a written CR and
sign-off. Verbal/chat/informal requests do **not** create an obligation (§3.3).

## When a CR is required
- New feature or module not in scope.
- Material change to agreed behaviour, data model, or design.
- **Live ERP/CRM synchronization within the build** (see ADR-0003).
- Anything that affects price, timeline, or the fixed deliverables.

## Flow
```
Request → Log CR → Impact analysis (scope/effort/cost/schedule) → Quote
       → ULink approval (written) → Appendix/agreement → Schedule → Implement → Verify
```

## CR record fields
ID, date, requester, description, rationale, impacted SPEC/modules, effort estimate,
cost, schedule impact, decision (approved/rejected/deferred), approver, linked appendix.

## Rules
- No CR work starts before written approval.
- Approved CRs update the affected SPEC + delivery plan and are added to the backlog
  (PROC-02).
- Rejected/deferred CRs are kept in the log for traceability.

## Template
```
# CR-NNNN — <title>
Requested by / date:
Description & rationale:
Impact (scope / effort / cost / schedule):
Decision: Approved | Rejected | Deferred  — by / date
Linked appendix / PR:
```
