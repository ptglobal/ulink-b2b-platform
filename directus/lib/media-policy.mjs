import path from 'path';

export const MEDIA_POLICY = Object.freeze({
  cleanupCron: '0 12 * * *',
  maxUploadBytes: 10 * 1024 * 1024,
  svgMaxBytes: 2 * 1024 * 1024,
  softDeleteDays: 7,
  orphanGraceHours: 24,
  allowedExtensions: new Set(['jpg', 'jpeg', 'png', 'webp', 'svg', 'pdf', 'docx', 'xlsx']),
  allowedMimeTypes: new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  moduleFolders: Object.freeze({
    products: 'media/products',
    documents: 'media/documents',
    pages: 'media/pages',
    partners: 'media/partners',
    hubs: 'media/regional-hubs',
    settings: 'media/site-settings',
    trash: 'media/trash'
  }),
  collectionModules: Object.freeze({
    product_categories: 'products',
    products: 'products',
    documents: 'documents',
    regional_hubs: 'hubs',
    hub_industrial_zones: 'hubs',
    hub_team_members: 'hubs',
    partners: 'partners',
    industries: 'partners',
    hero_banners: 'pages',
    blog_posts: 'pages',
    case_studies: 'pages',
    pages: 'pages',
    homepage: 'pages',
    site_settings: 'settings',
    iso_certifications: 'documents'
  }),
  trustedSvgRoles: new Set(['admin', 'editor'])
});

export function normalizeMimeType(mime = '') {
  return String(mime).trim().toLowerCase();
}

export function getFileExtension(filename = '') {
  const ext = path.extname(String(filename)).toLowerCase();
  return ext.startsWith('.') ? ext.slice(1) : ext;
}

export function getMediaModuleForCollection(collection) {
  return MEDIA_POLICY.collectionModules[collection] ?? null;
}

export function getMediaFolderForModule(moduleKey) {
  return MEDIA_POLICY.moduleFolders[moduleKey] ?? null;
}

export function getModuleKeyForFolderName(folderName) {
  const normalized = String(folderName ?? '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  for (const [moduleKey, folderPath] of Object.entries(MEDIA_POLICY.moduleFolders)) {
    const leaf = String(folderPath).split('/').pop()?.toLowerCase() ?? '';
    if (leaf === normalized) {
      return moduleKey;
    }
  }

  return null;
}

export function getMaxUploadBytes(mimeOrName) {
  const mime = normalizeMimeType(mimeOrName);
  if (mime === 'image/svg+xml' || getFileExtension(mimeOrName) === 'svg') {
    return MEDIA_POLICY.svgMaxBytes;
  }
  return MEDIA_POLICY.maxUploadBytes;
}

export function isTrustedSvgUploader(roleName) {
  return MEDIA_POLICY.trustedSvgRoles.has(String(roleName || '').toLowerCase());
}

export function validateUploadCandidate(file) {
  const mime = normalizeMimeType(file?.type ?? file?.mime ?? file?.mime_type);
  const filename = file?.filename_download ?? file?.filename_disk ?? file?.filename ?? file?.title ?? '';
  const extension = getFileExtension(filename);
  const filesize = Number(file?.filesize ?? file?.size ?? 0);

  if (!mime || !extension) {
    return { allowed: false, reason: 'Missing mime type or file extension.' };
  }

  if (!MEDIA_POLICY.allowedMimeTypes.has(mime) || !MEDIA_POLICY.allowedExtensions.has(extension)) {
    return { allowed: false, reason: `File type ${extension || mime} is not allowed.` };
  }

  const maxBytes = getMaxUploadBytes(filename || mime);
  if (filesize > maxBytes) {
    return {
      allowed: false,
      reason: `File size ${filesize} exceeds max ${maxBytes} bytes for ${extension}.`
    };
  }

  return {
    allowed: true,
    extension,
    mime,
    maxBytes
  };
}

export function resolveCollectionModule(collection) {
  return getMediaModuleForCollection(collection) ?? 'pages';
}

export function resolveModuleFolder(collection) {
  const moduleKey = resolveCollectionModule(collection);
  return getMediaFolderForModule(moduleKey);
}

export function isOrphanPurgeCandidate(record, now = new Date()) {
  if (!record) return false;
  const createdAt = new Date(record.date_created ?? record.uploaded_on ?? record.created_on ?? 0);
  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  const graceMs = MEDIA_POLICY.orphanGraceHours * 60 * 60 * 1000;
  return now.getTime() - createdAt.getTime() >= graceMs;
}

export function extractFileSnapshot(file = {}) {
  const filename = file.filename_download ?? file.filename_disk ?? file.filename ?? file.title ?? '';
  const mime = normalizeMimeType(file.type ?? file.mime ?? file.mime_type);
  const extension = getFileExtension(filename);
  const sizeBytes = Number(file.filesize ?? file.size ?? 0);

  return {
    id: file.id ?? null,
    filename,
    mime,
    extension,
    sizeBytes,
    folder: file.folder ?? null,
    storage: file.storage ?? null,
    title: file.title ?? null,
    description: file.description ?? null
  };
}

export function buildAuditRecord({
  file,
  actor = null,
  eventType,
  action,
  module = null,
  reason = null,
  source = null,
  ipAddress = null,
  userAgent = null,
  extra = {}
}) {
  const snapshot = extractFileSnapshot(file);

  return {
    file: snapshot.id,
    actor,
    event_type: eventType,
    action,
    module,
    reason,
    source,
    ip_address: ipAddress,
    user_agent: userAgent,
    original_filename: snapshot.filename,
    mime_type: snapshot.mime,
    size_bytes: snapshot.sizeBytes,
    ...extra
  };
}

export function buildRetentionRecord({
  file,
  module,
  state = 'active',
  softDeletedAt = null,
  purgeAfter = null,
  deleteReason = null,
  deletedBy = null,
  hardDeletedAt = null,
  hardDeletedBy = null,
  source = null
}) {
  const snapshot = extractFileSnapshot(file);

  return {
    file: snapshot.id,
    module,
    state,
    soft_deleted_at: softDeletedAt,
    purge_after: purgeAfter,
    delete_reason: deleteReason,
    deleted_by: deletedBy,
    hard_deleted_at: hardDeletedAt,
    hard_deleted_by: hardDeletedBy,
    source,
    original_filename: snapshot.filename,
    mime_type: snapshot.mime,
    size_bytes: snapshot.sizeBytes
  };
}
