import { formatHubCode, normalizeHubProvinceAbbr, HUB_OPERATING_STATUSES } from '../../../lib/hub-domain.mjs';

const HUB_COLLECTION = 'regional_hubs';
const PROVINCE_COLLECTION = 'vn_provinces';
const DISTRICT_COLLECTION = 'vn_districts';
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
    provincesService: new ItemsService(PROVINCE_COLLECTION, { schema, accountability }),
    districtsService: new ItemsService(DISTRICT_COLLECTION, { schema, accountability })
  };
}

function getHubId(meta) {
  const id = meta?.key ?? meta?.id ?? meta?.payload?.id ?? null;
  if (Array.isArray(id)) {
    return id[0] ?? null;
  }
  return id;
}

async function loadHubRecord(hubsService, hubId) {
  return hubsService.readOne(hubId, {
    fields: ['id', 'slug', 'hub_code', 'province', 'district', 'detail_address', 'operating_status']
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

export async function syncHubCode(context, meta) {
  if ((meta?.collection ?? null) !== HUB_COLLECTION) {
    return { synced: false };
  }

  const hubId = getHubId(meta);
  if (!hubId) {
    return { synced: false };
  }

  const { hubsService, provincesService, districtsService } = await getServiceClasses(context);
  const hub = await loadHubRecord(hubsService, hubId);

  const provinceId = relationId(hub?.province);
  const districtId = relationId(hub?.district);
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

  if (!districtId) {
    const error = new Error('Hub district is required.');
    error.status = 422;
    error.code = 'missing_district';
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

  const district = await districtsService.readOne(districtId, { fields: ['id', 'province', 'code', 'name'] });
  const districtProvinceId = relationId(district?.province);
  if (districtProvinceId !== relationId(province?.id)) {
    const error = new Error('District must belong to the selected province.');
    error.status = 422;
    error.code = 'province_district_mismatch';
    throw error;
  }

  const provinceAbbr = normalizeHubProvinceAbbr(province?.abbr);
  const sequence = await countHubsInProvince(hubsService, provinceId);
  const nextHubCode = formatHubCode(provinceAbbr, sequence);

  if (hub?.hub_code !== nextHubCode) {
    await hubsService.updateOne(hubId, { hub_code: nextHubCode });
  }

  return {
    synced: true,
    hubId,
    hubCode: nextHubCode
  };
}
