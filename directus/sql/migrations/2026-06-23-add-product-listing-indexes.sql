-- Product Listing and Search indexes (Task 1-3)
-- Optimize queries for filtering by status, category, industry, brand, standard and joining SKUs/documents

-- products: filter by status (published/draft/archived)
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);

-- products: filter by category (M2O FK)
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- products: search/filter by brand name
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);

-- product_skus: filter by status
CREATE INDEX IF NOT EXISTS idx_product_skus_status ON product_skus (status);

-- product_skus: filter by stock_status (inventory badge)
CREATE INDEX IF NOT EXISTS idx_product_skus_stock_status ON product_skus (stock_status);

-- product_skus: join from SKU back to product (FK lookup)
CREATE INDEX IF NOT EXISTS idx_product_skus_product ON product_skus (product);

-- documents: join from document to product (FK lookup)
CREATE INDEX IF NOT EXISTS idx_documents_product ON documents (product);

-- products_industries junction: both FK columns for M2M filter
CREATE INDEX IF NOT EXISTS idx_products_industries_products_id ON products_industries (products_id);
CREATE INDEX IF NOT EXISTS idx_products_industries_industries_id ON products_industries (industries_id);

-- products_standards junction: both FK columns for M2M filter
CREATE INDEX IF NOT EXISTS idx_products_standards_products_id ON products_standards (products_id);
CREATE INDEX IF NOT EXISTS idx_products_standards_standards_id ON products_standards (standards_id);

-- products_files junction: FK for gallery image loading
CREATE INDEX IF NOT EXISTS idx_products_files_products_id ON products_files (products_id)
