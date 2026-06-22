export const STATUS_FIELD = {
  field: 'status',
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    width: 'half',
    options: {
      choices: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
        { text: 'Archived', value: 'archived' }
      ]
    }
  },
  schema: { default_value: 'draft' }
};

export const ID_FIELD = {
  field: 'id',
  type: 'integer',
  meta: { hidden: true, readonly: true, interface: 'input' },
  schema: { is_primary_key: true, has_auto_increment: true }
};

export const ADMIN_ROLE_ID = '78c7d3ca-5d25-487f-bd87-cf42e9edce13';
export const VISITOR_ROLE_ID = '3db04a65-d8af-4e81-b383-eb278a088051';
export const EDITOR_ROLE_ID = 'e11b0e50-1010-410c-9999-000000000001';
export const SALES_ROLE_ID = 'e11b0e50-2020-410c-9999-000000000002';
export const CUSTOMER_ROLE_ID = 'e11b0e50-3030-410c-9999-000000000003';

export const ADMIN_POLICY_ID = 'd1c30905-3f78-49c4-912c-05da703a445e';
export const VISITOR_POLICY_ID = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
export const EDITOR_POLICY_ID = 'b11b0e50-1010-410c-9999-000000000001';
export const SALES_POLICY_ID = 'b11b0e50-2020-410c-9999-000000000002';
export const CUSTOMER_POLICY_ID = 'b11b0e50-3030-410c-9999-000000000003';
// Scoped policy for the Next.js frontend service token (DIRECTUS_TOKEN =
// the frontend-api user's static token). Grants ONLY the server-side writes
// the frontend performs: create newsletter_subscribers + rfq_requests.
export const FRONTEND_SERVICE_POLICY_ID = 'b11b0e50-f0f0-410c-9999-0000000000f5';

// Prefix used for verified tokens issued by our OTP endpoint. The frontend
// distinguishes between our `vt_*` tokens and Directus built-in reset-link
// tokens (which are long raw strings without a prefix) by checking this.
// Keep in sync with the consumer checks in customer-onboarding-endpoint and
// password-change-endpoint, and the frontend /api/auth/reset-password route.
export const VERIFIED_TOKEN_PREFIX = 'vt_';
