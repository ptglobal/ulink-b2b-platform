import { linkCustomerAccount } from './service.js';

async function handleUserCreate(meta, context) {
  const collection = meta?.collection ?? 'directus_users';
  if (collection !== 'directus_users' && collection !== 'users') {
    return;
  }

  console.log(`[customer-onboarding-hook] User creation event detected on collection "${collection}":`, JSON.stringify(meta));
  await linkCustomerAccount(context, meta);
}

export default ({ action }, extensionContext) => {
  action('items.create', async (meta, context) => {
    const fullContext = {
      ...context,
      services: extensionContext.services,
      getSchema: extensionContext.getSchema
    };

    await handleUserCreate(meta, fullContext);
  });

  action('users.create', async (meta, context) => {
    const fullContext = {
      ...context,
      services: extensionContext.services,
      getSchema: extensionContext.getSchema
    };

    await handleUserCreate(meta, fullContext);
  });
};
