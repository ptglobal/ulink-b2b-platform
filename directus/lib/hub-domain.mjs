export const HUB_OPERATING_STATUSES = [
  { text: 'Đang hoạt động', value: 'active' },
  { text: 'Dừng hoạt động', value: 'stopped' },
  { text: 'Đang bảo trì', value: 'maintenance' },
  { text: 'Đầy hàng', value: 'full' },
  { text: 'Đóng cửa tạm thời', value: 'temporarily_closed' }
];

export function normalizeHubProvinceAbbr(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function formatHubCode(provinceAbbr, sequence) {
  const abbr = normalizeHubProvinceAbbr(provinceAbbr);
  if (!abbr) {
    throw new Error('province abbreviation is required');
  }

  const count = Number(sequence);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('sequence must be a positive integer');
  }

  return `HUB-${abbr}-${String(count).padStart(3, '0')}`;
}
