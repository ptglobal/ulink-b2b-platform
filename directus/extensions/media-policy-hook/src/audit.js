import { buildAuditRecord } from '../../../lib/media-policy.mjs';

export function buildMediaAuditRecord(input) {
  return buildAuditRecord(input);
}

export async function writeMediaAuditEvent(services, schema, record) {
  const { ItemsService } = services;
  const auditService = new ItemsService('media_audit_events', {
    schema,
    accountability: null
  });

  return auditService.createOne(record);
}
