import { regenerateSkusForProduct } from './service.js';

const DEBOUNCE_MS = 2000;
const pendingProducts = new Map(); // productId → timeoutId

// Pre-delete cache: store product IDs before items are removed from DB
const preDeleteCache = new Map(); // `${collection}:${id}` → productId

export default ({ filter, action }, extensionContext) => {
  const WATCHED_COLLECTIONS = ['product_attribute_options', 'product_attributes'];

  /**
   * Resolve product ID from an attribute or option (item still exists in DB).
   */
  async function resolveProductId(collection, keys, context) {
    const { services, getSchema } = extensionContext;
    const schema = await getSchema();
    const { ItemsService } = services;

    const serviceOpts = {
      schema,
      accountability: { admin: true },
      knex: context.database
    };

    if (collection === 'product_attributes') {
      const attrId = Array.isArray(keys) ? keys[0] : keys;
      if (!attrId) return null;

      const attrService = new ItemsService('product_attributes', serviceOpts);
      try {
        const attr = await attrService.readOne(attrId, { fields: ['product'] });
        return attr?.product ?? null;
      } catch {
        return null;
      }
    }

    if (collection === 'product_attribute_options') {
      const optionId = Array.isArray(keys) ? keys[0] : keys;
      if (!optionId) return null;

      const optionService = new ItemsService('product_attribute_options', serviceOpts);
      try {
        const option = await optionService.readOne(optionId, {
          fields: ['attribute.product']
        });
        return option?.attribute?.product ?? null;
      } catch {
        return null;
      }
    }

    return null;
  }

  function scheduleRegeneration(productId, context) {
    if (pendingProducts.has(productId)) {
      clearTimeout(pendingProducts.get(productId));
    }

    const timeoutId = setTimeout(async () => {
      pendingProducts.delete(productId);
      try {
        console.log(`[sku-autogen] Regenerating SKUs for product ${productId}`);
        await regenerateSkusForProduct(extensionContext, context, productId);
        console.log(`[sku-autogen] Done regenerating SKUs for product ${productId}`);
      } catch (err) {
        console.error(`[sku-autogen] Error regenerating SKUs for product ${productId}:`, err);
      }
    }, DEBOUNCE_MS);

    pendingProducts.set(productId, timeoutId);
  }

  // ─── FILTER: Pre-delete — capture product ID before item is removed ────────
  filter('items.delete', async (keys, meta, context) => {
    if (!WATCHED_COLLECTIONS.includes(meta?.collection)) return keys;

    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      try {
        const productId = await resolveProductId(meta.collection, key, context);
        if (productId) {
          preDeleteCache.set(`${meta.collection}:${key}`, productId);
        }
      } catch (err) {
        console.error('[sku-autogen] pre-delete cache error:', err);
      }
    }

    return keys;
  });

  // ─── ACTION: items.create — new attribute or option added ──────────────────
  action('items.create', async (meta, context) => {
    if (!WATCHED_COLLECTIONS.includes(meta?.collection)) return;

    const productId = await resolveProductId(meta.collection, meta.key ?? meta.keys, context);
    if (!productId) return;

    scheduleRegeneration(productId, context);
  });

  // ─── ACTION: items.update — option value/suffix changed ────────────────────
  action('items.update', async (meta, context) => {
    if (!WATCHED_COLLECTIONS.includes(meta?.collection)) return;

    const keys = meta.keys ?? (meta.key ? [meta.key] : []);
    if (keys.length === 0) return;

    const productId = await resolveProductId(meta.collection, keys, context);
    if (!productId) return;

    scheduleRegeneration(productId, context);
  });

  // ─── ACTION: items.delete — retrieve product ID from pre-delete cache ──────
  action('items.delete', async (meta, context) => {
    if (!WATCHED_COLLECTIONS.includes(meta?.collection)) return;

    const keys = meta.keys ?? (meta.key ? [meta.key] : []);
    if (keys.length === 0) return;

    const affectedProducts = new Set();

    for (const key of keys) {
      const cacheKey = `${meta.collection}:${key}`;
      const productId = preDeleteCache.get(cacheKey);
      preDeleteCache.delete(cacheKey);
      if (productId) affectedProducts.add(productId);
    }

    for (const pid of affectedProducts) {
      scheduleRegeneration(pid, context);
    }
  });
};
