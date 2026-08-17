/**
 * SKU Auto-generation Service
 *
 * Core logic: given a product ID, fetches its assigned attributes (via M2M junction)
 * + options, computes the cartesian product, and reconciles with existing SKUs.
 *
 * - New combinations → create as 'published'
 * - Orphaned SKUs (no longer in cartesian) → archive
 * - Archived SKUs that match a current combination → restore to 'published'
 * - Existing active SKUs → unchanged
 */

const MAX_COMBINATIONS = 10000;
const BATCH_SIZE = 100;

/**
 * Assert that a product has at least one assigned attribute before SKU creation.
 */
export function assertProductHasAssignedAttributes({ productId, productSlug, assignedAttributeCount }) {
  if (!productId) {
    throw new Error('SKU product is missing.');
  }

  if (assignedAttributeCount < 1) {
    const label = productSlug ? `product "${productSlug}"` : `product ${productId}`;
    throw new Error(`${label} must have at least one assigned attribute before SKUs can be created.`);
  }
}

/**
 * Main entry: regenerate SKUs for a given product.
 */
export async function regenerateSkusForProduct(extensionContext, context, productId) {
  const { services, getSchema } = extensionContext;
  const schema = await getSchema();
  const { ItemsService } = services;

  const serviceOptions = {
    schema,
    accountability: { admin: true }, // Use admin to bypass RBAC
    knex: context.database
  };

  const productsService = new ItemsService('products', serviceOptions);
  const attrsService = new ItemsService('product_attributes', serviceOptions);
  const junctionService = new ItemsService('products_product_attributes', serviceOptions);
  const skusService = new ItemsService('product_skus', serviceOptions);

  // 1. Fetch product slug for SKU prefix
  const product = await productsService.readOne(productId, { fields: ['id', 'slug'] });
  if (!product?.slug) {
    console.warn(`[sku-autogen] Product ${productId} has no slug, skipping.`);
    return;
  }

  // 2. Fetch assigned attribute IDs via M2M junction
  const junctions = await junctionService.readByQuery({
    filter: { products_id: { _eq: productId } },
    fields: ['product_attributes_id'],
    limit: -1
  });

  const attrIds = junctions.map((j) => j.product_attributes_id).filter(Boolean);

  if (attrIds.length === 0) {
    console.log(`[sku-autogen] Product ${productId} has no assigned attributes, archiving all auto-generated SKUs.`);
    await archiveAllAutoSkus(skusService, productId);
    return;
  }

  // 3. Fetch attributes with their options (sorted)
  const attributes = await attrsService.readByQuery({
    filter: { id: { _in: attrIds } },
    fields: ['id', 'name', 'slug', 'sort', 'options.id', 'options.value', 'options.sku_suffix', 'options.sort'],
    sort: ['sort', 'id']
  });

  if (!attributes || attributes.length === 0) {
    console.log(`[sku-autogen] Product ${productId} assigned attributes not found, archiving all auto-generated SKUs.`);
    await archiveAllAutoSkus(skusService, productId);
    return;
  }

  // 4. Sort options within each attribute
  for (const attr of attributes) {
    if (attr.options) {
      attr.options.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id - b.id);
    }
  }

  // 5. Skip if any attribute has no options yet (admin still adding)
  const attrWithOptions = attributes.filter((a) => a.options && a.options.length > 0);
  if (attrWithOptions.length === 0) {
    console.log(`[sku-autogen] Product ${productId}: no attribute has options yet, skipping.`);
    return;
  }

  // 6. Compute cartesian product
  const optionSets = attrWithOptions.map((attr) =>
    attr.options.map((opt) => ({
      attrName: attr.name,
      attrSlug: attr.slug,
      value: opt.value,
      suffix: opt.sku_suffix.toLowerCase().trim()
    }))
  );

  const combinations = cartesianProduct(optionSets);

  // 7. Safety cap
  if (combinations.length > MAX_COMBINATIONS) {
    console.error(
      `[sku-autogen] Product ${productId}: ${combinations.length} combinations exceeds cap of ${MAX_COMBINATIONS}. Aborting.`
    );
    return;
  }

  // 8. Build desired SKU map: sku_code → attributes JSON
  const prefix = buildSkuPrefix(product.slug);
  const desiredMap = new Map(); // sku_code → { attributes }

  for (const combo of combinations) {
    const suffixParts = combo.map((c) => c.suffix);
    const skuCode = `${prefix}-${suffixParts.join('-')}`;
    const attrs = {};
    for (const c of combo) {
      // Use slug as key (e.g. "size": "M", "color": "Xanh dương")
      attrs[c.attrSlug] = c.value;
    }
    desiredMap.set(skuCode, attrs);
  }

  // 9. Fetch existing SKUs for this product
  const existingSkus = await skusService.readByQuery({
    filter: { product: { _eq: productId } },
    fields: ['id', 'sku_code', 'status', 'attributes'],
    limit: -1
  });

  const existingByCode = new Map();
  for (const sku of existingSkus) {
    existingByCode.set(sku.sku_code, sku);
  }

  // 10. Reconcile
  const toCreate = [];
  const toRestore = []; // archived → published
  const toArchive = []; // active but no longer in desired

  // Find new or restorable
  for (const [code, attrs] of desiredMap) {
    const existing = existingByCode.get(code);
    if (!existing) {
      toCreate.push({ sku_code: code, attributes: attrs });
    } else if (existing.status === 'archived') {
      toRestore.push(existing.id);
    }
    // else: already active/draft — leave unchanged
  }

  // Find orphans (existing SKUs not in desired set that were auto-generated)
  for (const [code, sku] of existingByCode) {
    if (!desiredMap.has(code) && sku.status !== 'archived') {
      // Only archive if it looks auto-generated (has attributes JSON matching our pattern)
      if (sku.attributes && typeof sku.attributes === 'object' && Object.keys(sku.attributes).length > 0) {
        toArchive.push(sku.id);
      }
    }
  }

  // 11. Execute in batches
  // Create new SKUs
  for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
    const batch = toCreate.slice(i, i + BATCH_SIZE);
    for (const item of batch) {
      // Check collision with manually-created SKUs
      const finalCode = await resolveSkuCodeCollision(skusService, item.sku_code, existingByCode);
      await skusService.createOne({
        product: productId,
        sku_code: finalCode,
        attributes: item.attributes,
        status: 'published'
      });
    }
  }

  // Restore archived SKUs
  if (toRestore.length > 0) {
    for (let i = 0; i < toRestore.length; i += BATCH_SIZE) {
      const batch = toRestore.slice(i, i + BATCH_SIZE);
      await skusService.updateMany(batch, { status: 'published' });
    }
  }

  // Archive orphaned SKUs
  if (toArchive.length > 0) {
    for (let i = 0; i < toArchive.length; i += BATCH_SIZE) {
      const batch = toArchive.slice(i, i + BATCH_SIZE);
      await skusService.updateMany(batch, { status: 'archived' });
    }
  }

  console.log(
    `[sku-autogen] Product ${productId}: created=${toCreate.length}, restored=${toRestore.length}, archived=${toArchive.length}`
  );
}

