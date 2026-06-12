import {
  readUsers,
  createUser,
  updateUser,
  readItems,
  createItem,
  updateItem
} from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './config.mjs';
import { EDITOR_ROLE_ID, SALES_ROLE_ID, CUSTOMER_ROLE_ID } from './constants.mjs';
import { logInfo, logPass, logDone, logFatal } from './logging.mjs';

const client = createDirectusClient();

async function upsertUserByEmail(email, data) {
  const existing = await client.request(readUsers({ filter: { email: { _eq: email } } }));
  if (existing.length > 0) {
    const updated = await client.request(
      updateUser(existing[0].id, {
        ...data,
        email
      })
    );
    logPass(`User updated: ${email}`);
    return updated.id;
  }

  const created = await client.request(
    createUser({
      ...data,
      email
    })
  );
  logPass(`User created: ${email}`);
  return created.id;
}

async function upsertItemByField(collection, uniqueField, data) {
  const existing = await client.request(
    readItems(collection, {
      filter: { [uniqueField]: { _eq: data[uniqueField] } },
      limit: 1
    })
  );

  if (existing.length > 0) {
    const updated = await client.request(updateItem(collection, existing[0].id, data));
    logPass(`${collection} updated: ${data[uniqueField]}`);
    return updated;
  }

  const created = await client.request(createItem(collection, data));
  logPass(`${collection} created: ${data[uniqueField]}`);
  return created;
}

