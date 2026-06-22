import {
  ADMIN_ROLE_ID,
  VISITOR_ROLE_ID,
  EDITOR_ROLE_ID,
  SALES_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ADMIN_POLICY_ID,
  VISITOR_POLICY_ID,
  EDITOR_POLICY_ID,
  SALES_POLICY_ID,
  CUSTOMER_POLICY_ID
} from '../lib/constants.mjs';

export const ACCESS_DEFS = [
  { role: ADMIN_ROLE_ID, policy: ADMIN_POLICY_ID },
  { role: null, policy: VISITOR_POLICY_ID },
  { role: VISITOR_ROLE_ID, policy: VISITOR_POLICY_ID },
  { role: EDITOR_ROLE_ID, policy: EDITOR_POLICY_ID },
  { role: SALES_ROLE_ID, policy: SALES_POLICY_ID },
  { role: CUSTOMER_ROLE_ID, policy: CUSTOMER_POLICY_ID }
];

export async function ensureAccessLinks(helpers) {
  for (const access of ACCESS_DEFS) {
    await helpers.ensureAccess(access);
  }
}
