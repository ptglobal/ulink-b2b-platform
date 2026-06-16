import { CUSTOMER_ROLE_ID } from '../../../constants.mjs';
import { sendMail } from '../../../lib/smtp.mjs';

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeString(value) {
  return String(value ?? '').trim();
}

function requireField(value, fieldName) {
  const normalized = normalizeString(value);
  if (!normalized) {
    const error = new Error(`${fieldName} is required.`);
    error.status = 422;
    throw error;
  }
  return normalized;
}

async function getServiceClasses(context) {
  const { ItemsService, UsersService } = context.services ?? {};
  if (!ItemsService || !UsersService) {
    throw new Error('Directus service classes are unavailable.');
  }

  const schema = context.schema ?? (await context.getSchema?.()) ?? null;
  return {
    schema,
    usersService: new UsersService({ schema, accountability: null }),
    customersService: new ItemsService('customers', { schema, accountability: null })
  };
}

function buildWelcomeMail({ contactName, email }) {
  const portalUrl = process.env.FRONTEND_PUBLIC_URL ?? 'http://localhost:3000';
  return {
    from: process.env.MAIL_FROM ?? 'ULINK <no-reply@ulink.com>',
    to: email,
    subject: '[ULINK] Tài khoản đã được tạo',
    text:
      `Chào ${contactName}, tài khoản ULINK của bạn đã được tạo và kích hoạt thành công.\n\n` +
      `Đăng nhập: ${portalUrl}/login`
  };
}

export async function createCustomerAccount(context, input) {
  const companyName = requireField(input.company_name, 'company_name');
  const contactName = requireField(input.contact_name, 'contact_name');
  const email = requireField(input.email, 'email').toLowerCase();
  const phone = requireField(input.phone, 'phone');
  const password = requireField(input.password, 'password');
  const confirmPassword = requireField(input.confirm_password, 'confirm_password');

  if (password !== confirmPassword) {
    const error = new Error('Passwords do not match.');
    error.status = 422;
    throw error;
  }

  const { usersService, customersService } = await getServiceClasses(context);

  const existingCustomers = await customersService.readByQuery({
    filter: { email: { _eq: email } },
    limit: 2,
    fields: ['id', 'user', 'status', 'email']
  });
  if (existingCustomers.length > 0) {
    const error = new Error(`Customer account already exists for ${email}.`);
    error.status = 409;
    throw error;
  }

  const existingUsers = await usersService.readByQuery({
    filter: { email: { _eq: email } },
    limit: 2,
    fields: ['id', 'email']
  });
  if (existingUsers.length > 0) {
    const error = new Error(`User account already exists for ${email}.`);
    error.status = 409;
    throw error;
  }

  const createdUser = await usersService.createOne({
    email,
    password,
    role: CUSTOMER_ROLE_ID,
    status: 'active',
    first_name: contactName
  });

  const userId = createdUser?.id ?? createdUser;
  let customerId = null;

  try {
    const createdCustomer = await customersService.createOne({
      status: 'active',
      user: userId,
      company_name: companyName,
      contact_name: contactName,
      email,
      phone
    });

    customerId = createdCustomer?.id ?? createdCustomer;

    await sendMail(buildWelcomeMail({ contactName, email }));

    return {
      user_id: userId,
      customer_id: customerId,
      status: 'active'
    };
  } catch (error) {
    if (customerId) {
      await customersService.deleteOne(customerId).catch(() => {});
    }
    await usersService.deleteOne(userId).catch(() => {});
    throw error;
  }
}

export { normalizeEmail };
