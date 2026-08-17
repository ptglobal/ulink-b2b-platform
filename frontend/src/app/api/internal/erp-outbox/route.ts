import { readItems, updateItem } from '@directus/sdk';

import { errorJson, successJson } from '../../../../lib/api-response-next';
import { requireInternalToken } from '../../../../lib/internal-auth';
import { createWriteDirectusClient } from '../../../../lib/directus';
import { drainErpOutbox, type ErpOutboxRow } from '../../../../lib/erp-outbox-worker';

function readDirectusItems(...args: any[]) {
  return readItems(...(args as [never, never]));
}

function updateDirectusItem(...args: any[]) {
  return updateItem(...(args as [never, never, never]));
}

function mapRow(value: unknown): ErpOutboxRow {
  if (!value || typeof value !== 'object') {
    throw new Error('integration_events row is invalid.');
  }

  const row = value as Record<string, unknown>;
  if (
    (typeof row.id !== 'number' && typeof row.id !== 'string') ||
    typeof row.entity !== 'string' ||
    typeof row.op !== 'string'
  ) {
    throw new Error('integration_events row is invalid.');
  }

  if (typeof row.payload !== 'object' || row.payload === null || Array.isArray(row.payload)) {
    throw new Error('integration_events payload is invalid.');
  }

  return {
    id: row.id,
    entity: row.entity as ErpOutboxRow['entity'],
    op: row.op as ErpOutboxRow['op'],
    record_id: typeof row.record_id === 'string' ? row.record_id : String(row.record_id ?? ''),
    erp_ref: typeof row.erp_ref === 'string' ? row.erp_ref : null,
    revision: typeof row.revision === 'string' ? row.revision : String(row.revision ?? row.id),
    idempotency_key: typeof row.idempotency_key === 'string' ? row.idempotency_key : undefined,
    payload: row.payload as Record<string, unknown>,
    status:
      row.status === 'pending' || row.status === 'sent' || row.status === 'failed'
        ? row.status
        : 'pending',
    attempts: typeof row.attempts === 'number' ? row.attempts : 0,
    next_attempt_at: typeof row.next_attempt_at === 'string' ? row.next_attempt_at : null,
    last_attempt_at: typeof row.last_attempt_at === 'string' ? row.last_attempt_at : null,
    last_status_code: typeof row.last_status_code === 'number' ? row.last_status_code : null,
    last_error: typeof row.last_error === 'string' ? row.last_error : null,
    destination_url: typeof row.destination_url === 'string' ? row.destination_url : null
  };
}

export async function POST(req: Request) {
  try {
    requireInternalToken(req.headers.get('authorization'));
  } catch (err) {
    if (err instanceof Error && err.message.includes('required')) {
      return errorJson(500, 'INTERNAL_SERVER_ERROR', 'ERP outbox endpoint is not configured.');
    }

    return errorJson(403, 'FORBIDDEN', 'Invalid internal API token.');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const batchSize =
    body &&
    typeof body === 'object' &&
    typeof (body as Record<string, unknown>).batch_size === 'number'
      ? Math.max(1, Math.floor((body as Record<string, unknown>).batch_size as number))
      : Number(process.env.ERP_OUTBOX_BATCH_SIZE ?? '20');

  const directus = createWriteDirectusClient();

  try {
    const result = await drainErpOutbox({
      syncEnabled: process.env.ERP_SYNC_ENABLED === 'true',
      batchSize,
      fetchPendingEvents: async () => {
        const rows = await directus.request(
          readDirectusItems('integration_events', {
            filter: {
              status: { _eq: 'pending' }
            },
            sort: ['id'],
            limit: batchSize,
            fields: [
              'id',
              'entity',
              'op',
              'record_id',
              'erp_ref',
              'revision',
              'idempotency_key',
              'payload',
              'status',
              'attempts',
              'next_attempt_at',
              'last_attempt_at',
              'last_status_code',
              'last_error',
              'destination_url'
            ]
          })
        );

        return Array.isArray(rows) ? rows.map(mapRow) : [];
      },
      updateEvent: async (id, patch) => {
        await directus.request(updateDirectusItem('integration_events', id, patch));
      }
    });

    return successJson(result);
  } catch (err) {
    console.error('ERP outbox drain failed', err);
    return errorJson(502, 'BAD_GATEWAY', 'Failed to drain ERP outbox.');
  }
}
