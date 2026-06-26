import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logPass, logFail, logDone, logFatal } from '../lib/logging.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = process.env.DIRECTUS_PUBLIC_URL ?? 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
const failures = [];

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  logFatal('Missing Directus admin credentials in ../.env');
  process.exit(1);
}

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed for ${email}: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.data.access_token;
}

async function request(token, method, url, body) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  return { status: res.status, ok: res.ok, json };
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
    logFail(message);
    return false;
  }
  logPass(message);
  return true;
}

function getRows(response) {
  return response.json?.data ?? [];
}

function getOneBy(rows, key, value) {
  const row = rows.find((item) => item[key] === value);
  if (!row) {
    throw new Error(`Fixture not found: ${key}=${value}`);
  }
  return row;
}

async function getFixtures(adminToken) {
  const [customersRes, ordersRes, orderItemsRes, invoicesRes, deliveriesRes, rfqsRes, industriesRes, usersRes] =
    await Promise.all([
      request(adminToken, 'GET', '/items/customers?limit=100'),
      request(adminToken, 'GET', '/items/orders?limit=100'),
      request(adminToken, 'GET', '/items/order_items?limit=100'),
      request(adminToken, 'GET', '/items/invoices?limit=100'),
      request(adminToken, 'GET', '/items/deliveries?limit=100'),
      request(adminToken, 'GET', '/items/rfq_requests?limit=100'),
      request(adminToken, 'GET', '/items/industries?limit=100'),
      request(adminToken, 'GET', '/users?filter[email][_eq]=sales-rbac@example.com&limit=1')
    ]);

  assert(customersRes.ok, 'Admin can read customers fixtures.');
  assert(ordersRes.ok, 'Admin can read order fixtures.');
  assert(orderItemsRes.ok, 'Admin can read order item fixtures.');
  assert(invoicesRes.ok, 'Admin can read invoice fixtures.');
  assert(deliveriesRes.ok, 'Admin can read delivery fixtures.');
  assert(rfqsRes.ok, 'Admin can read RFQ fixtures.');
  assert(industriesRes.ok, 'Admin can read industry fixtures.');
  assert(usersRes.ok, 'Admin can read sales user fixture.');

  const customers = getRows(customersRes);
  const orders = getRows(ordersRes);
  const orderItems = getRows(orderItemsRes);
  const invoices = getRows(invoicesRes);
  const deliveries = getRows(deliveriesRes);
  const rfqs = getRows(rfqsRes);
  const industries = getRows(industriesRes);
  const users = getRows(usersRes);

  return {
    customerA: getOneBy(customers, 'email', 'customer-a-rbac@example.com'),
    customerB: getOneBy(customers, 'email', 'customer-b-rbac@example.com'),
    orderA: getOneBy(orders, 'code', 'RBAC-ORD-A-001'),
    orderB: getOneBy(orders, 'code', 'RBAC-ORD-B-001'),
    itemA: getOneBy(orderItems, 'description', 'RBAC line item A'),
    itemB: getOneBy(orderItems, 'description', 'RBAC line item B'),
    invoiceA: getOneBy(invoices, 'code', 'RBAC-INV-A-001'),
    invoiceB: getOneBy(invoices, 'code', 'RBAC-INV-B-001'),
    deliveryA: getOneBy(deliveries, 'erp_ref', 'RBAC-ERP-DLV-A-001'),
    deliveryB: getOneBy(deliveries, 'erp_ref', 'RBAC-ERP-DLV-B-001'),
    rfqA: getOneBy(rfqs, 'message', 'RBAC-RFQ-A-001'),
    rfqB: getOneBy(rfqs, 'message', 'RBAC-RFQ-B-001'),
    electronicsIndustry: getOneBy(industries, 'slug', 'electronics'),
    salesUser: getOneBy(users, 'email', 'sales-rbac@example.com')
  };
}

