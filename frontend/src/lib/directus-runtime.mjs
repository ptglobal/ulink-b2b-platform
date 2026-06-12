export function getDirectusUrl(url = process.env.DIRECTUS_URL) {
  return url ?? 'http://localhost:8055';
}

export function requireDirectusToken(token = process.env.DIRECTUS_TOKEN) {
  if (!token) {
    throw new Error('DIRECTUS_TOKEN is required for server-side RFQ writes.');
  }

  return token;
}
