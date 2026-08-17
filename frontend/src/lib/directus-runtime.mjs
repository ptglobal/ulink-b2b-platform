export function getDirectusUrl(url) {
  if (url) return url;
  if (typeof window === 'undefined') {
    return process.env.DIRECTUS_URL ?? process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055';
  }
  return process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055';
}

export function normalizeSecret(value) {
  return typeof value === 'string' ? value.replace(/^\uFEFF+/, '').trim() : '';
}

export function requireDirectusToken(token = process.env.DIRECTUS_TOKEN) {
  const normalized = normalizeSecret(token);
  if (!normalized) {
    throw new Error('DIRECTUS_TOKEN is required for server-side RFQ writes.');
  }

  return normalized;
}