async function verifyAdmin(adminToken, fixtures) {
  const orders = await request(adminToken, 'GET', '/items/orders?limit=100');
  assert(orders.ok, 'Admin can read orders.');
  const orderCodes = getRows(orders).map((row) => row.code);
  assert(orderCodes.includes(fixtures.orderA.code), 'Admin sees order A.');
  assert(orderCodes.includes(fixtures.orderB.code), 'Admin sees order B.');

  const roles = await request(adminToken, 'GET', '/roles');
  assert(roles.ok, 'Admin can read system roles endpoint.');
}

async function verifyVisitor(fixtures) {
  const products = await request(null, 'GET', '/items/products');
  assert(products.ok, 'Visitor can read products.');

  const orders = await request(null, 'GET', '/items/orders');
  assert(!orders.ok, 'Visitor cannot read orders.');

  const rules = await request(null, 'GET', '/items/rfq_assignment_rules');
  assert(!rules.ok, 'Visitor cannot read RFQ assignment rules.');

  const createRfq = await request(null, 'POST', '/items/rfq_requests', {
    company: 'Visitor Company',
    contact_name: 'Visitor Temp',
    email: 'visitor-temp@example.com',
    phone: '0911111112',
    message: `RBAC-VISITOR-RFQ-${Date.now()}`,
    source: 'web'
  });
  assert(!createRfq.ok, 'Visitor cannot create RFQ records directly in Directus.');
}

async function verifyEditor(editorToken) {
  const slug = `rbac-editor-${Date.now()}`;
  const createBlog = await request(editorToken, 'POST', '/items/blog_posts', {
    title: 'RBAC Editor Draft',
    slug,
    body: '<p>RBAC editor create test</p>',
    status: 'draft'
  });
  const createdOk = assert(createBlog.ok, 'Editor can create content.');

  const createdId = createBlog.json?.data?.id;
  assert(Boolean(createdId), 'Editor create returns item id.');

  const patchSiteSettings = await request(editorToken, 'PATCH', '/items/site_settings', {
    contact_phone: '+84 24 1234 5678'
  });
  assert(patchSiteSettings.ok, 'Editor can update site_settings singleton.');

  const readOrders = await request(editorToken, 'GET', '/items/orders');
  assert(!readOrders.ok, 'Editor cannot read orders.');

  const readCustomers = await request(editorToken, 'GET', '/items/customers');
  assert(!readCustomers.ok, 'Editor cannot read customers.');

  if (createdOk && createdId) {
    const cleanupBlog = await request(editorToken, 'DELETE', `/items/blog_posts/${createdId}`);
    assert(cleanupBlog.ok, 'Editor can delete content created for test.');
  }
}

