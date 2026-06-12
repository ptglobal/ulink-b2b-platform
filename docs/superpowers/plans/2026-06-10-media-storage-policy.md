# Media Storage Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the agreed media policy end-to-end in Directus: local uploads only, module-based folders, strict type and size limits, soft delete with 7-day retention, daily 12:00 purge, off-box backups, and full audit logging.

**Architecture:** Keep files on the mounted Directus volume at `directus/uploads`. Use Directus env vars for the global storage baseline, then enforce the policy rules in a dedicated Directus extension plus a small host-side cleanup script. Track lifecycle state in dedicated Directus collections so soft delete, hard delete, and audit are explicit and testable. Keep the policy in docs and bootstrap verification so storage drift is visible immediately.

**Tech Stack:** Directus 11, PostgreSQL 16, Docker Compose, Node 20, `@directus/sdk`, PowerShell, cron / scheduled task.

---

### Task 1: Freeze the policy contract in docs before code changes

**Files:**
- Modify: `docs/specs/SPEC-09-security-rbac.md`
- Modify: `docs/guides/GUIDE-01-cms-admin-guide.md`
- Modify: `docs/operations/OPS-03-backup-recovery-monitoring.md`
- Modify: `docs/testing/TEST-02-test-cases.md`
- Modify: `docs/testing/TEST-03-uat-checklist.md`

- [ ] **Step 1: Add the media policy block to SPEC-09**

Insert this under `## Files & uploads`:

```md
- Storage: local only via the mounted Directus volume at `directus/uploads`.
- Allowed upload types:
  - Images: `jpg`, `jpeg`, `png`, `webp`
  - SVG: internal team / brand asset only
  - Documents: `pdf`, `docx`, `xlsx`
- Global size cap: `10MB`.
- SVG cap: `2MB`.
- Deletion flow: soft delete first, hard delete after `7 days`.
- Cleanup job: daily at `12:00`.
- Orphan files: keep a `24h` grace period before purge.
- Audit log: record actor, timestamp, action, file metadata, module, source, IP, and user agent.
```

- [ ] **Step 2: Update the CMS admin guide so editors use the same workflow**

Replace the current media section in `docs/guides/GUIDE-01-cms-admin-guide.md` with:

```md
| Media (images/files) | File Library + media retention workflow |

Rules:
- Upload only approved file types.
- Store media in the module folder shown by the file policy.
- Do not upload user-supplied SVG unless it is sanitized or explicitly approved as a brand asset.
- Use soft delete for removal requests; hard delete happens later via cleanup or admin confirm flow.
- Do not delete media still referenced by content.
```

- [ ] **Step 3: Update backup and recovery wording**

Replace the media backup row in `docs/operations/OPS-03-backup-recovery-monitoring.md` with:

```md
| Media (uploads) | sync `directus/uploads` to off-box storage daily | daily | same retention as DB |
```

Add this restore note:

```md
Restore order: DB first, then media, then smoke test. Restore media from the off-box copy, not from the running container volume.
```

- [ ] **Step 4: Add media upload/delete cases to test docs**

Append these cases to `docs/testing/TEST-02-test-cases.md` and `docs/testing/TEST-03-uat-checklist.md`:

```md
- Allowed PNG upload succeeds.
- Allowed PDF upload succeeds.
- Oversize upload is rejected.
- Untrusted SVG upload is rejected.
- Soft delete creates a retention record and moves the file into the trash flow.
- Hard delete only works after the 7-day retention window or via admin confirm flow.
- Orphan file cleanup removes unreferenced files only after the 24h grace period.
- Audit log includes actor, file id, original filename, size, mime, module, source, IP, and user agent.
```

### Task 2: Wire local storage and upload guardrails into Docker Compose

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add explicit Directus storage and upload limits**

Update the `directus` service environment block to include:

