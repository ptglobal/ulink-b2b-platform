export default ({ action }, context) => {
  action('users.update', async ({ keys, payload }) => {
    if (!payload?.password) return;

    const { getSchema, database } = context;
    const schema = await getSchema();
    if (!schema || !database) return;

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
