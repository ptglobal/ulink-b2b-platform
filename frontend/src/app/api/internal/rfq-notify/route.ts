import { readItem, readItems, readSingleton, updateItem } from '@directus/sdk';

import { errorJson, successJson } from '../../../../lib/api-response-next';
import { requireInternalToken } from '../../../../lib/internal-auth';
import {
  buildDirectusNotificationPayload,
  buildRfqSummaryEmail,
  resolveRfqAssignment,
  type RfqAssignmentRule,
  type RfqHubRef,
  type RfqIndustryRef,
  type RfqRecord,
  type RfqSalesOwnerRef,
  type SiteSettingsRecord
} from '../../../../lib/rfq-notification';
import { sendRfqSummaryEmail } from '../../../../lib/rfq-mailer';
import { createWriteDirectusClient } from '../../../../lib/directus';
import { requireDirectusToken } from '../../../../lib/directus-runtime.mjs';

function readDirectusItem(...args: any[]) {
  return readItem(...(args as [never, never, never]));
}

function readDirectusItems(...args: any[]) {
  return readItems(...(args as [never, never]));
}

function readDirectusSingleton(...args: any[]) {
  return readSingleton(...(args as [never, never]));
}

function updateDirectusItem(...args: any[]) {
  return updateItem(...(args as [never, never, never]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseRfqId(body: Record<string, unknown>): number | string {
  const raw = body.key ?? body.id ?? body.item ?? body.rfq_id;
  if (typeof raw === 'number' || typeof raw === 'string') {
    return raw;
  }

  throw new Error('RFQ id is required.');
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mapSalesOwner(value: unknown): RfqSalesOwnerRef | null {
  if (!isObjectRecord(value) || typeof value.id !== 'string' || typeof value.email !== 'string') {
    return null;
  }

  return {
    id: value.id,
    email: value.email,
    first_name: typeof value.first_name === 'string' ? value.first_name : null,
    last_name: typeof value.last_name === 'string' ? value.last_name : null
  };
}

function mapHub(value: unknown): RfqHubRef | null {
  if (
    !isObjectRecord(value) ||
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    typeof value.slug !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    slug: value.slug
  };
}

function mapIndustry(value: unknown): RfqIndustryRef | null {
  if (
    !isObjectRecord(value) ||
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    typeof value.slug !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    slug: value.slug
  };
}

function mapRfqRecord(value: unknown): RfqRecord {
  if (!isObjectRecord(value) || (typeof value.id !== 'number' && typeof value.id !== 'string')) {
    throw new Error('RFQ record not found.');
  }

  const lineItems = Array.isArray(value.line_items)
    ? value.line_items
        .filter(isObjectRecord)
        .map((item) => ({
          sku: typeof item.sku === 'string' ? item.sku : '',
          note: typeof item.note === 'string' ? item.note : undefined
        }))
        .filter((item) => item.sku)
    : [];

  return {
    id: value.id,
    company: typeof value.company === 'string' ? value.company : '',
    contact_name: typeof value.contact_name === 'string' ? value.contact_name : '',
    email: typeof value.email === 'string' ? value.email : '',
    phone: typeof value.phone === 'string' ? value.phone : null,
    hub: mapHub(value.hub),
    industry: typeof value.industry === 'string' ? value.industry : mapIndustry(value.industry),
    message: typeof value.message === 'string' ? value.message : null,
    line_items: lineItems,
    source: value.source === 'portal' ? 'portal' : 'web',
    assigned_sales: mapSalesOwner(value.assigned_sales)
  };
}

function mapRule(value: unknown): RfqAssignmentRule | null {
  if (!isObjectRecord(value) || typeof value.id !== 'number') {
    return null;
  }

  return {
    id: value.id,
    hub: mapHub(value.hub),
    industry: mapIndustry(value.industry),
    assigned_sales: mapSalesOwner(value.assigned_sales),
    priority: typeof value.priority === 'number' ? value.priority : null,
    is_default: value.is_default === true
  };
}

async function createDirectusNotification(payload: Record<string, unknown>) {
  const baseUrl =
    process.env.DIRECTUS_URL ?? process.env.DIRECTUS_PUBLIC_URL ?? 'http://localhost:8055';
  const token = requireDirectusToken();

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/notifications`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create Directus notification: ${response.status} ${text}`);
  }

  return response.json();
}

export async function POST(req: Request) {
  try {
    requireInternalToken(req.headers.get('authorization'));
  } catch (err) {
    if (err instanceof Error && err.message.includes('required')) {
      return errorJson(500, 'INTERNAL_SERVER_ERROR', 'RFQ notification webhook is not configured.');
    }

    return errorJson(403, 'FORBIDDEN', 'Invalid internal API token.');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorJson(400, 'BAD_REQUEST', 'Request body must be valid JSON.');
  }

  if (!isRecord(body) || body.collection !== 'rfq_requests') {
    return errorJson(400, 'BAD_REQUEST', 'RFQ notification payload is invalid.');
  }

  let rfqId: number | string;
  try {
    rfqId = parseRfqId(body);
  } catch (err) {
    return errorJson(
      400,
      'BAD_REQUEST',
      err instanceof Error ? err.message : 'RFQ id is required.'
    );
  }

  const directus = createWriteDirectusClient();

  try {
    const [rfqRow, siteSettingsRow, rulesRow] = await Promise.all([
      directus.request(
        readDirectusItem('rfq_requests', rfqId, {
          fields: [
            'id',
            'company',
            'contact_name',
            'email',
            'phone',
            'industry',
            'message',
            'line_items',
            'source',
            'hub.id',
            'hub.name',
            'hub.slug',
            'assigned_sales.id',
            'assigned_sales.email',
            'assigned_sales.first_name',
            'assigned_sales.last_name'
          ]
        })
      ),
      directus.request(readDirectusSingleton('site_settings', { fields: ['contact_email'] })),
      directus.request(
        readDirectusItems('rfq_assignment_rules', {
          fields: [
            'id',
            'priority',
            'is_default',
            'hub.id',
            'hub.name',
            'hub.slug',
            'industry.id',
            'industry.name',
            'industry.slug',
            'assigned_sales.id',
            'assigned_sales.email',
            'assigned_sales.first_name',
            'assigned_sales.last_name'
          ],
          limit: -1
        })
      )
    ]);

    const rfq = mapRfqRecord(rfqRow);
    const siteSettings = siteSettingsRow as SiteSettingsRecord;
    const rules = Array.isArray(rulesRow)
      ? (rulesRow.map(mapRule).filter(Boolean) as RfqAssignmentRule[])
      : [];
    const assignment = resolveRfqAssignment({
      rfq,
      rules,
      siteSettings
    });
    const industryRows =
      typeof rfq.industry === 'string'
        ? await directus.request(
            readDirectusItems('industries', {
              fields: ['id', 'name', 'slug'],
              filter: {
                slug: {
                  _eq: rfq.industry
                }
              },
              limit: 1
            })
          )
        : [];
    const industry =
      Array.isArray(industryRows) && industryRows.length > 0
        ? mapIndustry(industryRows[0])
        : mapIndustry(rfq.industry);
    const assignedSales =
      rfq.assigned_sales ??
      (assignment.assignedSalesId
        ? {
            id: assignment.assignedSalesId,
            email: assignment.assignedSalesEmail ?? assignment.notifyTo,
            first_name: null,
            last_name: null
          }
        : null);

    const summary = buildRfqSummaryEmail({
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      rfqId: rfq.id,
      company: rfq.company,
      contactName: rfq.contact_name,
      email: rfq.email,
      phone: rfq.phone,
      hubName: rfq.hub?.name ?? null,
      industryName:
        industry?.name ??
        (typeof rfq.industry === 'string' ? rfq.industry : (rfq.industry?.name ?? null)),
      message: rfq.message,
      lineItems: rfq.line_items,
      assignedSales
    });

    let mailStatus: 'sent' | 'failed' = 'sent';
    try {
      await sendRfqSummaryEmail({
        to: assignment.notifyTo,
        subject: summary.subject,
        text: summary.text
      });
    } catch (err) {
      mailStatus = 'failed';
      console.error('RFQ notification email failed', err);
    }

    let notificationStatus: 'sent' | 'skipped' | 'failed' = 'skipped';
    if (assignment.assignedSalesId) {
      try {
        if (!rfq.assigned_sales || rfq.assigned_sales.id !== assignment.assignedSalesId) {
          await directus.request(
            updateDirectusItem('rfq_requests', rfq.id, {
              assigned_sales: assignment.assignedSalesId
            })
          );
        }

        await createDirectusNotification(
          buildDirectusNotificationPayload({
            recipient: assignment.assignedSalesId,
            rfqId: rfq.id,
            subject: summary.subject,
            message: summary.text,
            collection: 'rfq_requests',
            item: String(rfq.id),
            link: `${(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/admin/content/rfq_requests/${rfq.id}`
          })
        );
        notificationStatus = 'sent';
      } catch (err) {
        notificationStatus = 'failed';
        console.error('RFQ Directus notification failed', err);
      }
    }

    return successJson({
      rfq_id: rfq.id,
      assigned_sales: assignment.assignedSalesId,
      notified_to: assignment.notifyTo,
      mail_status: mailStatus,
      notification_status: notificationStatus
    });
  } catch (err) {
    console.error('RFQ notification failed', err);
    return errorJson(502, 'BAD_GATEWAY', 'Failed to process RFQ notification.');
  }
}
