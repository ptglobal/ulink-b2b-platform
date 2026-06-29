-- Product attributes: lookup by product + ordering
CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON product_attributes (product);
CREATE INDEX IF NOT EXISTS idx_product_attributes_sort ON product_attributes (product, sort);

-- Attribute options: lookup by attribute + ordering
CREATE INDEX IF NOT EXISTS idx_product_attribute_options_attribute ON product_attribute_options (attribute);
CREATE INDEX IF NOT EXISTS idx_product_attribute_options_sort ON product_attribute_options (attribute, sort);

-- SKU lookup by product + status (used by autogen hook)
CREATE INDEX IF NOT EXISTS idx_product_skus_product_status ON product_skus (product, status);
