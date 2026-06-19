import argon2 from 'argon2';

/**
 * Password policy hook
 * ────────────────────
 * Two responsibilities, both running on `users.update`:
 *
 *   1. FILTER (pre-update) — reject the update when the new password matches
 *      the user's current password. Catches every code path that writes
 *      `payload.password`, including the custom `/password-reset-request/reset`
 *      and `/password-change/change` endpoints as well as any direct
 *      `PATCH /users/{id}` admin call. Throws an `InvalidPayloadException`
 *      with code `PASSWORD_SAME_AS_OLD` so the frontend can map it to a
 *      friendly message.
 *
 *   2. ACTION (post-update) — invalidate every session belonging to the
 *      affected users, so a stolen token cannot outlive a legitimate password
 *      change (AC04 / "logout everywhere").
 */
export default ({ filter, action }, context) => {
  // ─── 1. Pre-update: block password reuse ────────────────────────────────
  filter('users.update', async (input, { keys }) => {
    const { payload } = input ?? {};
    if (!payload?.password || typeof payload.password !== 'string') return;

    const { database } = context;
    if (!database) return;

    const plaintext = payload.password;

    for (const userId of keys) {
      let row;
      try {
        row = await database('directus_users')
          .where('id', userId)
          .select('password')
          .first();
      } catch (err) {
        // If we can't read the existing row we can't make the comparison —
        // fail open rather than locking the user out.
        console.warn(`[password-policy-hook] Could not read current hash for ${userId}: ${err.message}`);
        continue;
      }

      const currentHash = row?.password;
      if (!currentHash || typeof currentHash !== 'string') continue;

      // argon2.verify returns false on hash mismatch / malformed hash rather
      // than throwing — wrap it so any unexpected error is surfaced but does
      // not crash the request.
      let same = false;
      try {
        same = await argon2.verify(currentHash, plaintext);
      } catch (err) {
        console.warn(`[password-policy-hook] argon2.verify failed for ${userId}: ${err.message}`);
        continue;
      }

      if (same) {
        // Mirrors the shape of Directus's InvalidPayloadException so the
        // existing error-mapping in the Next.js routes can pick it up.
        const err = new Error('New password must be different from the current password.');
        err.status = 422;
        err.statusCode = 422;
        err.code = 'PASSWORD_SAME_AS_OLD';
        throw err;
      }
    }
  });

  // ─── 2. Post-update: invalidate all sessions (AC04) ────────────────────
  action('users.update', async ({ keys, payload }) => {
    if (!payload?.password) return;

    const { database } = context;
    if (!database) return;

    for (const userId of keys) {
      try {
        const deleted = await database('directus_sessions')
          .where('user', userId)
          .delete();
        console.log(`[password-policy-hook] Password changed for user ${userId} — invalidated ${deleted} session(s).`);
      } catch (err) {
        console.error(`[password-policy-hook] Failed to invalidate sessions for user ${userId}:`, err.message);
      }
    }
  });
};