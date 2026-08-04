-- Product attributes: ordering & uniqueness lookups
CREATE INDEX IF NOT EXISTS idx_product_attributes_sort ON product_attributes (sort);
CREATE INDEX IF NOT EXISTS idx_product_attributes_slug ON product_attributes (slug);

-- Junction M2M products_product_attributes indexes for fast filter joins
CREATE INDEX IF NOT EXISTS idx_products_product_attributes_prod ON products_product_attributes (products_id);
CREATE INDEX IF NOT EXISTS idx_products_product_attributes_attr ON products_product_attributes (product_attributes_id);

-- Attribute options: lookup by attribute + ordering
CREATE INDEX IF NOT EXISTS idx_product_attribute_options_attribute ON product_attribute_options (attribute);
CREATE INDEX IF NOT EXISTS idx_product_attribute_options_sort ON product_attribute_options (attribute, sort);

-- SKU lookup by product + status (used by autogen hook)
CREATE INDEX IF NOT EXISTS idx_product_skus_product_status ON product_skus (product, status);
