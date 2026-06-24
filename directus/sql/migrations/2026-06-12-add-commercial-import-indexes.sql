CREATE UNIQUE INDEX IF NOT EXISTS customers_erp_ref_key
  ON customers (lower(btrim(erp_ref)))
  WHERE erp_ref IS NOT NULL AND btrim(erp_ref) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS customers_tax_code_key
  ON customers (lower(btrim(tax_code)))
  WHERE tax_code IS NOT NULL AND btrim(tax_code) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS customers_email_key
  ON customers (lower(btrim(email)))
  WHERE email IS NOT NULL AND btrim(email) <> '';