```yml
      STORAGE_LOCATIONS: local
      STORAGE_LOCAL_DRIVER: local
      STORAGE_LOCAL_ROOT: /directus/uploads

      FILES_MAX_UPLOAD_SIZE: 10485760
      FILES_MIME_TYPE_ALLOW_LIST: image/jpeg,image/png,image/webp,image/svg+xml,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

Keep the existing volume mount:

```yml
      - ./directus/uploads:/directus/uploads
```

- [ ] **Step 2: Verify the container sees the policy env vars**

Run:

```powershell
docker compose up -d directus
docker compose exec -T directus printenv | findstr /C:"STORAGE_" /C:"FILES_MAX_UPLOAD_SIZE" /C:"FILES_MIME_TYPE_ALLOW_LIST"
```

Expected:
- `STORAGE_LOCATIONS=local`
- `STORAGE_LOCAL_ROOT=/directus/uploads`
- `FILES_MAX_UPLOAD_SIZE=10485760`
- MIME allow list includes only the approved file types.

### Task 3: Add shared media-policy constants and lifecycle collections

**Files:**
- Create: `directus/lib/media-policy.mjs`
- Modify: `directus/schema/collections.mjs`
- Modify: `directus/schema/relations.mjs`
- Modify: `directus/rbac/permissions.mjs`
- Modify: `directus/bootstrap.mjs`
- Modify: `directus/verify_bootstrap.mjs`
- Modify: `directus/SCHEMA.md`

- [ ] **Step 1: Add one shared media policy module**

Create `directus/lib/media-policy.mjs` with one source of truth:

```js
export const MEDIA_POLICY = {
  cleanupCron: '0 12 * * *',
  maxUploadBytes: 10 * 1024 * 1024,
  svgMaxBytes: 2 * 1024 * 1024,
  softDeleteDays: 7,
  orphanGraceHours: 24,
  allowedExtensions: new Set(['jpg', 'jpeg', 'png', 'webp', 'svg', 'pdf', 'docx', 'xlsx']),
  allowedMimeTypes: new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  moduleFolders: {
    products: 'media/products',
    documents: 'media/documents',
    pages: 'media/pages',
    partners: 'media/partners',
    hubs: 'media/regional-hubs',
    settings: 'media/site-settings',
    trash: 'media/trash'
  }
};
```

- [ ] **Step 2: Add the lifecycle collections**

Add two new collections in `directus/schema/collections.mjs`:

```js
{
  collection: 'media_retention',
  meta: { icon: 'delete', note: 'Media Retention Queue' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'file', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'module', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'state', type: 'string', meta: { interface: 'select-dropdown', required: true } },
    { field: 'soft_deleted_at', type: 'timestamp', meta: { interface: 'datetime' } },
    { field: 'purge_after', type: 'timestamp', meta: { interface: 'datetime' } },
    { field: 'delete_reason', type: 'text', meta: { interface: 'textarea' } },
    { field: 'deleted_by', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'hard_deleted_at', type: 'timestamp', meta: { interface: 'datetime' } },
    { field: 'hard_deleted_by', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'source', type: 'string', meta: { interface: 'input' } },
    { field: 'original_filename', type: 'string', meta: { interface: 'input' } },
    { field: 'mime_type', type: 'string', meta: { interface: 'input' } },
    { field: 'size_bytes', type: 'integer', meta: { interface: 'input' } }
  ]
},
{
  collection: 'media_audit_events',
  meta: { icon: 'fact_check', note: 'Media Audit Log' },
  schema: {},
  fields: [
    ID_FIELD,
    { field: 'file', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'actor', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
    { field: 'event_type', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'action', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'module', type: 'string', meta: { interface: 'input' } },
    { field: 'reason', type: 'text', meta: { interface: 'textarea' } },
    { field: 'source', type: 'string', meta: { interface: 'input' } },
    { field: 'ip_address', type: 'string', meta: { interface: 'input' } },
    { field: 'user_agent', type: 'string', meta: { interface: 'input' } },
    { field: 'original_filename', type: 'string', meta: { interface: 'input' } },
    { field: 'mime_type', type: 'string', meta: { interface: 'input' } },
    { field: 'size_bytes', type: 'integer', meta: { interface: 'input' } }
  ]
}
```

- [ ] **Step 3: Add the relations used by the retention and audit records**

Add these relations in `directus/schema/relations.mjs`:

```js
{ collection: 'media_retention', field: 'file', related_collection: 'directus_files' },
{ collection: 'media_retention', field: 'deleted_by', related_collection: 'directus_users' },
{ collection: 'media_retention', field: 'hard_deleted_by', related_collection: 'directus_users' },
{ collection: 'media_audit_events', field: 'file', related_collection: 'directus_files' },
{ collection: 'media_audit_events', field: 'actor', related_collection: 'directus_users' }
```

- [ ] **Step 4: Seed module folders and the trash folder during bootstrap**

Extend `directus/bootstrap.mjs` so it creates these folders if missing:

```js
media/products
media/documents
media/pages
media/partners
media/regional-hubs
media/site-settings
media/trash
```

Keep folder creation idempotent. The hook and cleanup job will only store folder ids, not hard-coded paths.

- [ ] **Step 5: Grant upload permissions without giving native delete power**

Extend `directus/rbac/permissions.mjs` so `Editor` and `Sales` can `create`, `read`, and `update` `directus_files`, but do not grant native `delete` on `directus_files`.

Use this shape for the new permission block:

```js
for (const action of ['create', 'read', 'update']) {
  permissions.push({
    policy: EDITOR_POLICY_ID,
    collection: 'directus_files',
    action,
    permissions: {},
    fields: ['*']
  });
}

for (const action of ['create', 'read', 'update']) {
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'directus_files',
    action,
    permissions: {},
    fields: ['*']
  });
}
```

- [ ] **Step 6: Extend bootstrap verification**

Add checks to `directus/verify_bootstrap.mjs` for:
- `media_retention`
- `media_audit_events`
- the expected media folder rows
- the `directus_files` create/read/update permissions for Editor and Sales
- the shared policy constants imported from `directus/lib/media-policy.mjs`

Expected output:
- Bootstrap verify fails if media collections or folders are missing.
- The media policy is visible in the same verification gate as the rest of the schema.

- [ ] **Step 7: Document the new collections in `directus/SCHEMA.md`**

Add a short note near the system collections section:

```md
Media retention and audit are tracked in `media_retention` and `media_audit_events`.
Uploads stay local under `directus/uploads`; folder assignment follows the module map in `directus/lib/media-policy.mjs`.
```

### Task 4: Implement the media-policy extension and cleanup job

**Files:**
- Create: `directus/extensions/media-policy/package.json`
- Create: `directus/extensions/media-policy/src/index.ts`
- Create: `directus/extensions/media-policy/src/rules.ts`
- Create: `directus/extensions/media-policy/src/audit.ts`
- Create: `directus/extensions/media-policy/src/service.ts`
- Create: `directus/media-cleanup.mjs`

- [ ] **Step 1: Scaffold the Directus extension package**

Create `directus/extensions/media-policy/package.json`:

```json
{
  "name": "ulink-media-policy",
  "private": true,
  "type": "module",
  "dependencies": {
    "@directus/extensions-sdk": "^11.0.0"
  }
}
```

The extension must live under `directus/extensions/` so the existing Compose mount loads it automatically.

- [ ] **Step 2: Enforce upload rules in the hook**

Implement `directus/extensions/media-policy/src/index.ts` so the hook:
- rejects files outside the allow list
- rejects any file over `10MB`
- rejects SVG over `2MB`
- rejects SVG unless the uploader is an internal/brand account or the file is explicitly routed into a trusted module folder
- sets the target folder from the module map in `directus/lib/media-policy.mjs`
- writes a `media_audit_events` row for every accepted upload

Use the `directus_files.items.create` filter path so the rule blocks the write before the file becomes active.

- [ ] **Step 3: Record soft delete and hard delete transitions explicitly**

Implement `directus/extensions/media-policy/src/service.ts` so it provides:
- `softDeleteFile(fileId, actor, reason, source)`
- `hardDeleteFile(fileId, actor, reason, source)`
- `writeAuditEvent(event)`

Soft delete behavior:
- move the file into `media/trash`
- create or update the matching `media_retention` row
- set `state = 'soft_deleted'`
- set `soft_deleted_at = now()`
- set `purge_after = now() + 7 days`

Hard delete behavior:
- only purge when the retention window has elapsed, or when an admin confirms the manual purge path
- remove the `directus_files` row and the physical file only after audit is written

- [ ] **Step 4: Add the daily cleanup script**

Create `directus/media-cleanup.mjs` so it can run from cron at `12:00` every day:

```bash
node media-cleanup.mjs --dry-run
node media-cleanup.mjs
```

The script must:
- find `media_retention` rows with `state = soft_deleted` and `purge_after <= now()`
- hard delete those files
- find orphan files with no reference and purge only after the 24h grace period
- write an audit event for every purge
- support `--dry-run` and log what would be removed

- [ ] **Step 5: Keep the cleanup logic deterministic**

The cleanup script should read the same constants as the hook:

```js
import { MEDIA_POLICY } from './lib/media-policy.mjs';
```

That keeps the 7-day retention, 24h orphan grace, and module folder rules in one place.

### Task 5: Build verification coverage and UAT checks

**Files:**
- Create: `directus/verify_media_policy.mjs`
- Modify: `docs/testing/TEST-02-test-cases.md`
- Modify: `docs/testing/TEST-03-uat-checklist.md`

- [ ] **Step 1: Add a dedicated verification script**

Create `directus/verify_media_policy.mjs` so it can be run after bootstrap:

```powershell
Set-Location .\directus
node verify_bootstrap.mjs
node verify_media_policy.mjs
```

The script should test:
- allowed PNG upload passes
- allowed PDF upload passes
- oversize file is rejected
- untrusted SVG is rejected
- soft delete writes the retention row and moves the file into the trash flow
- hard delete only succeeds after the retention window or via admin confirm path
- orphan cleanup removes only stale unreferenced files
- audit rows contain actor, timestamp, action, file id, original name, size, mime, module, source, IP, and user agent

- [ ] **Step 2: Add the media cases to the test-case doc**

Append the media cases to `docs/testing/TEST-02-test-cases.md` so the UAT owner can run them manually if the script fails.

- [ ] **Step 3: Add the media items to the UAT gate**

Append these checks to `docs/testing/TEST-03-uat-checklist.md`:
- upload allowed files
- reject oversized files
- reject untrusted SVG
- soft delete by admin/editor/sales
- hard delete by admin confirm only
- cleanup job at `12:00`
- backup restore includes uploads

### Task 6: Close the loop in ops docs and work tracking

**Files:**
- Modify: `docs/operations/OPS-02-technical-handover.md`
- Modify: `docs/operations/OPS-03-backup-recovery-monitoring.md`
- Modify: `docs/jobs/listwork.md`
- Modify: `directus/SCHEMA.md`

- [ ] **Step 1: Add the ops commands that operators will actually run**

Add this cron example to `OPS-03`:

```bash
0 12 * * * cd "$DIRECTUS_ROOT/directus" && node media-cleanup.mjs >> /var/log/ulink-media-cleanup.log 2>&1
```

Add this backup sync example:

```bash
rsync -a --delete ./directus/uploads/ "$BACKUP_TARGET/uploads/"
```

- [ ] **Step 2: Update the handover table**

Set the Media row in `OPS-02` to:

```md
| Media | local volume `directus/uploads` + off-box backup target | `media/products`, `media/documents`, `media/pages`, `media/partners`, `media/regional-hubs`, `media/site-settings`, `media/trash` |
```

- [ ] **Step 3: Mark backlog item 7 complete only after verification passes**

Update `docs/jobs/listwork.md` so item 7 is no longer an open backlog item after `verify_media_policy.mjs` passes.

The final state should make one thing obvious:
- Directus keeps uploads local.
- Upload rules are enforced in code, not tribal memory.
- Delete lifecycle is explicit, testable, and auditable.
