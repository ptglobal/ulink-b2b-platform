import { ID_FIELD, STATUS_FIELD } from '../lib/constants.mjs';
import { HUB_OPERATING_STATUSES } from '../lib/hub-domain.mjs';
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
      { field: 'brand', type: 'string', meta: { interface: 'input', width: 'half', note: 'Brand name (e.g. 3M, Honeywell, Ansell)' } },
      { field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'short_description', type: 'text', meta: { interface: 'textarea' } },
      { field: 'specifications', type: 'json', meta: { interface: 'json' } },
      { field: 'hero', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'gallery', type: 'alias', meta: { interface: 'files', special: ['m2m'] } },
      { field: 'industries', type: 'alias', meta: { interface: 'list-m2m', special: ['m2m'] } },
      { field: 'standards', type: 'alias', meta: { interface: 'list-m2m', special: ['m2m'] } },
      { field: 'regions', type: 'alias', meta: { interface: 'list-m2m', special: ['m2m'] } },
      { field: 'documents', type: 'alias', meta: { interface: 'list-o2m', special: ['o2m'] } },
      { field: 'skus', type: 'alias', meta: { interface: 'list-o2m', special: ['o2m'] } },
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
      {
        field: 'stock_status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'In Stock', value: 'in_stock' },
              { text: 'Low Stock', value: 'low_stock' },
              { text: 'Out of Stock', value: 'out_of_stock' }
            ]
          },
          width: 'half',
          note: 'Inventory availability status shown as badge on product card'
        },
        schema: { default_value: 'in_stock' }
      },
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
    collection: 'vn_provinces',
    meta: { icon: 'map', note: 'Vietnam Provinces', hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'code', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'abbr', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } }
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
      { field: 'hub_code', type: 'string', meta: { interface: 'input', readonly: true }, schema: { is_unique: true } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'province', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
      { field: 'detail_address', type: 'text', meta: { interface: 'textarea', required: true } },
      {
        field: 'operating_status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          required: true,
          options: {
            choices: HUB_OPERATING_STATUSES
          }
        }
      },
      { field: 'coordinates', type: 'string', meta: { interface: 'input', options: { placeholder: 'lat,lng' } } },
      // ── Warehouse Capacity ──
      { field: 'divider_warehouse', type: 'alias', meta: { interface: 'presentation-divider', options: { title: 'Warehouse Capacity' }, special: ['alias', 'no-data'] } },
      { field: 'warehouse_total_area', type: 'float', meta: { interface: 'input', width: 'half', options: { placeholder: 'm²' } } },
      { field: 'warehouse_utilized_area', type: 'float', meta: { interface: 'input', width: 'half', options: { placeholder: 'm²' } } },
      { field: 'warehouse_available_area', type: 'float', meta: { interface: 'input', width: 'half', options: { placeholder: 'm²' } } },
      { field: 'warehouse_storage_tons', type: 'integer', meta: { interface: 'input', width: 'half', options: { placeholder: 'tons' } } },
      { field: 'warehouse_pallets', type: 'integer', meta: { interface: 'input', width: 'half', options: { placeholder: 'pallets' } } },
      // ── SLA Metrics ──
      { field: 'divider_sla', type: 'alias', meta: { interface: 'presentation-divider', options: { title: 'SLA Metrics' }, special: ['alias', 'no-data'] } },
      { field: 'standard_delivery_time', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'on_time_rate', type: 'float', meta: { interface: 'input', width: 'half', options: { placeholder: '%' } } },
      { field: 'on_time_rate_delta', type: 'string', meta: { interface: 'input', width: 'half', options: { placeholder: 'e.g. +2.1%' } } },
      { field: 'orders_today', type: 'integer', meta: { interface: 'input', width: 'half' } },
      { field: 'order_capacity_per_day', type: 'integer', meta: { interface: 'input', width: 'half' } },
      { field: 'avg_delivery_time', type: 'string', meta: { interface: 'input', width: 'half' } },
      // ── Technical Team ──
      { field: 'divider_team', type: 'alias', meta: { interface: 'presentation-divider', options: { title: 'Technical Team' }, special: ['alias', 'no-data'] } },
      { field: 'person_in_charge_name', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'person_in_charge_title', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'person_in_charge_phone', type: 'string', meta: { interface: 'input', width: 'half' } },
      { field: 'current_personnel_count', type: 'integer', meta: { interface: 'input', width: 'half' } },
      // ── O2M Relations ──
      { field: 'industrial_zones', type: 'alias', meta: { interface: 'list-o2m', special: ['o2m'] } },
      { field: 'team_members', type: 'alias', meta: { interface: 'list-o2m', special: ['o2m'] } }
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
      { field: 'sales_owner', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      // ISO-8601 timestamp of the moment the user accepted the terms of service
      // during registration. Stamped by customer-onboarding-endpoint from
      // {agree, agree_at} forwarded by the frontend. Provides an auditable
      // consent trail (GDPR / ToS compliance).
      { field: 'consented_at', type: 'timestamp', meta: { interface: 'datetime' } }
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
      { field: 'address', type: 'string', meta: { interface: 'input', required: true } },
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
              { text: 'Pending (Đang chờ)', value: 'pending', color: '#fbbf24' },
              { text: 'Approved (Duyệt)', value: 'approved', color: '#10b981' },
              { text: 'Rejected (Từ chối)', value: 'rejected', color: '#ef4444' }
            ]
          }
        },
        schema: { default_value: 'pending' }
      },
      {
        field: 'approval_note',
        type: 'text',
        meta: {
          interface: 'textarea',
          conditions: [
            {
              name: 'Hide if not approved',
              rule: { status: { _neq: 'approved' } },
              hidden: true
            }
          ]
        }
      },
      {
        field: 'reject_reason',
        type: 'text',
        meta: {
          interface: 'textarea',
          conditions: [
            {
              name: 'Require if rejected',
              rule: { status: { _eq: 'rejected' } },
              required: true
            },
            {
              name: 'Hide if not rejected',
              rule: { status: { _neq: 'rejected' } },
              hidden: true
            }
          ]
        }
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
      { field: 'scheduled_delivery', type: 'boolean', meta: { interface: 'boolean' }, schema: { default_value: false } },
      { field: 'requested_delivery_date', type: 'date', meta: { interface: 'datetime' } },
      { field: 'user', type: 'uuid', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      {
        field: 'created_at',
        type: 'timestamp',
        meta: { interface: 'datetime', readonly: true },
        schema: { default_value: 'CURRENT_TIMESTAMP' }
      }
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
    collection: 'hub_industrial_zones',
    meta: { icon: 'factory', note: 'Hub Industrial Zones' },
    schema: {},
    fields: [
      ID_FIELD,
      createTranslationAliasField(),
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
      { field: 'image', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } }
    ]
  },
  {
    collection: 'hub_team_members',
    meta: { icon: 'group', note: 'Hub Team Members', sort_field: 'sort' },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'role', type: 'string', meta: { interface: 'input' } },
      { field: 'years_experience', type: 'integer', meta: { interface: 'input' } },
      { field: 'photo', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } },
      { field: 'hub', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } },
      { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true } }
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
    collection: 'standards',
    meta: { icon: 'verified', note: 'Product Standards & Certifications (e.g. ISO 14644, EN 455)' },
    schema: {},
    fields: [
      ID_FIELD,
      STATUS_FIELD,
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', required: true }, schema: { is_unique: true } },
      { field: 'description', type: 'text', meta: { interface: 'textarea' } }
    ]
  },
  {
    collection: 'products_standards',
    meta: { hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'products_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'standards_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
    ]
  },
  {
    collection: 'products_regional_hubs',
    meta: { hidden: true },
    schema: {},
    fields: [
      ID_FIELD,
      { field: 'products_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } },
      { field: 'regional_hubs_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }
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