async function verifySales(salesToken, fixtures) {
  const customers = await request(salesToken, 'GET', '/items/customers?limit=100');
  assert(customers.ok, 'Sales can read customers.');
  const customerEmails = getRows(customers).map((row) => row.email);
  assert(customerEmails.includes(fixtures.customerA.email), 'Sales sees customer A.');
  assert(customerEmails.includes(fixtures.customerB.email), 'Sales sees customer B.');

  const orderCode = `RBAC-SALES-ORD-${Date.now()}`;
  const createOrder = await request(salesToken, 'POST', '/items/orders', {
    code: orderCode,
    customer: fixtures.customerA.id,
    order_date: '2026-06-08',
    status: 'pending',
    hub: fixtures.orderA.hub,
    subtotal: 500000,
    tax: 50000,
    total: 550000,
    notes: 'RBAC sales create test'
  });
  const createOrderOk = assert(createOrder.ok, 'Sales can create orders.');

  const createdOrderId = createOrder.json?.data?.id;
  assert(Boolean(createdOrderId), 'Sales order create returns item id.');

  const updateInvoice = await request(salesToken, 'PATCH', `/items/invoices/${fixtures.invoiceA.id}`, {
    paid_status: 'partial'
  });
  assert(updateInvoice.ok, 'Sales can update invoices.');

  const rfqMessage = `RBAC-SALES-RFQ-${Date.now()}`;
  const createRfq = await request(salesToken, 'POST', '/items/rfq_requests', {
    company: 'RBAC Sales Company',
    contact_name: 'Sales Temp',
    email: 'sales-temp@example.com',
    phone: '0911111111',
    industry: 'electronics',
    hub: fixtures.orderA.hub,
    line_items: [{ sku: 'RBAC-SALES', qty: 1 }],
    message: rfqMessage,
    status: 'pending',
    source: 'web'
  });
  const createRfqOk = assert(createRfq.ok, 'Sales can create RFQ records.');

  const createdRfqId = createRfq.json?.data?.id;
  assert(Boolean(createdRfqId), 'Sales RFQ create returns item id.');

  const createRule = await request(salesToken, 'POST', '/items/rfq_assignment_rules', {
    hub: fixtures.orderA.hub,
    industry: fixtures.electronicsIndustry.id,
    assigned_sales: fixtures.salesUser.id,
    priority: 5,
    is_default: false
  });
  const createRuleOk = assert(createRule.ok, 'Sales can create RFQ assignment rules.');

  const createdRuleId = createRule.json?.data?.id;
  assert(Boolean(createdRuleId), 'Sales RFQ assignment rule create returns item id.');

  const patchRule = await request(salesToken, 'PATCH', `/items/rfq_assignment_rules/${createdRuleId}`, {
    priority: 6
  });
  assert(patchRule.ok, 'Sales can update RFQ assignment rules.');

  const readRules = await request(salesToken, 'GET', '/items/rfq_assignment_rules?limit=100');
  assert(readRules.ok, 'Sales can read RFQ assignment rules.');

  if (createRuleOk && createdRuleId) {
    const deleteRule = await request(salesToken, 'DELETE', `/items/rfq_assignment_rules/${createdRuleId}`);
    assert(deleteRule.ok, 'Sales can delete RFQ assignment rules.');
  }

  if (createRfqOk && createdRfqId) {
    const deleteRfq = await request(salesToken, 'DELETE', `/items/rfq_requests/${createdRfqId}`);
    assert(deleteRfq.ok, 'Sales can delete RFQ records.');
  }

  const patchBanner = await request(salesToken, 'PATCH', '/items/hero_banners/1', {
    title: 'RBAC sales denied mutation test'
  });
  assert(!patchBanner.ok, 'Sales cannot update hero_banners.');

  if (createOrderOk && createdOrderId) {
    const cleanupOrder = await request(salesToken, 'DELETE', `/items/orders/${createdOrderId}`);
    assert(cleanupOrder.ok, 'Sales can delete order created for test.');
  }
}

