-- Add columns and tables required for Product Listing (Tasks 1-3)
-- Runs before the index migration (alphabetical sort)

-- products: add brand column for filtering
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(255) DEFAULT NULL;

-- product_skus: add stock_status for inventory badge
ALTER TABLE product_skus ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) DEFAULT 'in_stock';

-- standards collection (if not created by ensureCollection)
CREATE TABLE IF NOT EXISTS standards (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) DEFAULT 'draft',
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT DEFAULT NULL
);

-- products_standards junction table
CREATE TABLE IF NOT EXISTS products_standards (
  id SERIAL PRIMARY KEY,
  products_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  standards_id INTEGER REFERENCES standards(id) ON DELETE CASCADE
)
