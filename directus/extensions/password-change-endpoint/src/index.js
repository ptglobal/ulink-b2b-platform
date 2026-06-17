const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default {
  id: 'password-change',
  handler(router, context) {
    router.post('/change', async (req, res) => {
      // 1. Verify user is authenticated
      if (!req.accountability || !req.accountability.user) {
        res.status(401);
        return res.json({ error: 'Unauthorized. You must be logged in to change your password.' });
      }

      const userId = req.accountability.user;
      const { current_password, new_password, confirm_password } = req.body ?? {};

      // 2. Validate input fields presence
      if (!current_password || !new_password || !confirm_password) {
        res.status(422);
        return res.json({ error: 'current_password, new_password, and confirm_password are required.' });
      }

      // 3. Validate passwords matching
      if (new_password !== confirm_password) {
        res.status(422);
        return res.json({ error: 'New passwords do not match.' });
      }

      // 4. Validate new password complexity
      if (!PASSWORD_REGEX.test(new_password)) {
        res.status(422);
        return res.json({
          error: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.'
        });
      }

      try {
        const { UsersService, AuthenticationService } = context.services ?? {};
        if (!UsersService || !AuthenticationService) {
          throw new Error('Directus service classes are unavailable.');
        }

        const schema = req.schema ?? (await context.getSchema?.()) ?? null;

        // 5. Fetch user's email
        // We use system accountability (null) to fetch user details safely
        const systemUsersService = new UsersService({ schema, accountability: null });
        const user = await systemUsersService.readOne(userId, { fields: ['email'] });
        if (!user || !user.email) {
          res.status(404);
          return res.json({ error: 'User email not found.' });
        }

        // 6. Verify current password via AuthenticationService.login
        const authService = new AuthenticationService({ schema });
        try {
          await authService.login('default', {
            email: user.email,
            password: current_password
          }, { session: false });
        } catch (authError) {
          console.warn(`[password-change] Password verification failed for user ${userId}:`, authError.message);
          res.status(401);
          return res.json({ error: 'Invalid current password.' });
        }

        // 7. Update password using system accountability (bypasses Customer role restriction)
        await systemUsersService.updateOne(userId, {
          password: new_password
        });

        console.log(`[password-change] Password successfully updated for user ${userId}.`);
        return res.status(204).end();
      } catch (error) {
        console.error('[password-change] Error during password change:', error);
        res.status(error.status ?? error.statusCode ?? 500);
        return res.json({ error: error.message || 'An internal server error occurred.' });
      }
    });
  }
};