async function verifyCustomer(customerToken, own, foreign) {
  const customers = await request(customerToken, 'GET', '/items/customers?limit=100');
  assert(customers.ok, `Customer ${own.email} can read customers list.`);
  const customerEmails = getRows(customers).map((row) => row.email);
  assert(customerEmails.includes(own.email), `Customer ${own.email} sees own customer record.`);
  assert(!customerEmails.includes(foreign.email), `Customer ${own.email} does not see foreign customer record.`);

  const ownCustomerRead = await request(customerToken, 'GET', `/items/customers/${own.customerId}`);
  assert(ownCustomerRead.ok, `Customer ${own.email} can read own customer record directly.`);

  const foreignCustomerRead = await request(customerToken, 'GET', `/items/customers/${foreign.customerId}`);
  assert(!foreignCustomerRead.ok, `Customer ${own.email} cannot read foreign customer record directly.`);

  const updateOwnCustomer = await request(customerToken, 'PATCH', `/items/customers/${own.customerId}`, {
    phone: own.phone
  });
  assert(updateOwnCustomer.ok, `Customer ${own.email} can update own customer record.`);

  const orders = await request(customerToken, 'GET', '/items/orders?limit=100');
  assert(orders.ok, `Customer ${own.email} can read orders list.`);
  const orderCodes = getRows(orders).map((row) => row.code);
  assert(orderCodes.includes(own.orderCode), `Customer ${own.email} sees own order.`);
  assert(!orderCodes.includes(foreign.orderCode), `Customer ${own.email} does not see foreign order.`);

  const rules = await request(customerToken, 'GET', '/items/rfq_assignment_rules');
  assert(!rules.ok, `Customer ${own.email} cannot read RFQ assignment rules.`);

  const ownOrderRead = await request(customerToken, 'GET', `/items/orders/${own.orderId}`);
  assert(ownOrderRead.ok, `Customer ${own.email} can read own order directly.`);

  const foreignOrderRead = await request(customerToken, 'GET', `/items/orders/${foreign.orderId}`);
  assert(!foreignOrderRead.ok, `Customer ${own.email} cannot read foreign order directly.`);

  const orderItems = await request(customerToken, 'GET', '/items/order_items?limit=100');
  assert(orderItems.ok, `Customer ${own.email} can read order items.`);
  const itemDescriptions = getRows(orderItems).map((row) => row.description);
  assert(itemDescriptions.includes(own.itemDescription), `Customer ${own.email} sees own order item.`);
  assert(!itemDescriptions.includes(foreign.itemDescription), `Customer ${own.email} does not see foreign order item.`);

  const invoices = await request(customerToken, 'GET', '/items/invoices?limit=100');
  assert(invoices.ok, `Customer ${own.email} can read invoices.`);
  const invoiceCodes = getRows(invoices).map((row) => row.code);
  assert(invoiceCodes.includes(own.invoiceCode), `Customer ${own.email} sees own invoice.`);
  assert(!invoiceCodes.includes(foreign.invoiceCode), `Customer ${own.email} does not see foreign invoice.`);

  const deliveries = await request(customerToken, 'GET', '/items/deliveries?limit=100');
  assert(deliveries.ok, `Customer ${own.email} can read deliveries.`);
  const deliveryRefs = getRows(deliveries).map((row) => row.erp_ref);
  assert(deliveryRefs.includes(own.deliveryRef), `Customer ${own.email} sees own delivery.`);
  assert(!deliveryRefs.includes(foreign.deliveryRef), `Customer ${own.email} does not see foreign delivery.`);

  const rfqs = await request(customerToken, 'GET', '/items/rfq_requests?limit=100');
  assert(rfqs.ok, `Customer ${own.email} can read RFQ list.`);
  const rfqMessages = getRows(rfqs).map((row) => row.message);
  assert(rfqMessages.includes(own.rfqMessage), `Customer ${own.email} sees own RFQ.`);
  assert(!rfqMessages.includes(foreign.rfqMessage), `Customer ${own.email} does not see foreign RFQ.`);

  const createRfq = await request(customerToken, 'POST', '/items/rfq_requests', {
    company: own.companyName,
    contact_name: own.contactName,
    email: own.email,
    phone: own.phone,
    industry: 'electronics',
    hub: own.hubId,
    line_items: [{ sku: own.rfqSkuCode, qty: 1 }],
    message: `RBAC-CUSTOMER-RFQ-${own.label}-${Date.now()}`,
    status: 'pending',
    source: 'portal',
    user: own.userId
  });
  assert(!createRfq.ok, `Customer ${own.email} cannot create RFQ directly in Directus.`);

  const createOrder = await request(customerToken, 'POST', '/items/orders', {
    code: `RBAC-FORBIDDEN-${own.label}-${Date.now()}`,
    customer: own.customerId,
    order_date: '2026-06-08',
    status: 'pending',
    hub: own.hubId,
    subtotal: 1000,
    tax: 100,
    total: 1100
  });
  assert(!createOrder.ok, `Customer ${own.email} cannot create orders.`);

  const updateInvoice = await request(customerToken, 'PATCH', `/items/invoices/${own.invoiceId}`, {
    paid_status: 'paid'
  });
  assert(!updateInvoice.ok, `Customer ${own.email} cannot update invoices.`);

  const deleteDelivery = await request(customerToken, 'DELETE', `/items/deliveries/${own.deliveryId}`);
  assert(!deleteDelivery.ok, `Customer ${own.email} cannot delete deliveries.`);
}

