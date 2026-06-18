import IORedis from 'ioredis';
import { CUSTOMER_ROLE_ID, VERIFIED_TOKEN_PREFIX } from '../../../lib/constants.mjs';
import { sendMail } from '../../../lib/smtp.mjs';
import { renderWelcomeEmail } from '../../../lib/email-templates/welcome.mjs';

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || 'redis://localhost:6379';

let redisClient = null;
function getRedis() {
  if (!redisClient) {
    redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false
    });
    redisClient.on('error', (err) => {
      console.error('[customer-onboarding] Redis error:', err.message);
    });
  }
  return redisClient;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

function validateEmail(value) {
  const email = normalizeEmail(value);
  if (!email) {
    const error = new Error('email is required.');
    error.status = 422;
    throw error;
  }
  if (!EMAIL_REGEX.test(email)) {
    const error = new Error('Invalid email format.');
    error.status = 422;
    throw error;
  }
  return email;
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
  // Resolve the database (knex) instance. The endpoint context exposes it
  // under different names depending on Directus version — try all of them.
  const database =
    context.database
    ?? context.knex
    ?? context.getDatabase?.()
    ?? null;
  return {
    schema,
    database,
    usersService: new UsersService({ schema, knex: database, accountability: null }),
    customersService: new ItemsService('customers', { schema, knex: database, accountability: null })
  };
}

function buildWelcomeMail({ contactName, email, companyName }) {
  const portalUrl = process.env.FRONTEND_PUBLIC_URL ?? 'http://localhost:3000';
  const html = renderWelcomeEmail({
    contactName,
    email,
    companyName,
    portalUrl
  });
  return {
    from: process.env.MAIL_FROM ?? 'ULINK <no-reply@ulink.com>',
    to: email,
    subject: '[ULINK] Chào mừng đến với ULINK INDUSTRIES',
    text:
      `Chào ${contactName},\n\n` +
      `Tài khoản ULINK của bạn (${email})${companyName ? ` cho ${companyName}` : ''} đã được tạo và kích hoạt thành công.\n\n` +
      `Đăng nhập: ${portalUrl}/login\n\n` +
      `Trân trọng,\nĐội ngũ ULINK INDUSTRIES.`,
    html
  };
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function validatePassword(value) {
  const password = String(value ?? '').trim();
  if (!password) {
    const error = new Error('password is required.');
    error.status = 422;
    throw error;
  }
  if (!PASSWORD_REGEX.test(password)) {
    const error = new Error('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.');
    error.status = 422;
    throw error;
  }
  return password;
}

export async function createCustomerAccount(context, input) {
  const companyName = requireField(input.company_name, 'company_name');
  const contactName = requireField(input.contact_name, 'contact_name');
  const email = validateEmail(input.email);
  const phone = requireField(input.phone, 'phone');
  const password = validatePassword(input.password);
  const confirmPassword = requireField(input.confirm_password, 'confirm_password');

  if (password !== confirmPassword) {
    const error = new Error('Passwords do not match.');
    error.status = 422;
    throw error;
  }

  // Consent is mandatory. The frontend sends { agree: true, agree_at: <iso> };
  // we accept the user's timestamp as the canonical consented_at value (the
  // frontend captured it at submit time). Storing it on the customer row
  // creates an auditable consent record.
  if (input.agree !== true) {
    const error = new Error('You must accept the terms of service to register.');
    error.status = 422;
    error.code = 'agree_required';
    throw error;
  }
  const agreeAt = normalizeString(input.agree_at);
  if (!agreeAt) {
    const error = new Error('Consent timestamp is missing.');
    error.status = 422;
    error.code = 'agree_required';
    throw error;
  }
  // Defensive: reject obviously bogus timestamps so the audit trail stays
  // honest (e.g. if a future client sends a string we cannot parse).
  const agreedAtDate = new Date(agreeAt);
  if (Number.isNaN(agreedAtDate.getTime())) {
    const error = new Error('Consent timestamp is invalid.');
    error.status = 422;
    error.code = 'agree_required';
    throw error;
  }

  // Require OTP verification for the same email before creating an account.
  // The frontend calls /otp/verify?purpose=register to obtain verified_token,
  // then forwards it here. We atomically consume the token so it can't be
  // replayed to register multiple accounts.
  const verifiedToken = String(input.verified_token ?? '');
  if (!verifiedToken.startsWith(VERIFIED_TOKEN_PREFIX)) {
    const error = new Error('Email verification is required to register.');
    error.status = 401;
    error.code = 'email_unverified';
    throw error;
  }

  const redis = getRedis();
  const verifiedKey = `ulink:otp:verified:register:${email}`;
  const storedToken = await redis.get(verifiedKey);
  if (!storedToken || storedToken !== verifiedToken) {
    const error = new Error('Email verification has expired. Please verify your email and try again.');
    error.status = 401;
    error.code = 'invalid_or_expired_verification';
    throw error;
  }
  await redis.del(verifiedKey).catch(() => {});

  const { usersService, customersService, database } = await getServiceClasses(context);

  // Existence checks via knex directly. ItemsService.readByQuery goes through
  // getAllowedSort → getAstFromQuery which requires the collection's primary
  // key to be present in the schema, and the per-request schema context can
  // resolve without the primary when called from a custom endpoint. A direct
  // SELECT against the underlying table avoids that whole class of failure
  // and is still safe because customers.email / directus_users.email are
  // unique by collection design.
  if (!database) {
    throw new Error('Directus database is unavailable.');
  }
  const existingCustomers = await database('customers').where({ email }).limit(1);
  if (existingCustomers.length > 0) {
    const error = new Error(`Customer account already exists for ${email}.`);
    error.status = 409;
    throw error;
  }
  const existingUsers = await database('directus_users').where({ email }).limit(1);
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
      phone,
      consented_at: agreedAtDate
    });

    customerId = createdCustomer?.id ?? createdCustomer;

    await sendMail(buildWelcomeMail({ contactName, email, companyName }));

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
