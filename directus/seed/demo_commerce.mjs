import { CUSTOMER_ROLE_ID } from '../constants.mjs';

export async function seedDemoCommerce(helpers, ids) {
  const customerUserId = await helpers.ensureUser({
    email: 'customer@ulink.com',
    password: 'customer-password-123',
    role: CUSTOMER_ROLE_ID,
    first_name: 'Minh',
    last_name: 'Nguyá»…n B2B',
    status: 'active'
  });

  const customerId = await helpers.ensureItem('customers', 'email', {
    user: customerUserId,
    company_name: 'CÃ´ng ty Samsung Electronics Viá»‡t Nam',
    tax_code: '0102030405-001',
    contact_name: 'Nguyá»…n VÄƒn A',
    email: 'customer@ulink.com',
    phone: '0987654321',
    address: 'LÃ´ CN1-1, KCN YÃªn Phong, YÃªn Trung, YÃªn Phong, Báº¯c Ninh',
    status: 'active'
  });

  const orderId = await helpers.ensureItem('orders', 'code', {
    code: 'ORD-2026-0001',
    customer: customerId,
    order_date: '2026-06-01',
    status: 'completed',
    hub: ids.hubId,
    subtotal: 15000000.0,
    tax: 1500000.0,
    total: 16500000.0,
    notes: 'Giao trá»±c tiáº¿p kho kiá»ƒm pháº©m bá»™ pháº­n QC.',
    erp_ref: 'ERP-ORD-2026-99901'
  });

  await helpers.ensureItem('order_items', 'description', {
    order: orderId,
    sku: ids.sku1Id,
    description: 'GÄƒng tay phÃ²ng sáº¡ch Nitrile size S (100 pcs/box)',
    qty: 50,
    unit_price: 200000.0,
    line_total: 10000000.0
  });

  await helpers.ensureItem('order_items', 'description', {
    order: orderId,
    sku: ids.sku2Id,
    description: 'GÄƒng tay phÃ²ng sáº¡ch Nitrile size M (100 pcs/box)',
    qty: 25,
    unit_price: 200000.0,
    line_total: 5000000.0
  });

  await helpers.ensureItem('invoices', 'code', {
    code: 'INV-2026-0001',
    customer: customerId,
    order: orderId,
    issue_date: '2026-06-01',
    due_date: '2026-07-01',
    amount: 16500000.0,
    paid_amount: 10000000.0,
    balance: 6500000.0,
    paid_status: 'partial',
    erp_ref: 'ERP-INV-2026-88001'
  });

  await helpers.ensureItem('deliveries', 'erp_ref', {
    order: orderId,
    hub: ids.hubId,
    scheduled_date: '2026-06-02',
    delivered_date: '2026-06-02',
    status: 'delivered',
    tracking_ref: 'TRK-ULINK-20260602',
    erp_ref: 'ERP-DLV-2026-77001'
  });
}