async function main() {
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const fixtures = await getFixtures(adminToken);

  const editorToken = await login('editor-rbac@example.com', 'EditorPassword123!');
  const salesToken = await login('sales-rbac@example.com', 'SalesPassword123!');
  const customerAToken = await login('customer-a-rbac@example.com', 'CustomerAPassword123!');
  const customerBToken = await login('customer-b-rbac@example.com', 'CustomerBPassword123!');

  await verifyAdmin(adminToken, fixtures);
  await verifyVisitor(fixtures);
  await verifyEditor(editorToken);
  await verifySales(salesToken, fixtures);
  await verifyCustomer(
    customerAToken,
    {
      label: 'A',
      email: fixtures.customerA.email,
      customerId: fixtures.customerA.id,
      userId: fixtures.customerA.user,
      companyName: fixtures.customerA.company_name,
      contactName: fixtures.customerA.contact_name,
      phone: fixtures.customerA.phone,
      orderCode: fixtures.orderA.code,
      orderId: fixtures.orderA.id,
      itemDescription: fixtures.itemA.description,
      invoiceCode: fixtures.invoiceA.code,
      invoiceId: fixtures.invoiceA.id,
      deliveryRef: fixtures.deliveryA.erp_ref,
      deliveryId: fixtures.deliveryA.id,
      rfqMessage: fixtures.rfqA.message,
      rfqSkuCode: 'RBAC-SKU-A',
      hubId: fixtures.orderA.hub
    },
    {
      email: fixtures.customerB.email,
      customerId: fixtures.customerB.id,
      orderCode: fixtures.orderB.code,
      orderId: fixtures.orderB.id,
      itemDescription: fixtures.itemB.description,
      invoiceCode: fixtures.invoiceB.code,
      deliveryRef: fixtures.deliveryB.erp_ref,
      deliveryId: fixtures.deliveryB.id,
      rfqMessage: fixtures.rfqB.message
    }
  );

  await verifyCustomer(
    customerBToken,
    {
      label: 'B',
      email: fixtures.customerB.email,
      customerId: fixtures.customerB.id,
      userId: fixtures.customerB.user,
      companyName: fixtures.customerB.company_name,
      contactName: fixtures.customerB.contact_name,
      phone: fixtures.customerB.phone,
      orderCode: fixtures.orderB.code,
      orderId: fixtures.orderB.id,
      itemDescription: fixtures.itemB.description,
      invoiceCode: fixtures.invoiceB.code,
      invoiceId: fixtures.invoiceB.id,
      deliveryRef: fixtures.deliveryB.erp_ref,
      deliveryId: fixtures.deliveryB.id,
      rfqMessage: fixtures.rfqB.message,
      rfqSkuCode: 'RBAC-SKU-B',
      hubId: fixtures.orderB.hub
    },
    {
      email: fixtures.customerA.email,
      customerId: fixtures.customerA.id,
      orderCode: fixtures.orderA.code,
      orderId: fixtures.orderA.id,
      itemDescription: fixtures.itemA.description,
      invoiceCode: fixtures.invoiceA.code,
      deliveryRef: fixtures.deliveryA.erp_ref,
      deliveryId: fixtures.deliveryA.id,
      rfqMessage: fixtures.rfqA.message
    }
  );

  if (failures.length > 0) {
    logFatal(`RBAC verification failed with ${failures.length} failure(s).`);
    process.exit(1);
  }

  logDone('RBAC verification passed.');
  process.exit(0);
}

main().catch((err) => {
  logFatal('RBAC verification crashed.', err);
  process.exit(1);
});
