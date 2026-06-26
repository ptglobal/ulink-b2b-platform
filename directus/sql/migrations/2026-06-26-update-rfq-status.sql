-- Update existing RFQ requests with 'new' status to 'pending'
UPDATE rfq_requests SET status = 'pending' WHERE status = 'new';
