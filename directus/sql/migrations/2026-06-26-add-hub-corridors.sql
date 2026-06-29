-- Add hub corridor columns (idempotent)
ALTER TABLE "regional_hubs" ADD COLUMN IF NOT EXISTS "avg_delivery_distance" DOUBLE PRECISION;
ALTER TABLE "regional_hubs" ADD COLUMN IF NOT EXISTS "sla_details" JSONB;

ALTER TABLE "hub_industrial_zones" ADD COLUMN IF NOT EXISTS "corridor" VARCHAR(255);
