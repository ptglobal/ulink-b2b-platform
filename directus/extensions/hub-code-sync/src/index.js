import { generateHubCodeForCreate, syncHubCode } from './service.js';

export default ({ filter, action }, extensionContext) => {
  // CREATE: filter hook → inject hub_code BEFORE insert (never null).
  // If validation fails (missing province, etc.) the error propagates and blocks the create.
  filter('items.create', async (payload, meta, context) => {
    if (meta?.collection !== 'regional_hubs') return payload;
    console.log('[hub-code-sync] items.create filter payload:', JSON.stringify(payload));

    const fullContext = {
      ...context,
      services: extensionContext.services,
      getSchema: extensionContext.getSchema
    };

    const hubCode = await generateHubCodeForCreate(fullContext, payload);
    payload.hub_code = hubCode;
    console.log('[hub-code-sync] items.create assigned hub_code:', hubCode);
    return payload;
  });

  // UPDATE: action hook → re-sync hub_code when province changes.
  // Uses action (post-save) because the existing hub_code is already non-null,
  // so a hook failure won't leave hub_code as null.
  action('items.update', async (meta, context) => {
    if ((meta?.collection ?? null) !== 'regional_hubs') {
      return;
    }
    console.log('[hub-code-sync] items.update meta:', JSON.stringify(meta));

    const fullContext = {
      ...context,
      services: extensionContext.services,
      getSchema: extensionContext.getSchema
    };

    try {
      const res = await syncHubCode(fullContext, meta);
      console.log('[hub-code-sync] items.update result:', JSON.stringify(res));
    } catch (e) {
      console.error('[hub-code-sync] items.update error:', e);
    }
  });
};
