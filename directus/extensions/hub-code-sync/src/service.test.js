import test from 'node:test';
import assert from 'node:assert/strict';
import { formatHubCode, normalizeHubProvinceAbbr, HUB_OPERATING_STATUSES } from '../../../lib/hub-domain.mjs';

test('normalizeHubProvinceAbbr strips spaces and uppercases', () => {
  assert.equal(normalizeHubProvinceAbbr(' hna '), 'HNA');
  assert.equal(normalizeHubProvinceAbbr('Hà Nam'), 'HNAM');
});

test('formatHubCode builds HUB-[province]-[count]', () => {
  assert.equal(formatHubCode('HNA', 4), 'HUB-HNA-004');
});

test('hub operating status list matches acceptance options', () => {
  assert.equal(HUB_OPERATING_STATUSES.length, 5);
  assert.deepEqual(
    HUB_OPERATING_STATUSES.map((item) => item.value),
    ['active', 'stopped', 'maintenance', 'full', 'temporarily_closed']
  );
});
