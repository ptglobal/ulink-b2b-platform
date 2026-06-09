import { EDITOR_POLICY_ID, SALES_POLICY_ID, CUSTOMER_POLICY_ID } from '../constants.mjs';

export const POLICY_DEFS = [
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
  }
];

export async function ensurePolicies(helpers) {
  for (const policy of POLICY_DEFS) {
    await helpers.ensurePolicy(policy);
  }
}
