CREATE INDEX IF NOT EXISTS idx_customers_user ON customers ("user");
CREATE INDEX IF NOT EXISTS idx_customers_sales_owner ON customers (sales_owner);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer);
CREATE INDEX IF NOT EXISTS idx_orders_hub ON orders (hub);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders (order_date);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items ("order");
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items (sku);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices (customer);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices ("order");
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);

CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries ("order");
CREATE INDEX IF NOT EXISTS idx_deliveries_hub ON deliveries (hub);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries (status);
CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_date ON deliveries (scheduled_date);

CREATE INDEX IF NOT EXISTS idx_rfq_requests_hub ON rfq_requests (hub);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_assigned_sales ON rfq_requests (assigned_sales);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_user ON rfq_requests ("user");
CREATE INDEX IF NOT EXISTS idx_rfq_requests_status ON rfq_requests (status);
