import { createCustomerAccount } from './service.js';

function readRequestBody(req) {
  return req.body ?? req.payload ?? {};
}

function deny(res, status, message) {
  res.status(status);
  return res.json({ error: message });
}

export default {
  id: 'customer-onboarding',
  handler(router, context) {
    router.post('/register', async (req, res) => {
      const body = readRequestBody(req);

      try {
        const result = await createCustomerAccount(
          {
            ...context,
            schema: req.schema
          },
          body
        );
        return res.status(201).json({ data: result });
      } catch (error) {
        const status = error.status ?? error.statusCode ?? 500;
        // Surface the underlying cause for 500-class failures so we can see
        // the actual stack in `docker compose logs directus` instead of a
        // generic "Customer onboarding failed." in the response.
        console.error('[customer-onboarding/register] failed:', {
          status,
          message: error.message,
          code: error.code,
          errors: error.errors,
          stack: error.stack
        });
        return deny(res, status, error.message || 'Customer onboarding failed.');
      }
    });
  }
};
