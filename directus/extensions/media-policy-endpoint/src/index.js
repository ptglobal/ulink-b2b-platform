import { ADMIN_ROLE_ID, EDITOR_ROLE_ID, SALES_ROLE_ID } from '../../../constants.mjs';
import { hardDeleteFile, softDeleteFile } from '../../media-policy-hook/src/service.js';

const SOFT_DELETE_ROLES = new Set([ADMIN_ROLE_ID, EDITOR_ROLE_ID, SALES_ROLE_ID]);

function readRequestBody(req) {
  return req.body ?? req.payload ?? {};
}

function deny(res, status, message) {
  res.status(status);
  return res.json({ error: message });
}

export default {
  id: 'media-policy',
  handler(router, context) {
    router.post('/soft-delete', async (req, res) => {
      const accountability = req.accountability ?? {};
      if (!accountability.user || !SOFT_DELETE_ROLES.has(accountability.role)) {
        return deny(res, 403, 'Not allowed to soft delete files.');
      }

      const body = readRequestBody(req);
      const fileId = body.fileId ?? body.id;
      const reason = body.reason ?? null;
      const source = body.source ?? 'media-policy-endpoint';

      if (!fileId) {
        return deny(res, 400, 'fileId is required.');
      }

      try {
        const schema = await context.getSchema?.();
        const result = await softDeleteFile(
          {
            ...context,
            schema,
            accountability
          },
          {
            fileId,
            actorId: accountability.user,
            reason,
            source
          }
        );

        return res.json({ data: result });
      } catch (error) {
        return deny(res, 500, error.message);
      }
    });

    router.post('/hard-delete', async (req, res) => {
      const accountability = req.accountability ?? {};
      if (!accountability.user || (!accountability.admin && accountability.role !== ADMIN_ROLE_ID)) {
        return deny(res, 403, 'Only admin can hard delete files manually.');
      }

      const body = readRequestBody(req);
      const fileId = body.fileId ?? body.id;
      const reason = body.reason ?? null;
      const source = body.source ?? 'media-policy-endpoint';
      const confirmHardDelete = body.confirmHardDelete === true;
      const confirmFileId = body.confirmFileId ?? null;

      if (!fileId) {
        return deny(res, 400, 'fileId is required.');
      }

      if (!confirmHardDelete || confirmFileId !== fileId) {
        return deny(res, 400, 'Manual hard delete requires confirmHardDelete=true and confirmFileId to match fileId.');
      }

      try {
        const schema = await context.getSchema?.();
        const result = await hardDeleteFile(
          {
            ...context,
            schema,
            accountability
          },
          {
            fileId,
            actorId: accountability.user,
            reason,
            source
          }
        );

        return res.json({ data: result });
      } catch (error) {
        return deny(res, 500, error.message);
      }
    });
  }
};
