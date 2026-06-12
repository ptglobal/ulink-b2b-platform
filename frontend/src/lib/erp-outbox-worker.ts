import { buildErpIdempotencyKey, classifyErpResponse, nextErpRetryDelayMinutes, type ErpEntity, type ErpOperation } from './erp-outbound';

export type ErpOutboxStatus = 'pending' | 'sent' | 'failed';

export type ErpOutboxRow = {
  id: number | string;
  entity: ErpEntity;
  op: ErpOperation;
  record_id: string;
  erp_ref?: string | null;
  revision: string;
  idempotency_key?: string;
  payload: Record<string, unknown>;
  status?: ErpOutboxStatus;
  attempts?: number;
  next_attempt_at?: string | null;
  last_attempt_at?: string | null;
  last_status_code?: number | null;
  last_error?: string | null;
  destination_url?: string | null;
};

export type ErpDrainSummary = {
  skipped: boolean;
  sent: number;
  retried: number;
  failed: number;
};

export type ErpDrainDeps = {
  syncEnabled: boolean;
  batchSize: number;
  fetchPendingEvents: () => Promise<ErpOutboxRow[]>;
  sendToErp?: (row: ErpOutboxRow) => Promise<{ status: number; body?: string }>;
  updateEvent?: (id: ErpOutboxRow['id'], patch: Partial<ErpOutboxRow>) => Promise<void>;
  now?: () => Date;
  maxAttempts?: number;
};

function buildEnvelope(row: ErpOutboxRow) {
  return {
    entity: row.entity,
    op: row.op,
    record_id: row.record_id,
    erp_ref: row.erp_ref ?? null,
    revision: row.revision,
    idempotency_key: row.idempotency_key ?? buildErpIdempotencyKey({
      entity: row.entity,
      recordId: row.record_id,
      erpRef: row.erp_ref ?? null,
      revision: row.revision
    }),
    payload: row.payload
  };
}

function buildRetryTimestamp(now: Date, attempt: number) {
  const delayMinutes = nextErpRetryDelayMinutes(attempt);
  return new Date(now.getTime() + delayMinutes * 60_000).toISOString();
}

export function classifyDrainResult(status: number) {
  return classifyErpResponse(status);
}

export async function drainErpOutbox(input: ErpDrainDeps): Promise<ErpDrainSummary> {
  if (!input.syncEnabled) {
    return { skipped: true, sent: 0, retried: 0, failed: 0 };
  }

  const rows = (await input.fetchPendingEvents()).slice(0, Math.max(0, input.batchSize));
  const sendToErp =
    input.sendToErp ??
    (async (row: ErpOutboxRow) => {
      const targetUrl = row.destination_url ?? process.env.ERP_WEBHOOK_URL;
      if (!targetUrl) {
        throw new Error('ERP_WEBHOOK_URL is required when ERP sync is enabled.');
      }

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.ERP_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ERP_WEBHOOK_TOKEN}` } : {}),
          'Idempotency-Key': row.idempotency_key ?? buildErpIdempotencyKey({
            entity: row.entity,
            recordId: row.record_id,
            erpRef: row.erp_ref ?? null,
            revision: row.revision
          })
        },
        body: JSON.stringify(buildEnvelope(row)),
        signal: AbortSignal.timeout(15_000)
      });

      return {
        status: response.status,
        body: await response.text()
      };
    });

  const updateEvent =
    input.updateEvent ??
    (async () => {
      return;
    });

  const now = input.now ?? (() => new Date());
  const maxAttempts = input.maxAttempts ?? 3;
  const summary: ErpDrainSummary = { skipped: false, sent: 0, retried: 0, failed: 0 };

  for (const row of rows) {
    const attempt = (row.attempts ?? 0) + 1;
    const timestamp = now().toISOString();

    try {
      const result = await sendToErp(row);
      const outcome = classifyDrainResult(result.status);

      if (outcome === 'sent') {
        await updateEvent(row.id, {
          status: 'sent',
          attempts: attempt,
          last_attempt_at: timestamp,
          last_status_code: result.status,
          last_error: null,
          next_attempt_at: null
        });
        summary.sent += 1;
        continue;
      }

      const failedPatch: Partial<ErpOutboxRow> = {
        attempts: attempt,
        last_attempt_at: timestamp,
        last_status_code: result.status,
        last_error: result.body ?? `ERP returned HTTP ${result.status}`
      };

      if (outcome === 'failed') {
        await updateEvent(row.id, {
          ...failedPatch,
          status: 'failed',
          next_attempt_at: null
        });
        summary.failed += 1;
        continue;
      }

      if (attempt >= maxAttempts) {
        await updateEvent(row.id, {
          ...failedPatch,
          status: 'failed',
          next_attempt_at: null
        });
        summary.failed += 1;
        continue;
      }

      await updateEvent(row.id, {
        ...failedPatch,
        status: 'pending',
        next_attempt_at: buildRetryTimestamp(now(), attempt)
      });
      summary.retried += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deliver ERP event.';
      if (attempt >= maxAttempts) {
        await updateEvent(row.id, {
          status: 'failed',
          attempts: attempt,
          last_attempt_at: timestamp,
          last_error: message,
          next_attempt_at: null
        });
        summary.failed += 1;
        continue;
      }

      await updateEvent(row.id, {
        status: 'pending',
        attempts: attempt,
        last_attempt_at: timestamp,
        last_error: message,
        next_attempt_at: buildRetryTimestamp(now(), attempt)
      });
      summary.retried += 1;
    }
  }

  return summary;
}
