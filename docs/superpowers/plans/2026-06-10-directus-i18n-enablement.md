# Directus i18n Enablement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Directus Translations for text-bearing content collections, provision `vi/en/ja`, and lock `vi` as the default fallback locale.

**Architecture:** Keep one Directus i18n manifest in `directus/lib/i18n.mjs` so locale order and translatable collections stay in one place. Bootstrap will create the `languages` collection entries in `vi -> en -> ja` order, attach translation support to content collections, and seed the fallback locale so existing content keeps rendering after the schema change. Verification will assert both the locale order and the translated-content shape, then docs will be synced to the new Directus contract.

**Tech Stack:** Directus bootstrap scripts, Directus SDK, Node test scripts, Markdown docs.

---

## File Structure

- Create: `directus/lib/i18n.mjs`
  Responsibility: single source of truth for `vi/en/ja`, default locale, and the set of content collections that should expose translations.
- Modify: `directus/schema/collections.mjs`
  Responsibility: add the `languages` collection and wire translation-enabled collection definitions for content collections only.
- Modify: `directus/schema/relations.mjs`
  Responsibility: add the translation relations that Directus needs for each translated collection.
- Modify: `directus/bootstrap.mjs`
  Responsibility: create/update `languages` rows in deterministic order and ensure translated collections are bootstrapped idempotently.
- Modify: `directus/seed/initial_content.mjs`
  Responsibility: backfill seeded content into the default locale so the site keeps rendering after translations are enabled.
- Modify: `directus/verify_bootstrap.mjs`
  Responsibility: fail if locales are missing, misordered, or if translated collections are not provisioned.
- Modify: `directus/SCHEMA.md`
  Responsibility: sync the schema doc with the actual locale model and fallback rule.
- Modify: `docs/specs/SPEC-07-i18n-spec.md`
  Responsibility: align the i18n spec with the Directus-side bootstrap contract.
- Modify: `docs/testing/TEST-03-uat-checklist.md`
  Responsibility: add the backend UAT smoke checks for locale order and fallback locale behavior.

## Task 0: Lock the i18n contract in verification first

**Files:**
- Modify: `directus/verify_bootstrap.mjs`

- [ ] **Step 1: Write the failing verification**

Add assertions that the Directus instance has:
- a `languages` collection with exactly `vi`, `en`, and `ja`
- `vi` first in sort order
- translation-enabled content collections present for the content model
- at least one seeded content record visible in the fallback locale

Example assertions to add:

```js
assert.deepEqual(locales.map((row) => row.code), ['vi', 'en', 'ja']);
assert.equal(locales[0].code, 'vi');
```

- [ ] **Step 2: Run the current bootstrap verify**

Run:
```bash
cd directus && npm run verify
```

Expected: fail, because the bootstrap does not yet provision the Directus i18n model.

- [ ] **Step 3: Keep the assertion shape stable**

Make the verify checks explicit enough that later tasks can prove the fallback locale is actually locked, not just present.

- [ ] **Step 4: Re-run verify after implementation**

Run:
```bash
cd directus && npm run verify
```

Expected: pass only after locales, translation collections, and fallback order are wired.

- [ ] **Step 5: Commit**

```bash
git add directus/verify_bootstrap.mjs
git commit -m "test: lock directus i18n verify"
```

## Task 1: Add one i18n manifest and wire Directus schema

**Files:**
- Create: `directus/lib/i18n.mjs`
- Modify: `directus/schema/collections.mjs`
- Modify: `directus/schema/relations.mjs`

- [ ] **Step 1: Write the locale and collection manifest**

Create one shared manifest:

```js
export const DEFAULT_LOCALE = 'vi';

export const LOCALES = [
  { code: 'vi', name: 'Vietnamese', direction: 'ltr', sort: 1 },
  { code: 'en', name: 'English', direction: 'ltr', sort: 2 },
  { code: 'ja', name: 'Japanese', direction: 'ltr', sort: 3 }
];

export const TRANSLATABLE_COLLECTIONS = [
  'hero_banners',
  'partners',
  'product_categories',
  'products',
  'industries',
  'regional_hubs',
  'blog_posts',
  'case_studies',
  'iso_certifications',
  'pages',
  'site_settings',
  'homepage'
];
```

- [ ] **Step 2: Expand collection defs**