/**
 * Archive all auto-generated SKUs for a product (when no attributes remain).
 */
async function archiveAllAutoSkus(skusService, productId) {
  const existing = await skusService.readByQuery({
    filter: {
      product: { _eq: productId },
      status: { _neq: 'archived' }
    },
    fields: ['id', 'attributes'],
    limit: -1
  });

  const autoGenerated = existing.filter(
    (s) => s.attributes && typeof s.attributes === 'object' && Object.keys(s.attributes).length > 0
  );

  if (autoGenerated.length > 0) {
    const ids = autoGenerated.map((s) => s.id);
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
      await skusService.updateMany(batch, { status: 'archived' });
    }
    console.log(`[sku-autogen] Archived ${autoGenerated.length} orphaned SKUs for product ${productId}`);
  }
}

/**
 * Compute the cartesian product of an array of arrays.
 * e.g. [[a1, a2], [b1, b2]] → [[a1,b1], [a1,b2], [a2,b1], [a2,b2]]
 */
function cartesianProduct(arrays) {
  if (arrays.length === 0) return [[]];

  return arrays.reduce(
    (acc, curr) => {
      const result = [];
      for (const a of acc) {
        for (const b of curr) {
          result.push([...a, b]);
        }
      }
      return result;
    },
    [[]]
  );
}

/**
 * Normalize product slug into a SKU prefix.
 * Lowercase, trim, replace spaces/special chars with hyphens.
 */
function buildSkuPrefix(slug) {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Resolve SKU code collisions by appending -2, -3, etc.
 * Checks against both the database and the in-memory map of existing codes.
 */
async function resolveSkuCodeCollision(skusService, code, existingByCode) {
  if (!existingByCode.has(code)) {
    // Double-check DB in case of race
    const dbCheck = await skusService.readByQuery({
      filter: { sku_code: { _eq: code } },
      fields: ['id'],
      limit: 1
    });
    if (dbCheck.length === 0) return code;
  }

  // Try suffixes -2 through -99
  for (let i = 2; i <= 99; i++) {
    const candidate = `${code}-${i}`;
    if (!existingByCode.has(candidate)) {
      const dbCheck = await skusService.readByQuery({
        filter: { sku_code: { _eq: candidate } },
        fields: ['id'],
        limit: 1
      });
      if (dbCheck.length === 0) return candidate;
    }
  }

  // Extremely unlikely — use timestamp
  return `${code}-${Date.now()}`;
}
