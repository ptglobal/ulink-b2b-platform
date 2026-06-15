export function requireInternalToken(
  authorization: string | null | undefined,
  expected = process.env.INTERNAL_API_TOKEN
): string {
  if (!expected) {
    throw new Error('INTERNAL_API_TOKEN is required for internal requests.');
  }

  const received = authorization?.startsWith('Bearer ') ? authorization.slice(7) : authorization ?? undefined;
  if (!received || received !== expected) {
    throw new Error('Invalid internal API token.');
  }

  return expected;
}