Add the Directus translation model to the content collections above:
- source collection gets a `translations` alias field
- generated `<collection>_translations` collection holds localized text fields
- `languages_code` links to `languages`

Keep non-content collections out of the translation system:
- `product_skus`
- `documents`
- `customers`
- `orders`
- `order_items`
- `invoices`
- `deliveries`
- `rfq_requests`

- [ ] **Step 3: Add relation defs**

Add the relation wiring for the `languages` collection and each `<collection>_translations` collection so Directus can resolve the locale rows cleanly in bootstrap and Studio.

- [ ] **Step 4: Run bootstrap schema check**

Run:
```bash
cd directus && npm run bootstrap
```

Expected: bootstrap creates the schema without translation-related errors.

- [ ] **Step 5: Commit**

```bash
git add directus/lib/i18n.mjs directus/schema/collections.mjs directus/schema/relations.mjs
git commit -m "feat: define directus i18n schema"
```

## Task 2: Seed locales and lock fallback `vi`

**Files:**
- Modify: `directus/bootstrap.mjs`
- Modify: `directus/seed/initial_content.mjs`

- [ ] **Step 1: Write the locale bootstrap behavior**

Update bootstrap so it creates or updates `languages` rows in this order:
1. `vi`
2. `en`
3. `ja`

This order is the lock for the Directus default tab and fallback locale.

- [ ] **Step 2: Backfill existing seed content into the default locale**

Make seeded content land in the fallback locale so a fresh bootstrap still renders:
- homepage
- hero banners
- products / categories
- hubs
- blog posts
- case studies
- pages
- site settings

Use the current seeded text as the `vi` fallback data until the translated content is authored.

- [ ] **Step 3: Run bootstrap on a clean Directus instance**

Run:
```bash
cd directus && npm run bootstrap
```

Expected: Directus now has `vi/en/ja`, `vi` is first, and seeded content exists in the fallback locale.

- [ ] **Step 4: Re-run verification**

Run:
```bash
cd directus && npm run verify
```

Expected: pass with locale order and fallback checks green.

- [ ] **Step 5: Commit**

```bash
git add directus/bootstrap.mjs directus/seed/initial_content.mjs
git commit -m "feat: seed directus locales"
```

## Task 3: Sync docs and UAT checks

**Files:**
- Modify: `directus/SCHEMA.md`
- Modify: `docs/specs/SPEC-07-i18n-spec.md`
- Modify: `docs/testing/TEST-03-uat-checklist.md`

- [ ] **Step 1: Write the doc updates**

Update `directus/SCHEMA.md` to state:
- Directus Translations are enabled on the content collections listed in the manifest
- `vi` is the default and fallback locale
- `en` and `ja` are available in the `languages` collection

Update `SPEC-07` to state:
- the Directus locale model is bootstrapped, not manual-only
- fallback locale is locked to `vi`
- content-at-launch policy still applies on top of the Directus locale setup

Add UAT checks for:
- `vi/en/ja` exist in Directus
- `vi` sorts first
- translated content still renders when `en` or `ja` is missing

- [ ] **Step 2: Run markdown review**

Run:
```bash
rg -n "vi|en|ja|fallback|translations|languages" directus docs/specs/SPEC-07-i18n-spec.md docs/testing/TEST-03-uat-checklist.md
```

Expected: the updated docs show the new locale model and no stale language assumptions remain.

- [ ] **Step 3: Commit**

```bash
git add directus/SCHEMA.md docs/specs/SPEC-07-i18n-spec.md docs/testing/TEST-03-uat-checklist.md
git commit -m "docs: document directus i18n setup"
```

## Self-Review

Coverage check:
- Locale provisioning is covered by Task 1 and Task 2.
- Fallback `vi` order is covered by Task 0 and Task 2.
- Translatable collection wiring is covered by Task 1.
- Seeded content survival is covered by Task 2.
- Documentation alignment is covered by Task 3.

Placeholder check:
- No `TODO`, `TBD`, or vague "handle edge cases" language remains in the plan.

Type consistency check:
- `DEFAULT_LOCALE`, `LOCALES`, and `TRANSLATABLE_COLLECTIONS` are used consistently across tasks.
- `languages` is the single locale source in Directus; `vi` is the first row and fallback.

Plan complete and saved to `docs/superpowers/plans/2026-06-10-directus-i18n-enablement.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
