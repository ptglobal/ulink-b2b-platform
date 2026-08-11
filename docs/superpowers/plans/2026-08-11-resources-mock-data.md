# Resources Mock Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize the `/vi/resources` mock dataset so each visible content group stays capped at three items, while every card has complete and believable image-backed content.

**Architecture:** Keep the existing `ResourceItem`-based structure and the current `ResourcesClient` composition model. Update only the mock-data layer and add validation tests so the page still merges Directus content with local mocks, but the local mocks are curated to a smaller, cleaner set with stronger image coverage.

**Tech Stack:** Next.js 14, React 18, TypeScript, `node --import tsx --test`, existing `ResourceItem` types, existing `frontend/public/images` assets.

## Global Constraints

- Preserve the existing `ResourceItem` contract in `frontend/src/components/resources/types.ts`.
- Keep localized content in `vi`, `en`, and `ja` for every mock resource.
- Reuse existing image assets under `frontend/public/images`; do not introduce placeholder or broken image paths.
- Do not change the Directus fetch behavior in `frontend/src/app/[locale]/(main)/resources/page.tsx`.
- Keep `ResourcesClient` filtering, sorting, and detail-view behavior unchanged unless a test proves a data-shape issue.

---

### Task 1: Lock the mock-data target matrix

**Files:**
- Modify: `frontend/src/components/resources/mock-data.ts`
- Test: `frontend/src/components/resources/mock-data.test.ts`

**Interfaces:**
- Consumes: `MOCK_RESOURCES`, `MOST_VIEWED_ARTICLES`, `UPCOMING_EVENTS`
- Produces: a stable mock-data set with 3 items per visible group and full image metadata

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_RESOURCES, MOST_VIEWED_ARTICLES, UPCOMING_EVENTS } from './mock-data';

test('resources mock data keeps the intended item counts', () => {
  const counts = MOCK_RESOURCES.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  assert.equal(counts.guide, 3);
  assert.equal(counts.standard, 3);
  assert.equal(counts['case-study'], 3);
  assert.equal(counts.news, 3);
  assert.equal(counts.event, 3);
  assert.equal(MOST_VIEWED_ARTICLES.length, 3);
  assert.equal(UPCOMING_EVENTS.length, 3);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend; node --import tsx --test src/components/resources/mock-data.test.ts`
Expected: fail until the new count rules are enforced.

- [ ] **Step 3: Rewrite the data set to match the target matrix**

```ts
// Keep 3 resources per category in MOCK_RESOURCES.
// Reduce MOST_VIEWED_ARTICLES from 4 items to 3 items.
// Keep UPCOMING_EVENTS at 3 items, but make each event card image-specific and descriptive.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend; node --import tsx --test src/components/resources/mock-data.test.ts`
Expected: pass with 3/3/3 counts.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/resources/mock-data.ts frontend/src/components/resources/mock-data.test.ts
git commit -m "feat(resources): normalize mock content counts"
```

### Task 2: Make every image assignment content-complete

**Files:**
- Modify: `frontend/src/components/resources/mock-data.ts`
- Reference: `frontend/public/images/**`
- Test: `frontend/src/components/resources/mock-data.test.ts`

**Interfaces:**
- Consumes: `image`, `title`, `description`, `badge`, `category`
- Produces: image-path coverage with no generic or weak fallback choices

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_RESOURCES, MOST_VIEWED_ARTICLES, UPCOMING_EVENTS } from './mock-data';

function collectItems() {
  return [...MOCK_RESOURCES, ...MOST_VIEWED_ARTICLES, ...UPCOMING_EVENTS];
}

test('resources mock data uses concrete image assets and localized copy', () => {
  for (const item of collectItems()) {
    assert.ok(item.image.startsWith('/images/'));
    assert.ok(item.title.vi.trim().length > 0);
    assert.ok(item.title.en.trim().length > 0);
    assert.ok(item.title.ja.trim().length > 0);
    assert.ok(item.description.vi.trim().length > 0);
    assert.ok(item.description.en.trim().length > 0);
    assert.ok(item.description.ja.trim().length > 0);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend; node --import tsx --test src/components/resources/mock-data.test.ts`
Expected: fail on any blank localized field or non-asset image path.

- [ ] **Step 3: Replace weak image choices with article-specific assets**

```ts
// Use a distinct, on-brand image for each guide, certificate, case study, news item, and event.
// Prefer images that visually match the topic:
// - cleanroom / lab for technical guides and standards
// - warehouse / team / production line for case studies and news
// - event or hall imagery for events
// Avoid reusing the same image across multiple cards when a better match exists.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend; node --import tsx --test src/components/resources/mock-data.test.ts`
Expected: pass once every card has complete localized content and a concrete image asset.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/resources/mock-data.ts frontend/src/components/resources/mock-data.test.ts
git commit -m "feat(resources): improve mock image coverage"
```

### Task 3: Smoke-test the resources page behavior

**Files:**
- Reference: `frontend/src/app/[locale]/(main)/resources/page.tsx`
- Reference: `frontend/src/components/resources/resources-client.tsx`
- Reference: `frontend/src/components/resources/mock-data.ts`

**Interfaces:**
- Consumes: the updated mock arrays and existing Directus merge logic
- Produces: the same page behavior with cleaner cards, consistent counts, and no broken grid sections

- [ ] **Step 1: Confirm the page still renders with merged Directus data plus mocks**

```bash
cd frontend
npm run typecheck
```

- [ ] **Step 2: Confirm the resources page still behaves as expected**

```bash
cd frontend
npm run test
```

Expected: existing test suite stays green, including content revalidation behavior for `/vi/resources`, `/en/resources`, and `/ja/resources`.

- [ ] **Step 3: Manual browser check**

```text
Open http://localhost:3000/vi/resources
Verify:
- main grid shows the intended 3-per-category mock balance
- popular articles section shows 3 cards
- upcoming events section still shows 3 cards
- every card image looks specific to the article rather than generic
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/resources/mock-data.ts frontend/src/components/resources/mock-data.test.ts
git commit -m "feat(resources): finalize mock data cleanup"
```

## Self-Review Notes

- Coverage: the plan addresses the main grid, sidebar popular items, event cards, and validation.
- No placeholders remain: each task has concrete files, test commands, and acceptance criteria.
- Scope is intentionally narrow: no page architecture changes, no new API fetches, and no Directus schema work.
