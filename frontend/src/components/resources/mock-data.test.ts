import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { MOCK_RESOURCES, MOST_VIEWED_ARTICLES, UPCOMING_EVENTS } from './mock-data';
import type { ResourceItem } from './types';

function allResourceItems(): ResourceItem[] {
  return [...MOCK_RESOURCES, ...MOST_VIEWED_ARTICLES];
}

function assetPathExists(imagePath: string) {
  const normalized = imagePath.replace(/^\/+/, '');
  const absolutePath = path.join(process.cwd(), 'public', normalized);
  return fs.existsSync(absolutePath);
}

test('resources mock data keeps 3 items per visible group', () => {
  const counts = MOCK_RESOURCES.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  assert.equal(MOCK_RESOURCES.length, 15);
  assert.equal(counts.guide, 3);
  assert.equal(counts.standard, 3);
  assert.equal(counts['case-study'], 3);
  assert.equal(counts.news, 3);
  assert.equal(counts.event, 3);
  assert.equal(MOST_VIEWED_ARTICLES.length, 3);
  assert.equal(UPCOMING_EVENTS.length, 3);
});

test('resource cards have localized copy and valid image assets', () => {
  for (const item of allResourceItems()) {
    assert.ok(item.title.vi.trim().length > 0, `${item.id} vi title`);
    assert.ok(item.title.en.trim().length > 0, `${item.id} en title`);
    assert.ok(item.title.ja.trim().length > 0, `${item.id} ja title`);
    assert.ok(item.description.vi.trim().length > 0, `${item.id} vi description`);
    assert.ok(item.description.en.trim().length > 0, `${item.id} en description`);
    assert.ok(item.description.ja.trim().length > 0, `${item.id} ja description`);
    if (item.image) {
      assert.ok(assetPathExists(item.image), `${item.id} missing image: ${item.image}`);
    }
  }
});

test('upcoming events keep localized fields and concrete assets', () => {
  for (const event of UPCOMING_EVENTS) {
    assert.ok(event.title.vi.trim().length > 0, `${event.id} vi title`);
    assert.ok(event.title.en.trim().length > 0, `${event.id} en title`);
    assert.ok(event.title.ja.trim().length > 0, `${event.id} ja title`);
    assert.ok(event.location.vi.trim().length > 0, `${event.id} vi location`);
    assert.ok(event.location.en.trim().length > 0, `${event.id} en location`);
    assert.ok(event.location.ja.trim().length > 0, `${event.id} ja location`);
    assert.ok(event.link.startsWith('/events/'), `${event.id} event link`);
    assert.ok(event.link.endsWith('/register'), `${event.id} event register route`);
    assert.ok(assetPathExists(event.image), `${event.id} missing image: ${event.image}`);
  }
});
