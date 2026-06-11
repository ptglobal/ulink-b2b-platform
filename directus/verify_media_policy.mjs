import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createDirectus,
  rest,
  authentication,
  readItems,
  readUsers,
  createUser,
  customEndpoint,
  uploadFiles,
  updateItem
} from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from './config.mjs';
import { ensureFolderTree, getFileById, withDbClient } from './lib/folder-db.mjs';
import { MEDIA_POLICY } from './lib/media-policy.mjs';
import { SALES_ROLE_ID } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminClient = createDirectusClient();

function log(message) {
  console.log(`[media-policy] ${message}`);
}

function makePngFile(name = 'policy-test.png') {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9kqXQAAAAASUVORK5CYII=',
    'base64'
  );
  return new File([png], name, { type: 'image/png' });
}

function makePdfFile(name = 'policy-test.pdf') {
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF', 'utf8');
  return new File([pdf], name, { type: 'application/pdf' });
}

function makeSvgFile(name = 'policy-test.svg') {
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><script>alert(1)</script><rect width="1" height="1"/></svg>',
    'utf8'
  );
  return new File([svg], name, { type: 'image/svg+xml' });
}

function makeOversizeFile(name = 'policy-oversize.png') {
  const bytes = Buffer.alloc(MEDIA_POLICY.maxUploadBytes + 1024, 0x61);
  return new File([bytes], name, { type: 'image/png' });
}

function getFolderId(folders, name, parentId = null) {
  return folders.find((folder) => {
    const folderParentId = typeof folder.parent === 'object' ? folder.parent?.id ?? null : folder.parent ?? null;
    return folder.name === name && folderParentId === parentId;
  })?.id;
}

async function ensureMediaFolders(client) {
  const result = await ensureFolderTree(MEDIA_POLICY.moduleFolders, 'media');
  return { folders: result.folders, rootId: result.root?.id ?? null };
}

async function ensureSalesTestUser() {
  const email = `media-policy-sales-${Date.now()}@example.com`;
  const password = 'MediaPolicy#2026!';
  const created = await adminClient.request(
    createUser({
      email,
      password,
      first_name: 'Media',
      last_name: 'Policy',
      role: SALES_ROLE_ID,
      status: 'active'
    })
  );

  const client = createDirectus(DIRECTUS_URL).with(authentication('json')).with(rest());
  await client.login(email, password);

  return { email, password, id: created.id, client };
}

async function uploadFile(client, file, folderId, title) {
  const formData = new FormData();
  formData.append('folder', folderId);
  formData.append('title', title);
  formData.append('file', file);
  const result = await client.request(uploadFiles(formData));
  return Array.isArray(result) ? result[0] : result?.data?.[0] ?? result?.data ?? result;
}

