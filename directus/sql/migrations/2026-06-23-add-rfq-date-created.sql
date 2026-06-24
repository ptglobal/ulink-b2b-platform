-- Add created_at column to rfq_requests table
ALTER TABLE rfq_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Register created_at field in directus_fields metadata
INSERT INTO directus_fields (collection, field, special, interface, readonly, hidden, width, searchable)
SELECT 'rfq_requests', 'created_at', NULL, 'datetime', true, false, 'full', true
WHERE NOT EXISTS (
    SELECT 1 FROM directus_fields WHERE collection = 'rfq_requests' AND field = 'created_at'
);
