import { formatHubCode, normalizeHubProvinceAbbr, HUB_OPERATING_STATUSES } from '../../../lib/hub-domain.mjs';

const HUB_COLLECTION = 'regional_hubs';
const PROVINCE_COLLECTION = 'vn_provinces';
const OPERATING_STATUS_VALUES = new Set(HUB_OPERATING_STATUSES.map((item) => item.value));

function relationId(value) {
  if (value && typeof value === 'object') {
    return value.id ?? value.value ?? null;
  }
  return value ?? null;
}

function requireField(value, fieldName) {
  if (value === null || value === undefined || String(value).trim() === '') {
    const error = new Error(`Hub field "${fieldName}" is required.`);
    error.status = 422;
    error.code = `missing_${fieldName}`;
    throw error;
  }
  return value;
}

async function getServiceClasses(context) {
  const { ItemsService } = context.services ?? {};
  if (!ItemsService) {
    throw new Error('Directus ItemsService is unavailable.');
  }

  const schema = context.schema ?? (await context.getSchema?.()) ?? null;
  const accountability = context.accountability ?? null;

  return {
    hubsService: new ItemsService(HUB_COLLECTION, { schema, accountability }),
    provincesService: new ItemsService(PROVINCE_COLLECTION, { schema, accountability })
  };
}

function getHubId(meta) {
  const id = meta?.key ?? meta?.keys ?? meta?.id ?? meta?.payload?.id ?? null;
  if (Array.isArray(id)) {
    return id[0] ?? null;
  }
  return id;
}

async function loadHubRecord(hubsService, hubId) {
  return hubsService.readOne(hubId, {
    fields: ['id', 'slug', 'hub_code', 'province', 'detail_address', 'operating_status']
  });
}

async function countHubsInProvince(hubsService, provinceId) {
  const rows = await hubsService.readByQuery({
    filter: { province: { _eq: provinceId } },
    fields: ['id'],
    limit: -1
  });
  return rows.length;
}

/**
 * Generate hub_code for a NEW hub before insert (filter hook).
 * Validates required fields from payload and returns the generated hub_code.
 * Throws on validation failure → blocks the create.
 */
export async function generateHubCodeForCreate(context, payload) {
  const provinceId = relationId(payload?.province);
  if (!provinceId) {
    const error = new Error('Hub province is required.');
    error.status = 422;
    error.code = 'missing_province';
    throw error;
  }

  const operatingStatus = requireField(payload?.operating_status, 'operating_status');
  if (!OPERATING_STATUS_VALUES.has(operatingStatus)) {
    const error = new Error(`Unsupported hub operating status: ${operatingStatus}`);
    error.status = 422;
    error.code = 'invalid_operating_status';
    throw error;
  }

  requireField(payload?.detail_address, 'detail_address');

  const { hubsService, provincesService } = await getServiceClasses(context);

  const province = await provincesService.readOne(provinceId, { fields: ['id', 'abbr', 'name'] });
  if (!province) {
    const error = new Error(`Province not found for id ${provinceId}.`);
    error.status = 422;
    error.code = 'invalid_province';
    throw error;
  }

  const provinceAbbr = normalizeHubProvinceAbbr(province?.abbr);
  // +1 because this hub hasn't been inserted yet
  const sequence = (await countHubsInProvince(hubsService, provinceId)) + 1;
  const baseCode = formatHubCode(provinceAbbr, sequence);

  // Check for duplicates (no excludeId since hub doesn't exist yet)
  const checkExists = async (code) => {
    const existing = await hubsService.readByQuery({
      filter: { hub_code: { _eq: code } },
      fields: ['id'],
      limit: 1
    });
    return existing.length > 0;
  };

  let finalCode = baseCode;
  let isDuplicate = await checkExists(finalCode);
  if (isDuplicate) {
    let attempts = 0;
    while (isDuplicate && attempts < 100) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      finalCode = `HUB-${provinceAbbr}-${randomNum}`;
      isDuplicate = await checkExists(finalCode);
      attempts++;
    }
  }

  return finalCode;
}

/**
 * Re-sync hub_code for an EXISTING hub after update (action hook).
 */
export async function syncHubCode(context, meta) {
  if ((meta?.collection ?? null) !== HUB_COLLECTION) {
    return { synced: false };
  }

  const hubId = getHubId(meta);
  if (!hubId) {
    return { synced: false };
  }

  const { hubsService, provincesService } = await getServiceClasses(context);
  const hub = await loadHubRecord(hubsService, hubId);

  const provinceId = relationId(hub?.province);
  const operatingStatus = requireField(hub?.operating_status, 'operating_status');
  const detailAddress = requireField(hub?.detail_address, 'detail_address');

  if (!OPERATING_STATUS_VALUES.has(operatingStatus)) {
    const error = new Error(`Unsupported hub operating status: ${operatingStatus}`);
    error.status = 422;
    error.code = 'invalid_operating_status';
    throw error;
  }

  if (!provinceId) {
    const error = new Error('Hub province is required.');
    error.status = 422;
    error.code = 'missing_province';
    throw error;
  }

  requireField(detailAddress, 'detail_address');

  const province = await provincesService.readOne(provinceId, { fields: ['id', 'abbr', 'name'] });
  if (!province) {
    const error = new Error(`Province not found for id ${provinceId}.`);
    error.status = 422;
    error.code = 'invalid_province';
    throw error;
  }

  const provinceAbbr = normalizeHubProvinceAbbr(province?.abbr);
  const sequence = await countHubsInProvince(hubsService, provinceId);
  const nextHubCode = formatHubCode(provinceAbbr, sequence);

  // Check if this hub_code is already in use by ANOTHER hub
  const checkHubCodeExists = async (code) => {
    const existing = await hubsService.readByQuery({
      filter: {
        _and: [
          { hub_code: { _eq: code } },
          { id: { _ne: hubId } }
        ]
      },
      fields: ['id'],
      limit: 1
    });
    return existing.length > 0;
  };

  let finalHubCode = nextHubCode;
  let isDuplicate = await checkHubCodeExists(finalHubCode);
  if (isDuplicate) {
    let attempts = 0;
    // Loop to try to find a unique HUB-[provinceAbbr]-[random 100-999] code
    while (isDuplicate && attempts < 100) {
      const randomNum = Math.floor(100 + Math.random() * 900); // 100 to 999
      finalHubCode = `HUB-${provinceAbbr}-${randomNum}`;
      isDuplicate = await checkHubCodeExists(finalHubCode);
      attempts++;
    }
  }

  if (hub?.hub_code !== finalHubCode) {
    await hubsService.updateOne(hubId, { hub_code: finalHubCode });
  }

  return {
    synced: true,
    hubId,
    hubCode: finalHubCode
  };
}
