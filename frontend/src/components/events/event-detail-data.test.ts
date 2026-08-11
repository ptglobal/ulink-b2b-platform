import test from 'node:test';
import assert from 'node:assert/strict';

import { getEventDetailBySlug, getEventRegisterLink } from './event-detail-data';

const slugs = ['ev-001', 'ev-002', 'ev-003'];

test('event detail data includes agenda, speakers, benefits, and organizer info', () => {
  for (const slug of slugs) {
    const event = getEventDetailBySlug(slug);
    assert.ok(event, `${slug} should exist`);
    assert.ok(event!.summary.length > 0, `${slug} summary`);
    assert.ok(event!.overview.length > 0, `${slug} overview`);
    assert.ok(event!.agenda.length > 0, `${slug} agenda`);
    assert.ok(event!.speakers.length > 0, `${slug} speakers`);
    assert.ok(event!.benefits.length > 0, `${slug} benefits`);
    assert.ok(event!.organizer.name.length > 0, `${slug} organizer`);
    assert.equal(getEventRegisterLink(slug).endsWith('/register'), true, `${slug} register link`);
  }
});
