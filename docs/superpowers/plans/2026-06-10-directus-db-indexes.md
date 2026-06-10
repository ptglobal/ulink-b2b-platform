# Directus DB Indexes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add migration-tracked PostgreSQL indexes for Directus portal query paths so RBAC-scoped list reads and date/status filters stop falling back to table scans.

**Architecture:** Keep Directus metadata in `bootstrap.mjs`, but keep physical DB indexes in a dedicated SQL migration file. Use explicit PostgreSQL DDL so the index set is visible, reviewable, and repeatable. Verify the change with catalog queries and `EXPLAIN (ANALYZE, BUFFERS)` against the local Docker Compose Postgres service.

**Tech Stack:** PostgreSQL 16, Directus 11, Docker Compose, `psql`, PowerShell

---

### Task 1: Freeze the exact index surface before editing

**Files:**
- Read: `directus/schema/collections.mjs`
- Read: `directus/schema/relations.mjs`
- Read: `directus/SCHEMA.md`
- Read: `docs/jobs/listwork.md`

- [ ] **Step 1: Inspect current DB index coverage for target portal tables**

Run:

```powershell
docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = '\''public'\'' AND tablename IN ('\''customers'\'','\''orders'\'','\''order_items'\'','\''invoices'\'','\''deliveries'\'','\''rfq_requests'\'') ORDER BY tablename, indexname;"'
```

Expected:
- Existing unique indexes are visible for unique fields such as `code` and `erp_ref`.
- No surprise custom index already covers the FK/date/status filters.

- [ ] **Step 2: Confirm exact column names for quoted identifiers**

Run:

```powershell
docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = '\''public'\'' AND table_name IN ('\''customers'\'','\''orders'\'','\''order_items'\'','\''invoices'\'','\''deliveries'\'','\''rfq_requests'\'') AND column_name IN ('\''user'\'','\''sales_owner'\'','\''customer'\'','\''hub'\'','\''order'\'','\''sku'\'','\''status'\'','\''order_date'\'','\''due_date'\'','\''scheduled_date'\'','\''assigned_sales'\'') ORDER BY table_name, column_name;"'
```

Expected:
- `user` and `order` are confirmed as quoted identifiers in SQL.
- No column-name mismatch before the migration is written.

### Task 2: Add one SQL migration with the full index set

**Files:**
- Create: `directus/sql/migrations/2026-06-10-add-query-indexes.sql`

- [ ] **Step 1: Create the migration file with explicit `CREATE INDEX CONCURRENTLY` statements**

