import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { Pool } from 'pg';

import { drainErpOutbox } from '../../frontend/src/lib/erp-outbox-worker.ts';
import { POST as drainRoutePost } from '../../frontend/src/app/api/internal/erp-outbox/route.ts';
import { POST as mockErpPost } from '../../frontend/src/app/api/mock/erp/route.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../frontend/.env.local') });

const internalToken = process.env.INTERNAL_API_TOKEN;
const mockErpBase = process.env.MOCK_ERP_BASE_URL ?? 'http://mock-erp.local';

if (!internalToken) {
  throw new Error('INTERNAL_API_TOKEN is required for the ERP smoke test.');
}

const pool = new Pool({
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? '5432'),
  database: process.env.POSTGRES_DB ?? 'ulink',
  user: process.env.POSTGRES_USER ?? 'ulink',
  password: process.env.POSTGRES_PASSWORD ?? ''
});

function buildRequest(url, body = undefined, token = internalToken) {
  return new Request(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
}

async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function readEvent(id) {
  const rows = await query(
    `select id, status, attempts, last_status_code, last_error, next_attempt_at
     from integration_events
     where id = $1
     limit 1`,
    [id]
  );

  return rows[0] ?? null;
}

async function createEvent(destinationUrl, suffix) {
  const rows = await query(
    `insert into integration_events
      (entity, op, record_id, erp_ref, revision, idempotency_key, payload, status, attempts, destination_url)
     values
      ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
     returning id`,
    [
      'orders',
      'update',
      `SMOKE-${suffix}`,
      null,
      `2026-06-12T${suffix}Z`,
      `SMOKE-${suffix}`,
      JSON.stringify({
        id: `SMOKE-${suffix}`,
        status: 'confirmed',
        total: 100,
        notes: 'smoke'
      }),
      'pending',
      0,
      destinationUrl
    ]
  );

  return rows[0];
}

async function deleteEvents(ids) {
  if (ids.length === 0) {
    return;
  }

  await query('delete from integration_events where id = any($1::bigint[])', [ids]);
}

async function fetchPendingEvents(batchSize) {
  const rows = await query(
    `select id, entity, op, record_id, erp_ref, revision, idempotency_key, payload,
            status, attempts, next_attempt_at, last_attempt_at, last_status_code, last_error, destination_url
     from integration_events
     where status = 'pending'
     order by id
     limit $1`,
    [batchSize]
  );

  return rows;
}

async function updateEvent(id, patch) {
  const entries = Object.entries(patch);
  if (entries.length === 0) {
    return;
  }

  const assignments = entries.map(([key], index) => `${key} = $${index + 1}`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(id);

  await query(`update integration_events set ${assignments} where id = $${values.length}`, values);
}

async function runDrain(batchSize) {
  return drainErpOutbox({
    syncEnabled: true,
    batchSize,
    fetchPendingEvents: () => fetchPendingEvents(batchSize),
    updateEvent
  });
}

async function main() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const requestUrl = typeof input === 'string' ? input : input.url;
    if (new URL(requestUrl).hostname !== 'mock-erp.local') {
      return originalFetch(input, init);
    }

    const request = new Request(requestUrl, init);
    return mockErpPost(request);
  };

  process.env.ERP_SYNC_ENABLED = 'true';
  process.env.ERP_WEBHOOK_URL = mockErpBase;
  process.env.ERP_OUTBOX_BATCH_SIZE = '2';
  process.env.ERP_OUTBOX_MAX_ATTEMPTS = '3';

  const cleanupIds = [];

  try {
    const authFailure = await drainRoutePost(buildRequest('http://localhost/api/internal/erp-outbox', { batch_size: 2 }, 'wrong-token'));
    assert.equal(authFailure.status, 403, await authFailure.text());

    const successRow = await createEvent(mockErpBase, '01');
    cleanupIds.push(successRow.id);
    await runDrain(2);
    const successState = await readEvent(successRow.id);
    assert.ok(successState, 'Expected success row to exist after drain.');
    assert.equal(successState.status, 'sent', JSON.stringify(successState));

    const failureRow = await createEvent(`${mockErpBase}?status=409`, '02');
    cleanupIds.push(failureRow.id);
    await runDrain(2);
    const failureState = await readEvent(failureRow.id);
    assert.ok(failureState, 'Expected failure row to exist after drain.');
    assert.equal(failureState.status, 'failed', JSON.stringify(failureState));

    console.log(
      JSON.stringify(
        {
          authFailureStatus: authFailure.status,
          successState,
          failureState
        },
        null,
        2
      )
    );
  } finally {
    globalThis.fetch = originalFetch;
    await deleteEvents(cleanupIds);
    await pool.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('ERP outbound smoke test failed:', error);
    process.exit(1);
  });