async function main() {
  await loginAdmin(client);
  logInfo(`Authenticated as ${DIRECTUS_ADMIN_EMAIL} at ${DIRECTUS_URL}`);

  const hubs = await client.request(readItems('regional_hubs', { limit: 1 }));
  const skus = await client.request(readItems('product_skus', { limit: 2 }));

  if (hubs.length < 1) {
    throw new Error('Need at least 1 seeded regional_hubs record before RBAC seed.');
  }

  if (skus.length < 2) {
    throw new Error('Need at least 2 seeded product_skus records before RBAC seed.');
  }

  const hubId = hubs[0].id;
  const skuA = skus[0].id;
  const skuB = skus[1].id;
  const electronics = await client.request(
    readItems('industries', {
      filter: { slug: { _eq: 'electronics' } },
      limit: 1
    })
  );

  if (electronics.length < 1) {
    throw new Error('Need seeded electronics industry before RBAC seed.');
  }

  const electronicsId = electronics[0].id;

  await upsertUserByEmail('editor-rbac@example.com', {
    password: 'editor-password-123',
    role: EDITOR_ROLE_ID,
    first_name: 'Editor',
    last_name: 'User',
    status: 'active'
  });

  const salesUserId = await upsertUserByEmail('sales-rbac@example.com', {
    password: 'sales-password-123',
    role: SALES_ROLE_ID,
    first_name: 'Sales',
    last_name: 'User',
    status: 'active'
  });

  const customerAUserId = await upsertUserByEmail('customer-a-rbac@example.com', {
    password: 'customer-a-password-123',
    role: CUSTOMER_ROLE_ID,
    first_name: 'Customer',
    last_name: 'A',
    status: 'active'
  });

  const customerBUserId = await upsertUserByEmail('customer-b-rbac@example.com', {
    password: 'customer-b-password-123',
    role: CUSTOMER_ROLE_ID,
    first_name: 'Customer',
    last_name: 'B',
    status: 'active'
  });

  await upsertItemByField('rfq_assignment_rules', 'id', {
    id: 1,
    hub: hubId,
    industry: electronicsId,
    assigned_sales: salesUserId,
    priority: 10,
    is_default: false
  });

  await upsertItemByField('rfq_assignment_rules', 'id', {
    id: 2,
    hub: null,
    industry: null,
    assigned_sales: null,
    priority: 0,
    is_default: true
  });

  const customerA = await upsertItemByField('customers', 'email', {
    user: customerAUserId,
    company_name: 'RBAC Company A',
    tax_code: 'RBAC-A-TAX',
    contact_name: 'Customer A',
    email: 'customer-a-rbac@example.com',
    phone: '0900000001',
    address: 'RBAC Address A',
    sales_owner: salesUserId,
    status: 'active'
  });

  const customerB = await upsertItemByField('customers', 'email', {
    user: customerBUserId,
    company_name: 'RBAC Company B',
    tax_code: 'RBAC-B-TAX',
    contact_name: 'Customer B',
    email: 'customer-b-rbac@example.com',
    phone: '0900000002',
    address: 'RBAC Address B',
    sales_owner: salesUserId,
    status: 'active'
  });

  const orderA = await upsertItemByField('orders', 'code', {
    code: 'RBAC-ORD-A-001',
    customer: customerA.id,
    order_date: '2026-06-08',
    status: 'completed',
    hub: hubId,
    subtotal: 1000000,
    tax: 100000,
    total: 1100000,
    notes: 'RBAC fixture A',
    erp_ref: 'RBAC-ERP-ORD-A-001'
  });

  const orderB = await upsertItemByField('orders', 'code', {
    code: 'RBAC-ORD-B-001',
    customer: customerB.id,
    order_date: '2026-06-08',
    status: 'completed',
    hub: hubId,
    subtotal: 2000000,
    tax: 200000,
    total: 2200000,
    notes: 'RBAC fixture B',
    erp_ref: 'RBAC-ERP-ORD-B-001'
  });

  await upsertItemByField('order_items', 'description', {
    order: orderA.id,
    sku: skuA,
    description: 'RBAC line item A',
    qty: 1,
    unit_price: 1000000,
    line_total: 1000000
  });

  await upsertItemByField('order_items', 'description', {
    order: orderB.id,
    sku: skuB,
    description: 'RBAC line item B',
    qty: 2,
    unit_price: 1000000,
    line_total: 2000000
  });

  await upsertItemByField('invoices', 'code', {
    code: 'RBAC-INV-A-001',
    customer: customerA.id,
    order: orderA.id,
    issue_date: '2026-06-08',
    due_date: '2026-07-08',
    amount: 1100000,
    paid_amount: 0,
    balance: 1100000,
    paid_status: 'unpaid',
    erp_ref: 'RBAC-ERP-INV-A-001'
  });

  await upsertItemByField('invoices', 'code', {
    code: 'RBAC-INV-B-001',
    customer: customerB.id,
    order: orderB.id,
    issue_date: '2026-06-08',
    due_date: '2026-07-08',
    amount: 2200000,
    paid_amount: 0,
    balance: 2200000,
    paid_status: 'unpaid',
    erp_ref: 'RBAC-ERP-INV-B-001'
  });

  await upsertItemByField('deliveries', 'erp_ref', {
    order: orderA.id,
    hub: hubId,
    scheduled_date: '2026-06-09',
    status: 'scheduled',
    tracking_ref: 'RBAC-TRACK-A',
    erp_ref: 'RBAC-ERP-DLV-A-001'
  });

  await upsertItemByField('deliveries', 'erp_ref', {
    order: orderB.id,
    hub: hubId,
    scheduled_date: '2026-06-10',
    status: 'scheduled',
    tracking_ref: 'RBAC-TRACK-B',
    erp_ref: 'RBAC-ERP-DLV-B-001'
  });

  await upsertItemByField('rfq_requests', 'message', {
    company: 'RBAC Company A',
    contact_name: 'Customer A',
    email: 'customer-a-rbac@example.com',
    phone: '0900000001',
    industry: 'electronics',
    hub: hubId,
    line_items: [{ sku: 'RBAC-SKU-A', qty: 1 }],
    message: 'RBAC-RFQ-A-001',
    status: 'new',
    assigned_sales: salesUserId,
    source: 'portal',
    user: customerAUserId
  });

  await upsertItemByField('rfq_requests', 'message', {
    company: 'RBAC Company B',
    contact_name: 'Customer B',
    email: 'customer-b-rbac@example.com',
    phone: '0900000002',
    industry: 'electronics',
    hub: hubId,
    line_items: [{ sku: 'RBAC-SKU-B', qty: 2 }],
    message: 'RBAC-RFQ-B-001',
    status: 'new',
    assigned_sales: salesUserId,
    source: 'portal',
    user: customerBUserId
  });

  logDone('RBAC fixtures seeded.');
  process.exit(0);
}

main().catch((err) => {
  logFatal('RBAC fixture seed failed.', err);
  process.exit(1);
});
