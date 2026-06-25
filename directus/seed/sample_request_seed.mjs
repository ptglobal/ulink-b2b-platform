import {
  readUsers,
  createUser,
  updateUser,
  readItems,
  createItem,
  updateItem
} from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from '../lib/config.mjs';
import { SALES_ROLE_ID, CUSTOMER_ROLE_ID } from '../lib/constants.mjs';
import { logInfo, logPass, logDone, logFatal } from '../lib/logging.mjs';

const client = createDirectusClient();

async function upsertUserByEmail(email, data) {
  const existing = await client.request(readUsers({ filter: { email: { _eq: email } }, fields: ['id', 'email'] }));
  if (existing.length > 0) {
    const updated = await client.request(updateUser(existing[0].id, { ...data, email }));
    logPass(`User updated: ${email}`);
    return updated.id;
  }
  const created = await client.request(createUser({ ...data, email }));
  logPass(`User created: ${email}`);
  return created.id;
}

async function upsertSampleRequest(data) {
  // Use contact_name + product_slug as unique key
  const existing = await client.request(
    readItems('sample_requests', {
      filter: {
        _and: [
          { contact_name: { _eq: data.contact_name } },
          { product_slug: { _eq: data.product_slug } }
        ]
      },
      limit: 1
    })
  );

  if (existing.length > 0) {
    const updated = await client.request(updateItem('sample_requests', existing[0].id, data));
    logPass(`sample_requests updated: ${data.contact_name} - ${data.product_slug}`);
    return updated;
  }

  const created = await client.request(createItem('sample_requests', data));
  logPass(`sample_requests created: ${data.contact_name} - ${data.product_slug}`);
  return created;
}

async function main() {
  await loginAdmin(client);
  logInfo(`Authenticated as ${DIRECTUS_ADMIN_EMAIL} at ${DIRECTUS_URL}`);

  // --- Ensure sale account exists ---
  const salesUserId = await upsertUserByEmail('sales@ulink.vn', {
    password: 'Sales@123456',
    role: SALES_ROLE_ID,
    first_name: 'Nguyen',
    last_name: 'Sales',
    status: 'active'
  });
  logInfo(`Sale account: sales@ulink.vn / Sales@123456 (role: sales)`);

  // --- Ensure customer accounts exist ---
  const customerAId = await upsertUserByEmail('customer-sample-a@example.com', {
    password: 'Customer@123',
    role: CUSTOMER_ROLE_ID,
    first_name: 'Tran',
    last_name: 'Minh',
    status: 'active'
  });

  const customerBId = await upsertUserByEmail('customer-sample-b@example.com', {
    password: 'Customer@123',
    role: CUSTOMER_ROLE_ID,
    first_name: 'Le',
    last_name: 'Hoa',
    status: 'active'
  });

  const customerCId = await upsertUserByEmail('customer-sample-c@example.com', {
    password: 'Customer@123',
    role: CUSTOMER_ROLE_ID,
    first_name: 'Pham',
    last_name: 'Duc',
    status: 'active'
  });

  // --- Seed sample requests ---

  // 1. Pending requests (sale can approve these)
  await upsertSampleRequest({
    contact_name: 'Trần Văn Minh',
    email: 'minh.tran@techcorp.vn',
    company: 'TechCorp Vietnam',
    phone: '0901234567',
    province: 'Hồ Chí Minh',
    district: 'Quận 7',
    address_detail: '123 Nguyễn Thị Thập, Phường Tân Phú',
    product_slug: 'esd-gloves',
    skus: ['ESD-GLV-S', 'ESD-GLV-M'],
    message: 'Chúng tôi cần mẫu thử để kiểm tra độ bền tĩnh điện cho dây chuyền lắp ráp.',
    status: 'pending',
    user: customerAId
  });

  await upsertSampleRequest({
    contact_name: 'Lê Thị Hoa',
    email: 'hoa.le@pharmaplus.vn',
    company: 'PharmaPlus JSC',
    phone: '0912345678',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    address_detail: '45 Duy Tân, Phường Dịch Vọng Hậu',
    product_slug: 'cleanroom-wipes',
    skus: ['CR-WIPE-9x9', 'CR-WIPE-12x12'],
    message: 'Cần mẫu khăn lau phòng sạch ISO Class 5 để đánh giá cho phòng sản xuất dược phẩm.',
    status: 'pending',
    user: customerBId
  });

  await upsertSampleRequest({
    contact_name: 'Phạm Đức Anh',
    email: 'duc.pham@samsungvn.com',
    company: 'Samsung Vietnam',
    phone: '0923456789',
    province: 'Bắc Ninh',
    district: 'Yên Phong',
    address_detail: 'KCN Yên Phong 2, Lô A5',
    product_slug: 'esd-bags',
    skus: ['ESD-BAG-A4', 'ESD-BAG-A3'],
    message: 'Yêu cầu mẫu túi chống tĩnh điện cho linh kiện bán dẫn. Số lượng dự kiến đặt: 50,000 pcs/tháng.',
    status: 'pending',
    user: customerCId
  });

  // 2. Visitor request (no user linked)
  await upsertSampleRequest({
    contact_name: 'Nguyễn Thanh Tùng',
    email: 'tung.nguyen@newstartup.io',
    company: 'New Startup IO',
    phone: '0934567890',
    province: 'Đà Nẵng',
    district: 'Hải Châu',
    address_detail: '78 Trần Phú, Phường Hải Châu 1',
    product_slug: 'anti-static-mat',
    skus: ['ASM-600x900'],
    message: 'Startup mới, cần mẫu thử thảm chống tĩnh điện cho phòng lab.',
    status: 'pending',
    user: null
  });

  // 3. Already approved (for reference)
  await upsertSampleRequest({
    contact_name: 'Võ Minh Tuấn',
    email: 'tuan.vo@foxconn.vn',
    company: 'Foxconn Vietnam',
    phone: '0945678901',
    province: 'Bắc Giang',
    district: 'Việt Yên',
    address_detail: 'KCN Đình Trám, Lô B2',
    product_slug: 'esd-shoes',
    skus: ['ESD-SHOE-40', 'ESD-SHOE-42'],
    message: 'Đã test mẫu trước đó, cần thêm size khác để đánh giá.',
    status: 'approved',
    approval_note: 'Khách hàng lớn, ưu tiên giao mẫu trong 24h.',
    user: null
  });

  // 4. Rejected (for reference)
  await upsertSampleRequest({
    contact_name: 'Đỗ Văn Hùng',
    email: 'hung.do@random.com',
    company: 'Random Company',
    phone: '0956789012',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    address_detail: '99 Nguyễn Huệ',
    product_slug: 'cleanroom-garments',
    skus: ['CR-GARM-L'],
    message: 'Cần 1 bộ để mặc thử.',
    status: 'rejected',
    reject_reason: 'Không đủ thông tin doanh nghiệp. Không xác minh được nhu cầu thực tế.',
    user: null
  });

  logDone('Sample request seed complete.');
  logInfo('');
  logInfo('=== TEST ACCOUNTS ===');
  logInfo('Sale account (can approve/reject):');
  logInfo('  Email: sales@ulink.vn');
  logInfo('  Password: Sales@123456');
  logInfo('');
  logInfo('Customer accounts:');
  logInfo('  customer-sample-a@example.com / Customer@123');
  logInfo('  customer-sample-b@example.com / Customer@123');
  logInfo('  customer-sample-c@example.com / Customer@123');
  logInfo('');
  logInfo('4 pending requests ready for sale to approve/reject.');

  process.exit(0);
}

main().catch((err) => {
  logFatal('Sample request seed failed.', err);
  process.exit(1);
});
