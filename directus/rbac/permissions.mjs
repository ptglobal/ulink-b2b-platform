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
      collection: 'contact_requests',
      action: 'create',
      permissions: {},
      fields: ['full_name', 'email', 'phone', 'subject', 'message', 'status']
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
    },
    // sample_requests: frontend-api creates sample requests on behalf of visitors/customers
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'sample_requests',
      action: 'create',
      permissions: {},
      fields: [
        'contact_name',
        'email',
        'company',
        'phone',
        'province',
        'district',
        'address_detail',
        'product_slug',
        'skus',
        'message',
        'status',
        'user'
      ]
    },
    {
      policy: FRONTEND_SERVICE_POLICY_ID,
      collection: 'sample_requests',
      action: 'read',
      permissions: {},
      fields: ['*']
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
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'sample_requests',
      action: 'read',
      permissions: { user: { _eq: '$CURRENT_USER' } },
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'sample_requests',
      action: 'create',
      permissions: {},
      fields: ['*']
    },
    {
      policy: CUSTOMER_POLICY_ID,
      collection: 'directus_files',
      action: 'read',
      permissions: {},
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

  for (const col of ['orders', 'order_items', 'invoices', 'deliveries', 'sample_requests']) {
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

  // ─── Restricted Customer Permissions for Sales ──────────────────────
  // Sales can read all customers (to check duplicate / existing accounts)
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'customers',
    action: 'read',
    permissions: {},
    fields: ['*']
  });

  // Sales can create customers
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'customers',
    action: 'create',
    permissions: {},
    fields: ['*']
  });

  // Sales can only update customers they own, and CANNOT change the sales_owner field
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'customers',
    action: 'update',
    permissions: { sales_owner: { _eq: '$CURRENT_USER' } },
    fields: ['*', '!sales_owner']
  });

  // Sales can only delete customers they own
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'customers',
    action: 'delete',
    permissions: { sales_owner: { _eq: '$CURRENT_USER' } },
    fields: ['*']
  });

  // ─── Restricted RFQ Permissions for Sales ───────────────────────────
  // Sales can only read RFQs assigned to them
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'rfq_requests',
    action: 'read',
    permissions: { assigned_sales: { _eq: '$CURRENT_USER' } },
    fields: ['*']
  });

  // Sales can create RFQs (on behalf of clients)
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'rfq_requests',
    action: 'create',
    permissions: {},
    fields: ['*']
  });

  // Sales can only update RFQs assigned to them, and CANNOT change the assigned_sales field
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'rfq_requests',
    action: 'update',
    permissions: { assigned_sales: { _eq: '$CURRENT_USER' } },
    fields: ['*', '!assigned_sales']
  });

  // Sales can only delete RFQs assigned to them
  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'rfq_requests',
    action: 'delete',
    permissions: { assigned_sales: { _eq: '$CURRENT_USER' } },
    fields: ['*']
  });

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

  for (const action of ['create', 'read', 'update', 'delete']) {
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

  // Sales & Editor need to read directus_users to resolve relational fields (e.g. sample_requests.user)
  for (const policy of [SALES_POLICY_ID, EDITOR_POLICY_ID]) {
    permissions.push({
      policy,
      collection: 'directus_users',
      action: 'read',
      permissions: {},
      fields: ['id', 'email', 'first_name', 'last_name', 'role', 'status']
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

  for (const action of ['create', 'read', 'update', 'delete']) {
    permissions.push({
      policy: EDITOR_POLICY_ID,
      collection: 'directus_folders',
      action,
      permissions: {},
      fields: ['*']
    });
  }

  permissions.push({
    policy: SALES_POLICY_ID,
    collection: 'directus_folders',
    action: 'read',
    permissions: {},
    fields: ['*']
  });

  // Admin panel system collections: presets, activity, revisions, notifications
  // Required for app_access roles to save items and view revision history in admin UI
  for (const policy of [EDITOR_POLICY_ID, SALES_POLICY_ID]) {
    // Presets: admin panel saves layout/filter preferences per user
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({
        policy,
        collection: 'directus_presets',
        action,
        permissions: { user: { _eq: '$CURRENT_USER' } },
        fields: ['*']
      });
    }
    // Activity & Revisions: revision sidebar in item detail view
    permissions.push({
      policy,
      collection: 'directus_activity',
      action: 'read',
      permissions: {},
      fields: ['*']
    });
    permissions.push({
      policy,
      collection: 'directus_revisions',
      action: 'read',
      permissions: {},
      fields: ['*']
    });
    // Notifications: in-app notifications
    for (const action of ['create', 'read', 'update']) {
      permissions.push({
        policy,
        collection: 'directus_notifications',
        action,
        permissions: { recipient: { _eq: '$CURRENT_USER' } },
        fields: ['*']
      });
    }
    // Shares: required by admin panel when editing items
    permissions.push({
      policy,
      collection: 'directus_shares',
      action: 'read',
      permissions: {},
      fields: ['*']
    });
    permissions.push({
      policy,
      collection: 'directus_shares',
      action: 'create',
      permissions: {},
      fields: ['*']
    });
  }

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
  for (const collection of ['products_industries', 'products_files', 'products_standards', 'products_regional_hubs', 'products_product_attributes']) {
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

  // Product attributes & options: read for visitors/customers, full CRUD for editors
  for (const collection of ['product_attributes', 'product_attribute_options']) {
    for (const policy of [VISITOR_POLICY_ID, CUSTOMER_POLICY_ID]) {
      permissions.push({
        policy,
        collection,
        action: 'read',
        permissions: {},
        fields: ['*']
      });
    }
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

  for (const policy of [SALES_POLICY_ID, EDITOR_POLICY_ID]) {
    permissions.push({
      policy,
      collection: 'contact_requests',
      action: 'read',
      permissions: {},
      fields: ['*']
    });
    permissions.push({
      policy,
      collection: 'contact_requests',
      action: 'update',
      permissions: {},
      fields: ['status']
    });
  }

  return permissions;
}

export async function ensurePermissions(helpers, publicPolicyId) {
  const visitorPolicyId = publicPolicyId || VISITOR_POLICY_ID;
  const desiredPermissions = buildPermissionDefs().map((p) => {
    if (p.policy === VISITOR_POLICY_ID) {
      return { ...p, policy: visitorPolicyId };
    }
    return p;
  });
  const desiredKeys = new Set(
    desiredPermissions.map((permission) => `${permission.policy}:${permission.collection}:${permission.action}`)
  );
  const managedPolicies = new Set([
    visitorPolicyId,
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
