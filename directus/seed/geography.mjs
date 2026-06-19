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

  const provincesByAbbr = new Map();
  const provincesByCode = new Map();

  for (const province of provinceRows) {
    const id = await helpers.ensureItem('vn_provinces', 'code', province);
    const record = mapProvinceRecord(province, id);
    provincesByAbbr.set(normalizeHubProvinceAbbr(province.abbr), record);
    provincesByCode.set(province.code, record);
  }

  return {
    provincesByAbbr,
    provincesByCode
  };
}
