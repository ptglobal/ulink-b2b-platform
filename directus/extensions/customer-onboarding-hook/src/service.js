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
  const userId = meta?.key ?? meta?.id ?? meta?.payload?.id ?? null;
  if (!userId) {
    return { linked: false };
  }

  const { usersService, customersService } = await getServiceClasses(context);
  const user = await usersService.readOne(userId, {
    fields: ['id', 'email']
  });
  const email = normalizeEmail(user?.email);
  if (!email) {
    return { linked: false };
  }

  const matches = await customersService.readByQuery({
    filter: { email: { _eq: email } },
    limit: 2,
    fields: ['id', 'user', 'status', 'email']
  });

  if (matches.length === 0) {
    return { linked: false };
  }

  if (matches.length > 1) {
    throw new Error(`Multiple customer rows found for ${email}.`);
  }

  const customer = matches[0];
  const linkedUserId = typeof customer.user === 'object' ? customer.user?.id ?? null : customer.user ?? null;

  if (linkedUserId && linkedUserId !== userId) {
    throw new Error(`Customer ${email} is already linked to another user.`);
  }

  if (linkedUserId === userId && customer.status === 'active') {
    return { linked: true, customerId: customer.id };
  }

  await customersService.updateOne(customer.id, {
    user: userId,
    status: 'active'
  });

  return { linked: true, customerId: customer.id };
}
