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

export const EDITOR_ROLE_ID = 'e11b0e50-1010-410c-9999-000000000001';
export const SALES_ROLE_ID = 'e11b0e50-2020-410c-9999-000000000002';
export const CUSTOMER_ROLE_ID = 'e11b0e50-3030-410c-9999-000000000003';

export const EDITOR_POLICY_ID = 'b11b0e50-1010-410c-9999-000000000001';
export const SALES_POLICY_ID = 'b11b0e50-2020-410c-9999-000000000002';
export const CUSTOMER_POLICY_ID = 'b11b0e50-3030-410c-9999-000000000003';