Use this exact file content:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_user ON customers ("user");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_sales_owner ON customers (sales_owner);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_status ON customers (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer ON orders (customer);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_hub ON orders (hub);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_date ON orders (order_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order ON order_items ("order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_sku ON order_items (sku);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_customer ON invoices (customer);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_order ON invoices ("order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_order ON deliveries ("order");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_hub ON deliveries (hub);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_status ON deliveries (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deliveries_scheduled_date ON deliveries (scheduled_date);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rfq_requests_hub ON rfq_requests (hub);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rfq_requests_assigned_sales ON rfq_requests (assigned_sales);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rfq_requests_user ON rfq_requests ("user");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rfq_requests_status ON rfq_requests (status);
```

Why this set:
- Covers all FK fields named in the schema/relations docs.
- Covers the explicit query filters requested: `status`, `order_date`, `due_date`, `scheduled_date`.
- Leaves unique fields alone because they already have indexes or unique constraints.

- [ ] **Step 2: Keep the migration additive only**

Do not touch:
- `directus/bootstrap.mjs`
- `directus/schema/collections.mjs`
- `directus/schema/relations.mjs`

Reason:
- Bootstrap is for Directus metadata, not PostgreSQL DDL.
- This change must stay migration-tracked, not hidden in bootstrap side effects.

### Task 3: Apply migration locally and prove it does not break Directus reads

**Files:**
- Read: `docker-compose.yml`
- Read: `directus/sql/migrations/2026-06-10-add-query-indexes.sql`

- [ ] **Step 1: Apply the SQL file to local Postgres outside a transaction**

Run:

```powershell
Get-Content .\directus\sql\migrations\2026-06-10-add-query-indexes.sql | docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Expected:
- Each statement returns `CREATE INDEX`.
- No transaction error, because `CONCURRENTLY` must not run inside `BEGIN`/`COMMIT`.

- [ ] **Step 2: Refresh planner stats on touched tables**

Run:

```powershell
docker compose exec -T postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "ANALYZE customers; ANALYZE orders; ANALYZE order_items; ANALYZE invoices; ANALYZE deliveries; ANALYZE rfq_requests;"'
```

Expected:
- `ANALYZE` completes without error.
- Planner has fresh stats before `EXPLAIN` verification.

- [ ] **Step 3: Verify Directus can still read the schema-backed collections**

Run:

```powershell
Set-Location .\directus
node rbac_verify.mjs
```

Expected:
- `RBAC verification passed.`
- Authenticated reads on `customers`, `orders`, `order_items`, `invoices`, `deliveries`, and `rfq_requests` still work after index creation.

### Task 4: Prove the new indexes are used for the intended filters

**Files:**
- Read: `directus/sql/migrations/2026-06-10-add-query-indexes.sql`

- [ ] **Step 1: Check FK lookup on orders**

Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, code, status, order_date
FROM orders
WHERE customer = (SELECT id FROM customers WHERE email = 'customer@ulink.com' LIMIT 1)
ORDER BY order_date DESC
LIMIT 20;
```

Expected:
- Planner uses `idx_orders_customer` and/or `idx_orders_order_date`.
- No sequential scan on `orders` for this filter path.

- [ ] **Step 2: Check date filter on invoices**

Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, code, due_date, balance
FROM invoices
WHERE due_date <= DATE '2026-07-31'
ORDER BY due_date DESC
LIMIT 20;
```

Expected:
- Planner uses `idx_invoices_due_date`.
- No sequential scan on `invoices` for the date window query.

- [ ] **Step 3: Check status + schedule filter on deliveries**

Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, status, scheduled_date
FROM deliveries
WHERE status = 'scheduled'
  AND scheduled_date >= DATE '2026-06-01'
ORDER BY scheduled_date ASC
LIMIT 20;
```

Expected:
- Planner uses `idx_deliveries_status` and `idx_deliveries_scheduled_date`.
- Query plan stays index-driven under the combined filter.

- [ ] **Step 4: Check RFQ portal filter by user and status**

Run:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, status, message
FROM rfq_requests
WHERE "user" = (SELECT id FROM directus_users WHERE email = 'customer@ulink.com' LIMIT 1)
  AND status = 'new'
ORDER BY id DESC
LIMIT 20;
```

Expected:
- Planner uses `idx_rfq_requests_user` and `idx_rfq_requests_status`.
- No scan across the full RFQ table for customer-scoped reads.

### Task 5: Close the loop in docs and work tracking

**Files:**
- Modify: `docs/jobs/listwork.md`
- Modify: `directus/SCHEMA.md`

- [ ] **Step 1: Mark item 6 complete in the worklist**

Update the task line in `docs/jobs/listwork.md` so item 6 is no longer an open backlog item after the migration passes verification.

Keep the existing style of the file; do not rewrite the whole list.

- [ ] **Step 2: Add one short index note to the Directus schema doc**

Append a short note near the portal collections / ERP-ready fields section:

```md
Indexes for portal query paths are maintained as SQL migrations under `directus/sql/migrations/`.
Bootstrap does not create PostgreSQL indexes.
```

Expected:
- Future schema edits know exactly where index logic lives.
- No confusion between Directus metadata and PostgreSQL DDL.

- [ ] **Step 3: Record completion state in the repo notes**

If the migration set matches the plan above, the next maintainer should be able to find:
- the SQL file,
- the verification commands,
- and the backlog item status
without searching through bootstrap code.
