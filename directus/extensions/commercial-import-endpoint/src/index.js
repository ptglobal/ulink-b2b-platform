import { ADMIN_ROLE_ID, SALES_ROLE_ID } from '../../../constants.mjs';
import { runCommercialImport } from './service.js';

const ALLOWED_ROLES = new Set([ADMIN_ROLE_ID, SALES_ROLE_ID]);

function deny(res, status, message) {
  res.status(status);
  return res.json({ error: message });
}

function readBody(req) {
  return req.body ?? req.payload ?? {};
}

export default {
  id: 'commercial-import',
  handler(router, context) {
    router.post('/preview', async (req, res) => {
      const accountability = req.accountability ?? {};
      if (!accountability.user || !ALLOWED_ROLES.has(accountability.role)) {
        return deny(res, 403, 'Not allowed to run commercial imports.');
      }

      const body = readBody(req);
      try {
        const result = await runCommercialImport(context, {
          mode: 'preview',
          collection: body.collection,
          csvText: body.csvText,
          allowPartial: body.allowPartial === true
        });

        return res.json({ data: result });
      } catch (error) {
        return deny(res, 400, error.message || 'Commercial import preview failed.');
      }
    });

    router.post('/commit', async (req, res) => {
      const accountability = req.accountability ?? {};
      if (!accountability.user || !ALLOWED_ROLES.has(accountability.role)) {
        return deny(res, 403, 'Not allowed to run commercial imports.');
      }

      const body = readBody(req);
      try {
        const result = await runCommercialImport(context, {
          mode: 'commit',
          collection: body.collection,
          csvText: body.csvText,
          allowPartial: body.allowPartial === true
        });

        return res.json({ data: result });
      } catch (error) {
        return deny(res, 400, error.message || 'Commercial import commit failed.');
      }
    });
  }
};
