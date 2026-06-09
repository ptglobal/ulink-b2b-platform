import { EDITOR_POLICY_ID, SALES_POLICY_ID, CUSTOMER_POLICY_ID } from '../constants.mjs';

export const CONTENT_COLLECTIONS = [
  'hero_banners',
  'partners',
  'product_categories',
  'products',
  'product_skus',
  'documents',
  'regional_hubs',
  'industries',
  'blog_posts',
  'case_studies',
  'iso_certifications',
  'pages'
];

export function buildPermissionDefs() {
  const permissions = [];

  for (const col of CONTENT_COLLECTIONS) {
    permissions.push({
      policy: CUSTOMER_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: { status: { _eq: 'published' } },
      fields: ['*']
    });
  }

  for (const col of ['site_settings', 'homepage']) {
    permissions.push({
      policy: CUSTOMER_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: {},
      fields: ['*']
    });
  }

  permissions.push(
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'customers',
      action: 'read',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'customers',
      action: 'update',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'orders',
      action: 'read',
      permissions: { customer: { user: { _eq: '$CURRENT_USER' } } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'order_items',
      action: 'read',
      permissions: { order: { customer: { user: { _eq: '$CURRENT_USER' } } } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'invoices',
      action: 'read',
      permissions: { customer: { user: { _eq: '$CURRENT_USER' } } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'deliveries',
      action: 'read',
      permissions: { order: { customer: { user: { _eq: '$CURRENT_USER' } } } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'rfq_requests',
      action: 'create',
      permissions: {},
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'rfq_requests',
      action: 'read',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    }
  );

  for (const col of [...CONTENT_COLLECTIONS, 'site_settings', 'homepage']) {
    permissions.push({
      policy: SALES_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: {},
      fields: ['*']
    });
  }

  for (const col of ['customers', 'orders', 'order_items', 'invoices', 'deliveries', 'rfq_requests']) {
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy: SALES_POLICY_ID,
        collection: col,
        action,
        permissions: {},
        fields: ['*']
      });
    }
  }

  for (const col of [...CONTENT_COLLECTIONS, 'site_settings', 'homepage']) {
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy: EDITOR_POLICY_ID,
        collection: col,
        action,
        permissions: {},
        fields: ['*']
      });
    }
  }

  return permissions;
}

export async function ensurePermissions(helpers) {
  for (const permission of buildPermissionDefs()) {
    await helpers.ensurePermission(permission);
  }
}
