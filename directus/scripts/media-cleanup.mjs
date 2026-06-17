import { readItems, createItem, updateItem } from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from '../lib/config.mjs';
import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { deleteFileRecord, getFileById, listFilesInFolder, listFolders, withDbClient } from '../lib/folder-db.mjs';
import {
  buildAuditRecord,
  buildRetentionRecord,
  extractFileSnapshot,
  isOrphanPurgeCandidate
} from '../lib/media-policy.mjs';

const client = createDirectusClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadRoot = path.resolve(__dirname, '../uploads');

function parseArgs(argv) {
  return new Set(argv.slice(2));
}

async function loadFolders() {
  const folders = await withDbClient((dbClient) => listFolders(dbClient));

  const root = folders.find((folder) => folder.name === 'media' && (folder.parent == null || folder.parent === ''));
  const trash = folders.find((folder) => {
    const parentId = typeof folder.parent === 'object' ? folder.parent?.id ?? null : folder.parent ?? null;
    return root && parentId === root.id && folder.name === 'trash';
  });

  return { folders, root, trash };
}

async function writeAudit(record) {
  await client.request(createItem('media_audit_events', record));
}

async function markRetentionPurged(retentionRow, file, actorId, reason, source) {
  const now = new Date().toISOString();
  const payload = {
    ...buildRetentionRecord({
      file: file ?? { id: retentionRow.file?.id ?? retentionRow.file ?? null, filename_download: retentionRow.original_filename, type: retentionRow.mime_type, filesize: retentionRow.size_bytes },
      module: retentionRow.module ?? 'pages',
      state: 'purged',
      hardDeletedAt: now,
      hardDeletedBy: actorId,
      deleteReason: reason ?? retentionRow.delete_reason ?? null,
      source: source ?? retentionRow.source ?? 'cleanup-job'
    }),
    file: null,
    state: 'purged',
    hard_deleted_at: now,
    hard_deleted_by: actorId
  };

  await client.request(updateItem('media_retention', retentionRow.id, payload));
}

async function purgeFileById(fileId, { actorId, reason, source, label, module = null }) {
  const file = await withDbClient((dbClient) => getFileById(dbClient, fileId));
  const fileRecord = file ?? { id: fileId };
  const snapshot = extractFileSnapshot(fileRecord);

  try {
    await withDbClient(async (dbClient) => {
      const deleted = await deleteFileRecord(dbClient, fileId);
      const filenameDisk = deleted?.filename_disk ?? fileRecord.filename_disk ?? null;
      if (filenameDisk) {
        try {
          await unlink(path.join(localUploadRoot, filenameDisk));
        } catch {
          // Ignore missing physical file. DB cleanup still proceeds.
        }
      }
    });
  } catch (error) {
    console.log(`Skip physical purge for file ${fileId}: ${error.message}`);
  }

  await writeAudit(
    buildAuditRecord({
      file: fileRecord,
      actor: actorId,
      eventType: label ?? 'cleanup_purge',
      action: 'hard_delete',
      module,
      reason,
      source,
      extra: {}
    })
  );

  return fileRecord;
}

async function main() {
  const args = parseArgs(process.argv);
  const dryRun = args.has('--dry-run');

  await loginAdmin(client);
  console.log(`Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  const now = new Date();
  const cutoff = now.toISOString();

  const { trash } = await loadFolders();
  if (!trash) {
    throw new Error('Trash folder media/trash is missing.');
  }

  const retentionRows = await client.request(
    readItems('media_retention', {
      filter: {
        state: { _eq: 'soft_deleted' },
        purge_after: { _lte: cutoff }
      },
      fields: ['*'],
      limit: -1
    })
  );

  let purgedCount = 0;
  for (const row of retentionRows) {
    const fileId = typeof row.file === 'object' ? row.file?.id ?? null : row.file ?? null;
    if (!fileId) {
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] purge soft-deleted file ${fileId} from retention row ${row.id}`);
      continue;
    }

    await withDbClient(async (dbClient) => {
      await dbClient.query('UPDATE media_retention SET file = NULL WHERE id = $1', [row.id]);
    });
    const fileRecord = await purgeFileById(fileId, {
      actorId: null,
      reason: row.delete_reason ?? 'retention expired',
      source: 'cleanup-job',
      label: 'cleanup_retention_purge',
      module: row.module ?? null
    });
    await markRetentionPurged(row, fileRecord, null, row.delete_reason ?? 'retention expired', 'cleanup-job');
    purgedCount += 1;
    console.log(`Purged retained file ${fileId}`);
  }

  const trashFiles = await withDbClient((dbClient) => listFilesInFolder(dbClient, trash.id));

  const retentionIndex = new Map(
    retentionRows.map((row) => {
      const fileId = typeof row.file === 'object' ? row.file?.id ?? null : row.file ?? null;
      return [fileId, row];
    })
  );

  for (const file of trashFiles) {
    if (!isOrphanPurgeCandidate(file, now)) {
      continue;
    }

    const retentionRow = retentionIndex.get(file.id);
    if (retentionRow) {
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] purge orphan trash file ${file.id}`);
      continue;
    }

    await purgeFileById(file.id, {
      actorId: null,
      reason: 'orphan cleanup',
      source: 'cleanup-job',
      label: 'cleanup_orphan_purge',
      module: 'trash'
    });
    purgedCount += 1;
    console.log(`Purged orphan file ${file.id}`);
  }

  if (dryRun) {
    console.log(`Dry run complete. ${retentionRows.length} retained file(s) eligible, ${trashFiles.length} trash file(s) scanned.`);
  } else {
    console.log(`Cleanup complete. Purged ${purgedCount} file(s).`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Media cleanup failed:', error);
  process.exit(1);
});