async function callMediaEndpoint(client, route, body) {
  return client.request(
    customEndpoint({
      path: `/media-policy/${route}`,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  );
}

async function expectUploadFailure(client, file, folderId, label) {
  try {
    await uploadFile(client, file, folderId, label);
    assert.fail(`${label} should have been rejected.`);
  } catch (error) {
    log(`${label} rejected as expected: ${error.message}`);
  }
}

async function main() {
  await loginAdmin(adminClient);
  log(`Authenticated as ${DIRECTUS_ADMIN_EMAIL} @ ${DIRECTUS_URL}`);

  const { folders, rootId } = await ensureMediaFolders(adminClient);
  const productsFolderId = getFolderId(folders, 'products', rootId);
  const documentsFolderId = getFolderId(folders, 'documents', rootId);
  const partnersFolderId = getFolderId(folders, 'partners', rootId);
  const trashFolderId = getFolderId(folders, 'trash', rootId);

  assert(rootId, 'media root folder exists');
  assert(productsFolderId, 'media/products folder exists');
  assert(documentsFolderId, 'media/documents folder exists');
  assert(partnersFolderId, 'media/partners folder exists');
  assert(trashFolderId, 'media/trash folder exists');

  const salesUser = await ensureSalesTestUser();
  log(`Created sales test user ${salesUser.email}`);

  const png = makePngFile();
  const pdf = makePdfFile();
  const svg = makeSvgFile();
  const oversize = makeOversizeFile();

  const pngUpload = await uploadFile(salesUser.client, png, productsFolderId, 'policy-png');
  assert(pngUpload?.id, 'PNG upload succeeded');

  const pdfUpload = await uploadFile(salesUser.client, pdf, documentsFolderId, 'policy-pdf');
  assert(pdfUpload?.id, 'PDF upload succeeded');

  await expectUploadFailure(salesUser.client, oversize, productsFolderId, 'oversize upload');
  await expectUploadFailure(salesUser.client, svg, partnersFolderId, 'untrusted SVG upload');

  const softDeleteResult = await callMediaEndpoint(salesUser.client, 'soft-delete', {
    fileId: pngUpload.id,
    reason: 'policy test',
    source: 'verify-media-policy'
  });
  const softDeleteFileId = softDeleteResult?.data?.fileId ?? softDeleteResult?.fileId ?? softDeleteResult?.data?.data?.fileId;
  assert.equal(softDeleteFileId, pngUpload.id, 'Soft delete endpoint returned the file id');

  const movedFile = await withDbClient((dbClient) => getFileById(dbClient, pngUpload.id));
  const movedFolderId = typeof movedFile.folder === 'object' ? movedFile.folder?.id ?? null : movedFile.folder ?? null;
  assert.equal(movedFolderId, trashFolderId, 'Soft-deleted file moved into trash folder');

  const retentionAfterSoftDelete = (
    await adminClient.request(
      readItems('media_retention', {
        filter: { file: { _eq: pngUpload.id } },
        limit: 1
      })
    )
  )[0];
  assert(retentionAfterSoftDelete, 'Retention row created on soft delete');
  assert.equal(retentionAfterSoftDelete.state, 'soft_deleted', 'Retention row marked soft_deleted');

  await adminClient.request(updateItem('media_retention', retentionAfterSoftDelete.id, { purge_after: '2000-01-01T00:00:00.000Z' }));

  const cleanupRun = spawnSync('node', ['media-cleanup.mjs'], {
    cwd: __dirname,
    encoding: 'utf8',
    env: process.env
  });
  assert.equal(cleanupRun.status, 0, `Cleanup job completed: ${cleanupRun.stdout || cleanupRun.stderr}`);

  const retainedAfterCleanup = await withDbClient((dbClient) => getFileById(dbClient, pngUpload.id));
  assert.equal(retainedAfterCleanup, null, 'Cleanup job removed soft-deleted file');

  const retentionMatches = await adminClient.request(
    readItems('media_retention', {
      filter: {
        original_filename: { _eq: pngUpload.filename_download ?? 'policy-test.png' },
        delete_reason: { _eq: 'policy test' }
      },
      limit: -1
    })
  );
  const retentionAfterCleanup = retentionMatches.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).find((row) => row.state === 'purged') ?? retentionMatches[0];
  assert(retentionAfterCleanup, 'Retention row kept after cleanup');
  assert.equal(retentionAfterCleanup.state, 'purged', 'Retention row marked purged');

  const pdfHardDeleteTarget = await uploadFile(salesUser.client, makePdfFile('policy-delete.pdf'), documentsFolderId, 'policy-delete');
  assert(pdfHardDeleteTarget?.id, 'Second PDF upload succeeded');

  const hardDeleteResult = await callMediaEndpoint(adminClient, 'hard-delete', {
    fileId: pdfHardDeleteTarget.id,
    confirmHardDelete: true,
    confirmFileId: pdfHardDeleteTarget.id,
    reason: 'manual cleanup',
    source: 'verify-media-policy'
  });
  const hardDeleteFileId = hardDeleteResult?.data?.fileId ?? hardDeleteResult?.fileId ?? hardDeleteResult?.data?.data?.fileId;
  assert.equal(hardDeleteFileId, pdfHardDeleteTarget.id, 'Hard delete endpoint returned the file id');

  const hardDeleteRemaining = await withDbClient((dbClient) => getFileById(dbClient, pdfHardDeleteTarget.id));
  assert.equal(hardDeleteRemaining, null, 'Hard delete removed file record');

  const auditRows = await adminClient.request(
    readItems('media_audit_events', {
      filter: {
        file: { _in: [pngUpload.id, pdfHardDeleteTarget.id] }
      },
      fields: ['*'],
      limit: -1
    })
  );
  assert(auditRows.some((row) => row.event_type === 'upload_accepted'), 'Audit logs upload acceptance');
  assert(auditRows.some((row) => row.event_type === 'soft_delete'), 'Audit logs soft delete');
  assert(auditRows.some((row) => row.event_type === 'hard_delete' || row.event_type === 'cleanup_retention_purge'), 'Audit logs hard delete or cleanup purge');

  for (const row of auditRows) {
    assert(row.original_filename, 'Audit row stores original filename');
    assert(row.mime_type, 'Audit row stores mime type');
    assert(row.size_bytes >= 0, 'Audit row stores file size');
    assert(row.action, 'Audit row stores action');
    assert(row.source, 'Audit row stores source');
  }

  log('Media policy verification passed.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Media policy verification failed:', error);
  process.exit(1);
});
