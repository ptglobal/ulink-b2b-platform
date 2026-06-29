import { buildMediaAuditRecord, writeMediaAuditEvent } from './audit.js';
import { createMediaServices } from './service.js';
import { getFolderNameById, getUploadActor, validateMediaUpload } from './rules.js';
import { getModuleKeyForFolderName } from '../../../lib/media-policy.mjs';
import { ADMIN_ROLE_ID, EDITOR_ROLE_ID } from '../../../lib/constants.mjs';

export default ({ action }, extensionContext) => {
  action('files.upload', async (meta, context) => {
    if (meta.collection !== 'directus_files') {
      return;
    }

    const fileId = meta.key ?? null;
    if (!fileId) {
      return;
    }

    console.log(`[media-policy-hook] Intercepting files.upload action for file ID: ${fileId}`);

    try {
      const fullContext = {
        ...context,
        services: extensionContext.services,
        getSchema: extensionContext.getSchema
      };

      const { folderIndex, schema } = await createMediaServices(fullContext);
      const { FilesService, NotificationsService } = fullContext.services;
      const filesService = new FilesService({ schema, accountability: null });

      // Fetch the full file record from the database
      const file = await filesService.readOne(fileId);
      if (!file) {
        console.warn(`[media-policy-hook] File with ID ${fileId} not found in database.`);
        return;
      }

      // Get uploader's role and user ID
      const { roleId, actorId } = getUploadActor(context.accountability);
      const trustedSvgRole = [ADMIN_ROLE_ID, EDITOR_ROLE_ID].includes(roleId);

      // Normalize folder reference
      const folderId = typeof file.folder === 'object' ? file.folder?.id ?? null : file.folder ?? null;
      const fileToValidate = {
        ...file,
        folder: folderId
      };

      // Perform validation checks
      const validation = validateMediaUpload(fileToValidate, folderIndex, trustedSvgRole);

      const fileSnapshot = {
        id: file.id,
        filename_download: file.filename_download ?? file.filename_disk ?? file.title ?? '',
        type: file.type ?? file.mime_type ?? '',
        filesize: file.filesize ?? file.size ?? 0
      };

      if (!validation.allowed) {
        console.warn(`[media-policy-hook] File upload rejected for file ID ${fileId}: ${validation.reason}`);

        // 1. Write upload_rejected audit event
        try {
          await writeMediaAuditEvent(fullContext.services, schema, {
            ...buildMediaAuditRecord({
              file: fileSnapshot,
              actor: actorId,
              eventType: 'upload_rejected',
              action: 'upload',
              module: validation.module ?? 'unknown',
              reason: validation.reason,
              source: 'directus-hook',
              ipAddress: context.accountability?.ip ?? null,
              userAgent: context.accountability?.userAgent ?? null
            }),
            reason: validation.reason
          });
        } catch (auditErr) {
          console.warn(`[media-policy-hook] Failed to write rejected audit log:`, auditErr.message);
        }

        // 2. Delete the invalid file from DB + disk
        try {
          await filesService.deleteOne(fileId);
          console.log(`[media-policy-hook] Deleted invalid file ${fileId} from database and disk.`);
        } catch (deleteErr) {
          console.error(`[media-policy-hook] Failed to delete invalid file ${fileId}:`, deleteErr.message);
        }

        // 3. Send notification to the uploading user
        if (actorId) {
          try {
            const notificationsService = new NotificationsService({
              schema,
              accountability: null
            });
            await notificationsService.createOne({
              recipient: actorId,
              subject: `⛔ Upload bị từ chối`,
              message: `File "${fileSnapshot.filename_download}" đã bị xóa.\n\nLý do: ${validation.reason}`,
              status: 'inbox'
            });
            console.log(`[media-policy-hook] Notification sent to user ${actorId}.`);
          } catch (notifErr) {
            console.warn(`[media-policy-hook] Failed to send notification:`, notifErr.message);
          }
        }

        return;
      }

      // If allowed, determine module name and write accepted audit log
      const folderName = getFolderNameById(folderIndex, folderId);
      const moduleName = getModuleKeyForFolderName(folderName) ?? 'unknown';

      console.log(`[media-policy-hook] File upload accepted for file ID ${fileId} in module: ${moduleName}`);

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
