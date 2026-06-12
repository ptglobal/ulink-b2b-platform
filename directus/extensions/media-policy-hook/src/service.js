import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { MEDIA_POLICY, buildRetentionRecord } from '../../../lib/media-policy.mjs';
import { buildMediaAuditRecord, writeMediaAuditEvent } from './audit.js';
import { getFolderNameById, loadFolderIndex } from './rules.js';
import { getModuleKeyForFolderName } from '../../../lib/media-policy.mjs';

function resolveUploadRoot() {
  return process.env.STORAGE_LOCAL_ROOT || '/directus/uploads';
}

async function buildServices(context) {
  const { services, schema, database } = context;
  const { ItemsService } = services;
  const resolvedSchema = schema ?? (await context.getSchema?.()) ?? null;

  const directusFilesService = new ItemsService('directus_files', {
    schema: resolvedSchema,
    accountability: null
  });
  const retentionService = new ItemsService('media_retention', {
    schema: resolvedSchema,
    accountability: null
  });
  const folderIndex = await loadFolderIndex(database);

  return {
    schema: resolvedSchema,
    database,
    directusFilesService,
    retentionService,
    folderIndex,
    audit: (record) => writeMediaAuditEvent(services, resolvedSchema, record)
  };
}

async function upsertRetention(retentionService, fileId, payload) {
  const existing = await retentionService.readByQuery({
    filter: { file: { _eq: fileId } },
    limit: 1
  });

  if (existing.length > 0) {
    await retentionService.updateOne(existing[0].id, payload);
    return existing[0].id;
  }

  const created = await retentionService.createOne(payload);
  return created.id ?? created;
}

export async function softDeleteFile(context, { fileId, actorId, reason, source }) {
  const { directusFilesService, retentionService, folderIndex, audit, schema } = await buildServices(context);
  const file = await directusFilesService.readOne(fileId);
  const folderName = getFolderNameById(folderIndex, file.folder);
  const moduleName = getModuleKeyForFolderName(folderName) ?? 'pages';
  const trashFolder = folderIndex.moduleFolders.get('trash');

  if (!trashFolder) {
    throw new Error('Trash folder is missing.');
  }

  const now = new Date();
  const purgeAfter = new Date(now.getTime() + MEDIA_POLICY.softDeleteDays * 24 * 60 * 60 * 1000);

  await directusFilesService.updateOne(fileId, {
    folder: trashFolder.id
  });

  await upsertRetention(retentionService, fileId, {
    ...buildRetentionRecord({
      file,
      module: moduleName,
      state: 'soft_deleted',
      softDeletedAt: now.toISOString(),
      purgeAfter: purgeAfter.toISOString(),
      deleteReason: reason,
      deletedBy: actorId,
      source
    }),
    state: 'soft_deleted'
  });

  await audit(
    buildMediaAuditRecord({
      file,
      actor: actorId,
      eventType: 'soft_delete',
      action: 'soft_delete',
      module: moduleName,
      reason,
      source,
      extra: {}
    })
  );

  return { fileId, module: moduleName, purgeAfter: purgeAfter.toISOString() };
}

export async function hardDeleteFile(context, { fileId, actorId, reason, source }) {
  const { directusFilesService, retentionService, database, folderIndex, audit } = await buildServices(context);
  let file = null;

  try {
    file = await directusFilesService.readOne(fileId);
  } catch {
    file = null;
  }

  const retentionRows = await retentionService.readByQuery({
    filter: { file: { _eq: fileId } },
    limit: 1
  });
  const retentionRow = retentionRows[0] ?? null;

  if (retentionRow) {
    await database('media_retention').where({ id: retentionRow.id }).update({ file: null });
  }

  if (file?.filename_disk) {
    const filePath = path.join(resolveUploadRoot(), file.filename_disk);
    try {
      await unlink(filePath);
    } catch {
      // Ignore missing local file. DB cleanup still proceeds.
    }
  }

  await database('directus_files').where({ id: fileId }).delete();
  if (!file && retentionRow?.original_filename) {
    // DB row might be gone already; keep the retention trail.
  }

  const now = new Date();
  const moduleName =
    getModuleKeyForFolderName(file?.folder && getFolderNameById(folderIndex, file.folder)) ||
    retentionRow?.module ||
    'pages';
  const retentionPayload = {
    ...buildRetentionRecord({
      file: file ?? { id: fileId, filename_download: retentionRow?.original_filename, type: retentionRow?.mime_type, filesize: retentionRow?.size_bytes },
      module: moduleName,
      state: 'purged',
      hardDeletedAt: now.toISOString(),
      hardDeletedBy: actorId,
      deleteReason: reason,
      source
    }),
    file: null,
    state: 'purged',
    hard_deleted_at: now.toISOString(),
    hard_deleted_by: actorId
  };

  if (retentionRow) {
    await retentionService.updateOne(retentionRow.id, retentionPayload);
  } else {
    await retentionService.createOne(retentionPayload);
  }

  await audit(
    buildMediaAuditRecord({
      file: file ?? { id: fileId, filename_download: retentionRow?.original_filename, type: retentionRow?.mime_type, filesize: retentionRow?.size_bytes },
      actor: actorId,
      eventType: 'hard_delete',
      action: 'hard_delete',
      module: moduleName,
      reason,
      source
    })
  );

  return { fileId, module: moduleName, purgedAt: now.toISOString() };
}

export async function createMediaServices(context) {
  return buildServices(context);
}
