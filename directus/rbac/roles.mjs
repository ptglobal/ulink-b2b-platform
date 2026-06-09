import { ADMIN_ROLE_ID, VISITOR_ROLE_ID, EDITOR_ROLE_ID, SALES_ROLE_ID, CUSTOMER_ROLE_ID } from '../constants.mjs';

export const ROLE_DEFS = [
  {
    id: ADMIN_ROLE_ID,
    name: 'Administrator',
    icon: 'verified',
    description: 'System Administrator with full access'
  },
  {
    id: VISITOR_ROLE_ID,
    name: 'Visitor',
    icon: 'public',
    description: 'Public/Visitor anonymous access'
  },
  {
    id: EDITOR_ROLE_ID,
    name: 'Editor',
    icon: 'edit',
    description: 'Can CRUD content collections'
  },
  {
    id: SALES_ROLE_ID,
    name: 'Sales',
    icon: 'business_center',
    description: 'Can CRUD commerce data and read content'
  },
  {
    id: CUSTOMER_ROLE_ID,
    name: 'Customer',
    icon: 'person',
    description: 'Authenticated B2B Customer Portal user'
  }
];

export async function ensureRoles(helpers) {
  for (const role of ROLE_DEFS) {
    await helpers.ensureRole(role);
  }
}
