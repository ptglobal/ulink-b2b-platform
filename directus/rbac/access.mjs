import {
  EDITOR_ROLE_ID,
  SALES_ROLE_ID,
  CUSTOMER_ROLE_ID,
  EDITOR_POLICY_ID,
  SALES_POLICY_ID,
  CUSTOMER_POLICY_ID
} from '../constants.mjs';

export const ACCESS_DEFS = [
  { role: EDITOR_ROLE_ID, policy: EDITOR_POLICY_ID },
  { role: SALES_ROLE_ID, policy: SALES_POLICY_ID },
  { role: CUSTOMER_ROLE_ID, policy: CUSTOMER_POLICY_ID }
];

export async function ensureAccessLinks(helpers) {
  for (const access of ACCESS_DEFS) {
    await helpers.ensureAccess(access);
  }
}
