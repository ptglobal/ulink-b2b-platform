-- Up
ALTER TABLE "regional_hubs" ADD COLUMN "avg_delivery_distance" DOUBLE PRECISION;
ALTER TABLE "regional_hubs" ADD COLUMN "sla_details" JSONB;

ALTER TABLE "hub_industrial_zones" ADD COLUMN "corridor" VARCHAR(255);

-- Down
ALTER TABLE "hub_industrial_zones" DROP COLUMN "corridor";
ALTER TABLE "regional_hubs" DROP COLUMN "sla_details";
ALTER TABLE "regional_hubs" DROP COLUMN "avg_delivery_distance";
