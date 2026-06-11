import { normalizeEmail } from '../../customer-onboarding-endpoint/src/service.js';

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

export async function linkCustomerAccount(context, meta) {
  let userId = meta?.key ?? meta?.id ?? meta?.payload?.id ?? null;
  if (Array.isArray(userId)) {
    userId = userId[0] ?? null;
  }
  if (!userId) {
    console.log('[customer-onboarding-hook] No user ID found in event metadata.');
    return { linked: false };
  }

  const { usersService, customersService } = await getServiceClasses(context);
  const user = await usersService.readOne(userId, {
    fields: ['id', 'email']
  });
  if (!user) {
    console.warn(`[customer-onboarding-hook] User record not found for ID: ${userId}`);
    return { linked: false };
  }
  const email = normalizeEmail(user?.email);
  if (!email) {
    console.log(`[customer-onboarding-hook] User ${userId} has no email address. Skipping link.`);
    return { linked: false };
  }

  const matches = await customersService.readByQuery({
    filter: { email: { _eq: email } },
    limit: 2,
    fields: ['id', 'user', 'status', 'email']
  });

  console.log(`[customer-onboarding-hook] Found ${matches.length} customer records for email: ${email}`);
  if (matches.length === 0) {
    return { linked: false };
  }

  if (matches.length > 1) {
    throw new Error(`Multiple customer rows found for ${email}.`);
  }

  const customer = matches[0];
  const linkedUserId = typeof customer.user === 'object' ? customer.user?.id ?? null : customer.user ?? null;

  if (linkedUserId && linkedUserId !== userId) {
    throw new Error(`Customer ${email} is already linked to another user: ${linkedUserId}.`);
  }

  if (linkedUserId === userId) {
    console.log(`[customer-onboarding-hook] Customer ${customer.id} is already linked to user ${userId}.`);
    return { linked: true, customerId: customer.id };
  }

  console.log(`[customer-onboarding-hook] Linking customer ${customer.id} to user ${userId} and setting status to active.`);
  await customersService.updateOne(customer.id, {
    user: userId,
    status: 'active'
  });

  console.log(`[customer-onboarding-hook] Successfully linked customer ${customer.id} to user ${userId}.`);
  return { linked: true, customerId: customer.id };
}
