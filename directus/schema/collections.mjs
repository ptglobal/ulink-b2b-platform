import { ID_FIELD, STATUS_FIELD } from '../lib/constants.mjs';
import { LANGUAGE_COLLECTION_DEF, TRANSLATION_COLLECTION_DEFS, createTranslationAliasField } from '../lib/i18n.mjs';

export const COLLECTION_DEFS = [
  {
    collection: 'partners',
    meta: { icon: 'handshake', note: 'Strategic Partners', sort_field: 'sort' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', width: 'full', required: true } },
      { field: 'logo', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'url', type: 'string', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'industries',
    meta: { icon: 'domain', note: 'Industries' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'icon', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } }
    ]
  },
  {
    collection: 'product_categories',
    meta: { icon: 'folder', note: 'Product Categories', sort_field: 'sort' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'parent', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'hero_image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  },
  {
    collection: 'products',
    meta: { icon: 'box', note: 'Products' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'short_description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'specifications', type: 'json', meta: { interface: 'json' } },
      { field: 'hero', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['m2m'] } },
      { field: 'industries', type: 'alias', meta: { interface: 'list-m2m', special: ['m2m'] } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  },
  {
    collection: 'product_skus',
    meta: { icon: 'qr_code', note: 'Product SKUs' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'sku_code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'product', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'unit', type: 'string', meta: { interface: 'input' } },
      { field: 'pack_size', type: 'string', meta: { interface: 'input' } },
      { field: 'attributes', type: 'json', meta: { interface: 'json' } }
    ]
  },
  {
    collection: 'documents',
    meta: { icon: 'description', note: 'Documents' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      {
        field: 'doc_type',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'TDS', value: 'tds' },
              { text: 'MSDS', value: 'msds' },
              { text: 'Certificate', value: 'certificate' },
              { text: 'Brochure', value: 'brochure' }
            ]
          }
        }
      },
      { field: 'product', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'file', type: 'uuid', meta: { interface: 'file', special: ['file'] } },
      { field: 'language', type: 'string', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'regional_hubs',
    meta: { icon: 'place', note: 'Regional Hubs' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'delivery_sla', type: 'text', meta: { interface: 'textarea' } },
      { field: 'warehouse_capacity', type: 'string', meta: { interface: 'input' } },
      { field: 'technical_team', type: 'text', meta: { interface: 'textarea' } },
      { field: 'cluster_overview', type: 'text', meta: { interface: 'textarea' } },
      { field: 'location', type: 'string', meta: { interface: 'input' } },
      { field: 'coordinates', type: 'string', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'blog_posts',
    meta: { icon: 'article', note: 'Blog Posts' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
      { field: 'cover', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'author', type: 'string', meta: { interface: 'input' } },
      { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  },
  {
    collection: 'case_studies',
    meta: { icon: 'quickreply', note: 'Case Studies' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'summary', type: 'text', meta: { interface: 'textarea' } },
      { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
      { field: 'industry', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'cover', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } }
    ]
  },
  {
    collection: 'iso_certifications',
    meta: { icon: 'verified', note: 'ISO Certifications' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'number', type: 'string', meta: { interface: 'input' } },
      { field: 'issuer', type: 'string', meta: { interface: 'input' } },
      { field: 'valid_until', type: 'date', meta: { interface: 'datetime' } },
      { field: 'file', type: 'uuid', meta: { interface: 'file', special: ['file'] } }
    ]
  },
  {
    collection: 'hero_banners',
    meta: { icon: 'view_carousel', note: 'Hero Banners', sort_field: 'sort' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } },
      { field: 'title', type: 'string', meta: { interface: 'input' } },
      { field: 'subtitle', type: 'text', meta: { interface: 'textarea' } },
      { field: 'image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'cta_label', type: 'string', meta: { interface: 'input' } },
      { field: 'cta_url', type: 'string', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'pages',
    meta: { icon: 'pages', note: 'Pages' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      createTranslationAliasField(),
      { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
    ]
  },
  {
    collection: 'site_settings',
    meta: { icon: 'settings', note: 'Site Settings', singleton: true },
    schema: {},
    fields: [
      ID_FIELD,
      createTranslationAliasField(),
      { field: 'logo', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'contact_email', type: 'string', meta: { interface: 'input' } },
      { field: 'contact_phone', type: 'string', meta: { interface: 'input' } },
      { field: 'address', type: 'text', meta: { interface: 'textarea' } },
      { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
      { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'og_image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } }
    ]
  },
  {
    collection: 'homepage',
    meta: { icon: 'home', note: 'Homepage Layout', singleton: true },
    schema: {},
    fields: [
      ID_FIELD,
      createTranslationAliasField(),
      { field: 'title', type: 'string', meta: { interface: 'input' } },
      { field: 'hero_section', type: 'json', meta: { interface: 'json' } }
    ]
  },
  {
    collection: 'media_retention',
    meta: { icon: 'delete', note: 'Media Retention Queue' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'file', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'module', type: 'string', meta: { interface: 'input', required: true } },
      {
        field: 'state',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Active', value: 'active' },
              { text: 'Soft Deleted', value: 'soft_deleted' },
              { text: 'Purged', value: 'purged' }
            ]
          }
        },
        schema: { default_value: 'inactive' }
      },
      { field: 'soft_deleted_at', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'purge_after', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'delete_reason', type: 'text', meta: { interface: 'textarea' } },
      { field: 'deleted_by', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'hard_deleted_at', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'hard_deleted_by', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'source', type: 'string', meta: { interface: 'input' } },
      { field: 'original_filename', type: 'string', meta: { interface: 'input' } },
      { field: 'mime_type', type: 'string', meta: { interface: 'input' } },
      { field: 'size_bytes', type: 'integer', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'media_audit_events',
    meta: { icon: 'fact_check', note: 'Media Audit Log' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'file', type: 'uuid', meta: { interface: 'input' } },
      { field: 'actor', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'event_type', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'action', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'module', type: 'string', meta: { interface: 'input' } },
      { field: 'reason', type: 'text', meta: { interface: 'textarea' } },
      { field: 'source', type: 'string', meta: { interface: 'input' } },
      { field: 'ip_address', type: 'string', meta: { interface: 'input' } },
      { field: 'user_agent', type: 'string', meta: { interface: 'input' } },
      { field: 'original_filename', type: 'string', meta: { interface: 'input' } },
      { field: 'mime_type', type: 'string', meta: { interface: 'input' } },
      { field: 'size_bytes', type: 'integer', meta: { interface: 'input' } }
    ]
  },
  {
    ...LANGUAGE_COLLECTION_DEF
  },
  ...TRANSLATION_COLLECTION_DEFS,
  {
    collection: 'customers',
    meta: { icon: 'people', note: 'Customers' },
    schema: {},
    fields: [
      ID_FIELD,
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Active', value: 'active' },
              { text: 'Inactive', value: 'inactive' }
            ]
          }
        },
        schema: { default_value: 'active' }
      },
      { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } },
      { field: 'company_name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'tax_code', type: 'string', meta: { interface: 'input' } },
      { field: 'contact_name', type: 'string', meta: { interface: 'input' } },
      { field: 'email', type: 'string', meta: { interface: 'input' } },
      { field: 'phone', type: 'string', meta: { interface: 'input' } },
      { field: 'address', type: 'text', meta: { interface: 'textarea' } },
      { field: 'sales_owner', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  },
  {
    collection: 'orders',
    meta: { icon: 'shopping_cart', note: 'Orders' },
    schema: {},
    fields: [
      ID_FIELD,
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Pending', value: 'pending' },
              { text: 'Confirmed', value: 'confirmed' },
              { text: 'Processing', value: 'processing' },
              { text: 'Shipped', value: 'shipped' },
              { text: 'Completed', value: 'completed' },
              { text: 'Cancelled', value: 'cancelled' }
            ]
          }
        },
        schema: { default_value: 'pending' }
      },
      { field: 'code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'customer', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'order_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'subtotal', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'tax', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'total', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'notes', type: 'text', meta: { interface: 'textarea' } },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
    ]
  },
  {
    collection: 'order_items',
    meta: { icon: 'list', note: 'Order Items' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'order', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'sku', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'description', type: 'string', meta: { interface: 'input' } },
      { field: 'qty', type: 'integer', meta: { interface: 'input' } },
      { field: 'unit_price', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'line_total', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } }
    ]
  },
  {
    collection: 'invoices',
    meta: { icon: 'receipt', note: 'Invoices' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'customer', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'order', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'issue_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'due_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'amount', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'paid_amount', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      { field: 'balance', type: 'decimal', meta: { interface: 'input' }, schema: { numeric_precision: 15, numeric_scale: 2 } },
      {
        field: 'paid_status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Unpaid', value: 'unpaid' },
              { text: 'Partial', value: 'partial' },
              { text: 'Paid', value: 'paid' },
              { text: 'Overdue', value: 'overdue' }
            ]
          }
        },
        schema: { default_value: 'unpaid' }
      },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
    ]
  },
  {
    collection: 'deliveries',
    meta: { icon: 'local_shipping', note: 'Deliveries' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'order', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'scheduled_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'delivered_date', type: 'date', meta: { interface: 'datetime' } },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Scheduled', value: 'scheduled' },
              { text: 'In Transit', value: 'in_transit' },
              { text: 'Delivered', value: 'delivered' },
              { text: 'Late', value: 'late' },
              { text: 'Cancelled', value: 'cancelled' }
            ]
          }
        },
        schema: { default_value: 'scheduled' }
      },
      { field: 'tracking_ref', type: 'string', meta: { interface: 'input' } },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' }, schema: { is_unique: true } }
    ]
  },
  {
    collection: 'integration_events',
    meta: { icon: 'sync', note: 'ERP Outbox Events', hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      {
        field: 'entity',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: {
            choices: [
              { text: 'Orders', value: 'orders' },
              { text: 'Invoices', value: 'invoices' },
              { text: 'Deliveries', value: 'deliveries' }
            ]
          }
        }
      },
      {
        field: 'op',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: {
            choices: [
              { text: 'Create', value: 'create' },
              { text: 'Update', value: 'update' }
            ]
          }
        }
      },
      { field: 'record_id', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'erp_ref', type: 'string', meta: { interface: 'input' } },
      { field: 'revision', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'idempotency_key', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'payload', type: 'json', meta: { interface: 'json', required: true } },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Pending', value: 'pending' },
              { text: 'Sent', value: 'sent' },
              { text: 'Failed', value: 'failed' }
            ]
          }
        },
        schema: { default_value: 'pending' }
      },
      { field: 'attempts', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'next_attempt_at', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'last_attempt_at', type: 'timestamp', meta: { interface: 'datetime' } },
      { field: 'last_status_code', type: 'integer', meta: { interface: 'input' } },
      { field: 'last_error', type: 'text', meta: { interface: 'textarea' } },
      { field: 'destination_url', type: 'string', meta: { interface: 'input' } }
    ]
  },
  {
    collection: 'rfq_requests',
    meta: { icon: 'request_quote', note: 'RFQ Requests' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'company', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'contact_name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'email', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'phone', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'industry', type: 'string', meta: { interface: 'input' } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'line_items', type: 'json', meta: { interface: 'json', required: true } },
      { field: 'message', type: 'text', meta: { interface: 'textarea' } },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'New', value: 'new' },
              { text: 'Quoted', value: 'quoted' },
              { text: 'Won', value: 'won' },
              { text: 'Lost', value: 'lost' }
            ]
          }
        },
        schema: { default_value: 'new' }
      },
      { field: 'assigned_sales', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      {
        field: 'source',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Web Site', value: 'web' },
              { text: 'Portal', value: 'portal' }
            ]
          }
        },
        schema: { default_value: 'web' }
      },
      { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  },
  {
    collection: 'rfq_assignment_rules',
    meta: { icon: 'rule', note: 'RFQ Assignment Rules' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'industry', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'assigned_sales', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'priority', type: 'integer', meta: { interface: 'input' }, schema: { default_value: 0 } },
      { field: 'is_default', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } }
    ]
  },
  {
    collection: 'products_industries',
    meta: { hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'products_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'industries_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  },
  {
    collection: 'products_files',
    meta: { hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'products_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'directus_files_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  },
  {
    collection: 'newsletter_subscribers',
    meta: { icon: 'mail', note: 'Email Newsletter Subscribers' },
    schema: {},
    fields: [
      ID_FIELD,
      {
        field: 'email',
        type: 'string',
        meta: { interface: 'input', width: 'full', required: true },
        schema: { is_unique: true }
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Active', value: 'active' },
              { text: 'Inactive', value: 'inactive' }
            ]
          }
        },
        schema: { default_value: 'active' }
      },
      {
        field: 'created_at',
        type: 'timestamp',
        meta: { interface: 'datetime', readonly: true },
        schema: { default_value: 'CURRENT_TIMESTAMP' }
      }
    ]
  }
];
