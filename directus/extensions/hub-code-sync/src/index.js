import { syncHubCode } from './service.js';

export default ({ action }, extensionContext) => {
  action('items.create', async (meta, context) => {
    if ((meta?.collection ?? null) !== 'regional_hubs') {
      return;
    }

    const fullContext = {
      ...context,
      services: extensionContext.services,
      getSchema: extensionContext.getSchema
    };

    await syncHubCode(fullContext, meta);
  });

  action('items.update', async (meta, context) => {
    if ((meta?.collection ?? null) !== 'regional_hubs') {
      return;
    }

    const fullContext = {
      ...context,
      services: extensionContext.services,
      getSchema: extensionContext.getSchema
    };

    await syncHubCode(fullContext, meta);
  });
};
