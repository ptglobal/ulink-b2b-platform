CREATE UNIQUE INDEX IF NOT EXISTS idx_product_skus_sku_code_normalized_unique
  ON product_skus (lower(btrim(sku_code)));
