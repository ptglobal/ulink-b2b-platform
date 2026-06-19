import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { normalizeHubProvinceAbbr } from '../lib/hub-domain.mjs';

async function loadJson(relativeUrl) {
  const json = await readFile(new URL(relativeUrl, import.meta.url), 'utf8');
  return JSON.parse(json);
}

function mapProvinceRecord(record, id) {
  return {
    ...record,
    id
  };
}

export async function seedGeography(helpers) {
  const provinceRows = await loadJson('./data/vn-provinces.json');
  const districtRows = await loadJson('./data/vn-districts.json');

  const provincesByAbbr = new Map();
  const provincesByCode = new Map();

  for (const province of provinceRows) {
    const id = await helpers.ensureItem('vn_provinces', 'code', province);
    const record = mapProvinceRecord(province, id);
    provincesByAbbr.set(normalizeHubProvinceAbbr(province.abbr), record);
    provincesByCode.set(province.code, record);
  }

  const districtsByCode = new Map();

  for (const district of districtRows) {
    const province = provincesByAbbr.get(normalizeHubProvinceAbbr(district.province_abbr));
    if (!province) {
      throw new Error(`Missing province seed for district ${district.code}.`);
    }

    const payload = {
      code: district.code,
      province: province.id,
      name: district.name
    };
    const id = await helpers.ensureItem('vn_districts', 'code', payload);
    districtsByCode.set(district.code, {
      ...district,
      id,
      province_id: province.id
    });
  }

  return {
    provincesByAbbr,
    provincesByCode,
    districtsByCode
  };
}
