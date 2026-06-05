# ADR-0008 — RFQ-based commerce (no checkout/payments at launch)

**Status:** Accepted · **Date:** 2026-06-03

## Context
B2B industrial procurement is quote-driven: buyers request quotations, negotiate, and
order against terms (often with credit/công nợ), not via instant card checkout. The
contract describes RFQ Cart, Request Sample, and Add-to-Cart.

## Decision
"Add to Cart" means **add to an RFQ cart**. The buyer submits an RFQ; Sales responds
with a quote and creates orders. **No online payment/checkout** is built at launch.

## Consequences
- Matches B2B buying behaviour and the contract's RFQ language.
- No PCI/payment-gateway scope; lower risk and cost.
- Orders/invoices are managed in the portal (ADR-0003); payment terms tracked as
  công nợ, not online transactions.

## Alternatives considered
- **Full transactional checkout** — out of scope, wrong model for this audience;
  a future phase if ULink wants self-serve ordering with payment.
