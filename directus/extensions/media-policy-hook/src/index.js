import { buildMediaAuditRecord, writeMediaAuditEvent } from './audit.js';
import { createMediaServices } from './service.js';
import { getFolderNameById, getUploadActor } from './rules.js';
import { getModuleKeyForFolderName } from '../../../lib/media-policy.mjs';

export default ({ init, action }, extensionContext) => {

  // Intercept the final JSON response before it is sent to the client
  // This allows us to cleanly format DB trigger errors and return HTTP 400.
  init('middlewares.before', ({ app }) => {
    app.use('/files', (req, res, next) => {
      const originalJson = res.json;

      res.json = function (body) {
        if (body && Array.isArray(body.errors) && body.errors.length > 0) {
          const error = body.errors[0];
          
          if (error.message && error.message.includes('FILE_VALIDATION_ERROR:')) {
            const cleanMessage = error.message.split('FILE_VALIDATION_ERROR:')[1].trim();
            
            // Rewrite the error object
            error.message = cleanMessage;
            error.extensions = {
              code: 'FORBIDDEN'
            };
            
            // Force HTTP 400 Bad Request instead of HTTP 500
            res.status(400);
          }
        }
        
        return originalJson.call(this, body);
      };

      next();
    });
  });

  // Action hook to log successful uploads
  action('files.upload', async (meta, context) => {
    if (meta.collection !== 'directus_files') return;
    const fileId = meta.key ?? null;
    if (!fileId) return;

    try {
      const fullContext = { ...context, services: extensionContext.services, getSchema: extensionContext.getSchema };
      const { folderIndex, schema } = await createMediaServices(fullContext);
      const { FilesService } = fullContext.services;
      const filesService = new FilesService({ schema, accountability: null });
      const file = await filesService.readOne(fileId);
      if (!file) return;

      const { actorId } = getUploadActor(context.accountability);
      const folderId = typeof file.folder === 'object' ? file.folder?.id ?? null : file.folder ?? null;
      const folderName = getFolderNameById(folderIndex, folderId);
      const moduleName = getModuleKeyForFolderName(folderName) ?? 'unknown';

      const fileSnapshot = {
        id: file.id,
        filename_download: file.filename_download ?? file.filename_disk ?? file.title ?? '',
        type: file.type ?? file.mime_type ?? '',
        filesize: file.filesize ?? file.size ?? 0
      };

      await writeMediaAuditEvent(fullContext.services, schema, {
        ...buildMediaAuditRecord({
          file: fileSnapshot,
          actor: actorId,
          eventType: 'upload_accepted',
          action: 'upload',
          module: moduleName,
          reason: null,
          source: 'directus-hook',
          ipAddress: context.accountability?.ip ?? null,
          userAgent: context.accountability?.userAgent ?? null
        }),
        reason: null
      });

    } catch (error) {
      console.error(`[media-policy-hook] Error processing files.upload action hook:`, error.message || error);
    }
  });
};
