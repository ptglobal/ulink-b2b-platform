import { TRANSLATION_RELATION_DEFS } from '../lib/i18n.mjs';

export const RELATION_DEFS = [
  { collection: 'product_categories', field: 'parent', related_collection: 'product_categories' },
  { collection: 'products', field: 'category', related_collection: 'product_categories' },
  { collection: 'product_skus', field: 'product', related_collection: 'products', meta: { one_field: 'skus' } },
  { collection: 'documents', field: 'product', related_collection: 'products' },
  { collection: 'documents', field: 'file', related_collection: 'directus_files' },
  { collection: 'case_studies', field: 'industry', related_collection: 'industries' },
  { collection: 'customers', field: 'user', related_collection: 'directus_users' },
  { collection: 'customers', field: 'sales_owner', related_collection: 'directus_users' },
  { collection: 'orders', field: 'customer', related_collection: 'customers', meta: { one_field: 'orders' } },
  { collection: 'orders', field: 'hub', related_collection: 'regional_hubs' },
  { collection: 'order_items', field: 'order', related_collection: 'orders', meta: { one_field: 'items' } },
  { collection: 'order_items', field: 'sku', related_collection: 'product_skus' },
  { collection: 'invoices', field: 'customer', related_collection: 'customers', meta: { one_field: 'invoices' } },
  { collection: 'invoices', field: 'order', related_collection: 'orders' },
  { collection: 'deliveries', field: 'order', related_collection: 'orders', meta: { one_field: 'deliveries' } },
  { collection: 'deliveries', field: 'hub', related_collection: 'regional_hubs' },
  { collection: 'rfq_requests', field: 'hub', related_collection: 'regional_hubs' },
  { collection: 'rfq_requests', field: 'assigned_sales', related_collection: 'directus_users' },
  { collection: 'rfq_requests', field: 'user', related_collection: 'directus_users' },
  { collection: 'products_industries', field: 'products_id', related_collection: 'products', meta: { one_field: 'industries' } },
  { collection: 'products_industries', field: 'industries_id', related_collection: 'industries' },
  { collection: 'products_files', field: 'products_id', related_collection: 'products', meta: { one_field: 'gallery' } },
  { collection: 'products_files', field: 'directus_files_id', related_collection: 'directus_files' },
  ...TRANSLATION_RELATION_DEFS
];
