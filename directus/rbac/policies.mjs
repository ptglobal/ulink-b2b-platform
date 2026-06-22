import {
  ADMIN_POLICY_ID,
  VISITOR_POLICY_ID,
  EDITOR_POLICY_ID,
  SALES_POLICY_ID,
  CUSTOMER_POLICY_ID,
  FRONTEND_SERVICE_POLICY_ID
} from '../lib/constants.mjs';

export const POLICY_DEFS = [
  {
    id: ADMIN_POLICY_ID,
    name: 'Administrator',
    description: 'Full administrative access',
    app_access: true,
    admin_access: true
  },
  {
    id: VISITOR_POLICY_ID,
    name: '$t:public_label',
    description: '$t:public_description',
    app_access: false,
    admin_access: false
  },
  {
    id: EDITOR_POLICY_ID,
    name: 'Editor Access Policy',
    description: 'Full write access to content collections',
    app_access: true,
    admin_access: false
  },
  {
    id: SALES_POLICY_ID,
    name: 'Sales Access Policy',
    description: 'Full write access to commerce data and read access to content',
    app_access: true,
    admin_access: false
  },
  {
    id: CUSTOMER_POLICY_ID,
    name: 'Customer Portal Access Policy',
    description: 'Read access to content and row-level access to own commerce data',
    app_access: true,
    admin_access: false
  },
  {
    id: FRONTEND_SERVICE_POLICY_ID,
    name: 'Frontend Service Policy',
    description: 'Server-side write access for the Next.js frontend service token (RFQ + newsletter submissions)',
    app_access: false,
    admin_access: false
  }
];

export async function ensurePolicies(helpers) {
  for (const policy of POLICY_DEFS) {
    await helpers.ensurePolicy(policy);
  }
}
