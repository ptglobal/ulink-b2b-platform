import { regenerateSkusForProduct } from './service.js';

const DEBOUNCE_MS = 2000;
const pendingProducts = new Map(); // productId → timeoutId

// Pre-delete cache: store product IDs before items are removed from DB
const preDeleteCache = new Map(); // `${collection}:${id}` → productId

export default ({ filter, action }, extensionContext) => {
  const WATCHED_COLLECTIONS = ['product_attribute_options', 'product_attributes', 'products_product_attributes'];

  /**
   * Resolve product ID(s) from an attribute, option, or M2M junction.
   * Returns an array of product IDs.
   */
  async function resolveProductIds(collection, keys, context) {
    const { services, getSchema } = extensionContext;
    const schema = await getSchema();
    const { ItemsService } = services;

    const serviceOpts = {
      schema,
      accountability: { admin: true },
      knex: context.database
    };

    if (collection === 'products_product_attributes') {
      const junctionId = Array.isArray(keys) ? keys[0] : keys;
      if (!junctionId) return [];
      const junctionService = new ItemsService('products_product_attributes', serviceOpts);
      try {
        const junction = await junctionService.readOne(junctionId, { fields: ['products_id'] });
        return junction?.products_id ? [junction.products_id] : [];
      } catch {
        return [];
      }
    }

    let attrId = null;

    if (collection === 'product_attributes') {
      attrId = Array.isArray(keys) ? keys[0] : keys;
    }

    if (collection === 'product_attribute_options') {
      const optionId = Array.isArray(keys) ? keys[0] : keys;
      if (!optionId) return [];

      const optionService = new ItemsService('product_attribute_options', serviceOpts);
      try {
        const option = await optionService.readOne(optionId, { fields: ['attribute'] });
        attrId = option?.attribute ?? null;
      } catch {
        return [];
      }
    }

    if (!attrId) return [];

    // Find all products linked to this attribute via M2M junction
    const junctionService = new ItemsService('products_product_attributes', serviceOpts);
    try {
      const junctions = await junctionService.readByQuery({
        filter: { product_attributes_id: { _eq: attrId } },
        fields: ['products_id'],
        limit: -1
      });
      return junctions.map((j) => j.products_id).filter(Boolean);
    } catch {
      return [];
    }
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

  // ─── FILTER: Pre-delete — capture product IDs before item is removed ────────
  filter('items.delete', async (keys, meta, context) => {
    if (!WATCHED_COLLECTIONS.includes(meta?.collection)) return keys;

    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      try {
        const productIds = await resolveProductIds(meta.collection, key, context);
        if (productIds.length > 0) {
          preDeleteCache.set(`${meta.collection}:${key}`, productIds);
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

    const productIds = await resolveProductIds(meta.collection, meta.key ?? meta.keys, context);
    for (const pid of productIds) {
      scheduleRegeneration(pid, context);
    }
  });

  // ─── ACTION: items.update — option value/suffix changed ────────────────────
  action('items.update', async (meta, context) => {
    if (!WATCHED_COLLECTIONS.includes(meta?.collection)) return;

    const keys = meta.keys ?? (meta.key ? [meta.key] : []);
    if (keys.length === 0) return;

    const productIds = await resolveProductIds(meta.collection, keys, context);
    for (const pid of productIds) {
      scheduleRegeneration(pid, context);
    }
  });

  // ─── ACTION: items.delete — retrieve product IDs from pre-delete cache ─────
  action('items.delete', async (meta, context) => {
    if (!WATCHED_COLLECTIONS.includes(meta?.collection)) return;

    const keys = meta.keys ?? (meta.key ? [meta.key] : []);
    if (keys.length === 0) return;

    const affectedProducts = new Set();

    for (const key of keys) {
      const cacheKey = `${meta.collection}:${key}`;
      const productIds = preDeleteCache.get(cacheKey);
      preDeleteCache.delete(cacheKey);
      if (productIds) {
        for (const pid of productIds) affectedProducts.add(pid);
      }
    }

    for (const pid of affectedProducts) {
      scheduleRegeneration(pid, context);
    }
  });
};
