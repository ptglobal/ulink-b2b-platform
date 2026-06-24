import {
  VISITOR_POLICY_ID,
  EDITOR_POLICY_ID,
  SALES_POLICY_ID,
  CUSTOMER_POLICY_ID,
  FRONTEND_SERVICE_POLICY_ID
} from '../lib/constants.mjs';
import { TRANSLATION_COLLECTION_NAMES } from '../lib/i18n.mjs';

export const CONTENT_COLLECTIONS = [
  'hero_banners',
  'partners',
  'product_categories',
  'products',
  'product_skus',
  'documents',
  'regional_hubs',
  'industries',
  'standards',
  'blog_posts',
  'case_studies',
  'iso_certifications',
  'pages'
];

export const PUBLIC_ALWAYS_READ_COLLECTIONS = ['site_settings', 'homepage', 'languages', ...TRANSLATION_COLLECTION_NAMES];

export const EDITOR_WRITE_COLLECTIONS = [
  ...CONTENT_COLLECTIONS,
  'site_settings',
  'homepage',
  ...TRANSLATION_COLLECTION_NAMES
];

export function buildPermissionDefs() {
  const permissions = [];

  // Visitor (Public Policy) Permissions
  for (const col of CONTENT_COLLECTIONS) {
    permissions.push({
      policy: VISITOR_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: { status: { _eq: 'published' } },
      fields: ['*']
    });
  }

  for (const col of PUBLIC_ALWAYS_READ_COLLECTIONS) {
    permissions.push({
      policy: VISITOR_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: {},
      fields: ['*']
    });
  }

  permissions.push({
    policy: VISITOR_POLICY_ID,
    collection: 'directus_files',
    action: 'read',
    permissions: {},
    fields: ['*']
  });

  // Visitor (Public) can create newsletter subscriptions
  permissions.push({
    policy: VISITOR_POLICY_ID,
    collection: 'newsletter_subscribers',
    action: 'create',
    permissions: {},
    fields: ['email', 'status']
  });

  // Frontend Service Policy — the only perms the Next.js server-side write token
  // (DIRECTUS_TOKEN = frontend-api static token) needs: create RFQ + newsletter.
  // Attached to VISITOR_ROLE in access.mjs (only the frontend-api user has it).
  permissions.push(
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'newsletter_subscribers',
      action: 'create',
      permissions: {},
      fields: ['email', 'status']
    },
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'rfq_requests',
      action: 'create',
      permissions: {},
      fields: [
        'company',
        'contact_name',
        'email',
        'phone',
        'address',
        'hub',
        'industry',
        'message',
        'line_items',
        'status',
        'source',
        'user',
        'scheduled_delivery',
        'requested_delivery_date'
      ]
    },
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'rfq_requests',
      action: 'read',
      permissions: {},
      fields: ['*']
    },
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'rfq_requests',
      action: 'update',
      permissions: {},
      fields: ['assigned_sales']
    },
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'directus_notifications',
      action: 'create',
      permissions: {},
      fields: ['*']
    },
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'rfq_assignment_rules',
      action: 'read',
      permissions: {},
      fields: ['*']
    },
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'directus_users',
      action: 'read',
      permissions: {},
      fields: ['id', 'email', 'first_name', 'last_name']
    }
  );

  for (const col of CONTENT_COLLECTIONS) {
    permissions.push({
      policy: CUSTOMER_POLICY_ID,
      collection: col,
      action: 'read',
      permissions: { status: { _eq: 'published' } },
      fields: ['*']
    });
  }

  for (const col of PUBLIC_ALWAYS_READ_COLLECTIONS) {
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
      fields: ['contact_name', 'phone', 'address']
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
      action: 'read',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    }
  );

  for (const col of PUBLIC_ALWAYS_READ_COLLECTIONS) {
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

  for (const action of ['create', 'read', 'update', 'delete']) {
    permissions.push({
      policy: SALES_POLICY_ID,
      collection: 'rfq_assignment_rules',
      action,
      permissions: {},
      fields: ['*']
    });
  }

  for (const col of EDITOR_WRITE_COLLECTIONS) {
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

  permissions.push({
    policy: EDITOR_POLICY_ID,
    collection: 'languages',
    action: 'read',
    permissions: {},
    fields: ['*']
  });

  for (const action of ['create', 'read', 'update']) {
    permissions.push({
      policy: EDITOR_POLICY_ID,
      collection: 'directus_files',
      action,
      permissions: {},
      fields: ['*']
    });
  }

  for (const action of ['create', 'read', 'update']) {
    permissions.push({
      policy: SALES_POLICY_ID,
      collection: 'directus_files',
      action,
      permissions: {},
      fields: ['*']
    });
  }

  for (const collection of ['vn_provinces']) {
    permissions.push({
      policy: EDITOR_POLICY_ID,
      collection,
      action: 'read',
      permissions: {},
      fields: ['*']
    });
    permissions.push({
      policy: SALES_POLICY_ID,
      collection,
      action: 'read',
      permissions: {},
      fields: ['*']
    });
  }

  permissions.push({
    policy: EDITOR_POLICY_ID,
    collection: 'directus_folders',
    action: 'read',
    permissions: {},
    fields: ['*']
  });

  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'directus_folders',
    action: 'read',
    permissions: {},
    fields: ['*']
  });

  // Editor & Sales have full CRUD access to newsletter subscriptions
  for (const policy of [EDITOR_POLICY_ID, SALES_POLICY_ID]) {
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy,
        collection: 'newsletter_subscribers',
        action,
        permissions: {},
        fields: ['*']
      });
    }
  }

  // Junction tables: products_industries, products_files, products_standards & products_regional_hubs
  // Visitor & Customer need read access for M2M queries (filter by industry/standard/region, load gallery)
  for (const collection of ['products_industries', 'products_files', 'products_standards', 'products_regional_hubs']) {
    for (const policy of [VISITOR_POLICY_ID, CUSTOMER_POLICY_ID]) {
      permissions.push({
        policy,
        collection,
        action: 'read',
        permissions: {},
        fields: ['*']
      });
    }
    // Editor & Sales: full CRUD (manage product relations)
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy: EDITOR_POLICY_ID,
        collection,
        action,
        permissions: {},
        fields: ['*']
      });
      permissions.push({
        policy: SALES_POLICY_ID,
        collection,
        action,
        permissions: {},
        fields: ['*']
      });
    }
  }

  // Hub child collections: industrial zones & team members
  // Visitor & Customer: read access (no status filter — child entities)
  for (const collection of ['hub_industrial_zones', 'hub_team_members']) {
    for (const policy of [VISITOR_POLICY_ID, CUSTOMER_POLICY_ID, SALES_POLICY_ID]) {
      permissions.push({
        policy,
        collection,
        action: 'read',
        permissions: {},
        fields: ['*']
      });
    }
    // Editor: full CRUD
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy: EDITOR_POLICY_ID,
        collection,
        action,
        permissions: {},
        fields: ['*']
      });
    }
  }

  return permissions;
}

export async function ensurePermissions(helpers) {
  const desiredPermissions = buildPermissionDefs();
  const desiredKeys = new Set(
    desiredPermissions.map((permission) => `${permission.policy}:${permission.collection}:${permission.action}`)
  );
  const managedPolicies = new Set([
    VISITOR_POLICY_ID,
    EDITOR_POLICY_ID,
    SALES_POLICY_ID,
    CUSTOMER_POLICY_ID,
    FRONTEND_SERVICE_POLICY_ID
  ]);
  const currentPermissions = await helpers.listPermissions();
  const staleIds = currentPermissions
    .filter((permission) => managedPolicies.has(permission.policy) && !desiredKeys.has(`${permission.policy}:${permission.collection}:${permission.action}`))
    .map((permission) => permission.id)
    .filter(Boolean);

  if (staleIds.length > 0) {
    await helpers.deletePermissionIds(staleIds);
    console.log(`-  Deleted ${staleIds.length} stale permission(s) from managed policies`);
  }

  for (const permission of desiredPermissions) {
    await helpers.ensurePermission(permission);
  }
}
