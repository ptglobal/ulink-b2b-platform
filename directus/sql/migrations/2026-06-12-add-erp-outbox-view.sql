CREATE INDEX IF NOT EXISTS integration_events_status_next_attempt_idx
  ON integration_events (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS integration_events_entity_record_idx
  ON integration_events (entity, record_id);

DROP VIEW IF EXISTS failed_erp_webhooks;

CREATE VIEW failed_erp_webhooks AS
SELECT *
FROM integration_events
WHERE status = 'failed';
