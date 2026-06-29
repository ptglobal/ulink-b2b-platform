import {
  MEDIA_POLICY,
  getModuleKeyForFolderName,
  validateUploadCandidate
} from '../../../lib/media-policy.mjs';

const TRUSTED_SVG_FOLDERS = new Set(['partners', 'pages', 'settings']);

export async function loadFolderIndex(database) {
  const folders = await database('directus_folders').select('id', 'name', 'parent');
  const root = folders.find((folder) => folder.name === 'media' && (folder.parent == null || folder.parent === ''));
  const moduleFolders = new Map();

  if (root) {
    for (const folder of folders) {
      const parentId = typeof folder.parent === 'object' ? folder.parent?.id ?? null : folder.parent ?? null;
      if (parentId === root.id && folder.name !== 'trash') {
        moduleFolders.set(folder.name, folder);
      }
    }
    const trashFolder = folders.find((folder) => {
      const parentId = typeof folder.parent === 'object' ? folder.parent?.id ?? null : folder.parent ?? null;
      return parentId === root.id && folder.name === 'trash';
    });
    if (trashFolder) {
      moduleFolders.set('trash', trashFolder);
    }
  }

  return { root, moduleFolders, folders };
}

export function getFolderNameById(folderIndex, folderId) {
  if (!folderIndex?.moduleFolders || !folderId) {
    return null;
  }

  for (const [name, folder] of folderIndex.moduleFolders.entries()) {
    if (folder.id === folderId) {
      return name;
    }
  }

  return null;
}

export function resolveAllowedModuleForCollection(collection) {
  return MEDIA_POLICY.collectionModules[collection] ?? 'pages';
}

export function validateMediaUpload(payload, folderIndex, trustedSvgRole) {
  const candidate = validateUploadCandidate(payload);
  if (!candidate.allowed) {
    return candidate;
  }

  const folderId = payload?.folder ?? null;
  if (!folderId) {
    return {
      allowed: false,
      reason: 'Folder is required. Choose a module folder under media/.'
    };
  }

  const folderName = getFolderNameById(folderIndex, folderId);
  if (!folderName || folderName === 'trash') {
    return {
      allowed: false,
      reason: 'Folder must be one of the approved module folders.'
    };
  }

  const moduleKey = getModuleKeyForFolderName(folderName);
  if (!moduleKey) {
    return {
      allowed: false,
      reason: 'Folder must resolve to a supported media module.'
    };
  }

  if (folderName === 'documents' && candidate.extension !== 'pdf') {
    return {
      allowed: false,
      reason: 'Only PDF documents (.pdf) are allowed in the documents folder.'
    };
  }

  if (candidate.extension === 'svg') {
    const trustedSvg = Boolean(trustedSvgRole) && TRUSTED_SVG_FOLDERS.has(folderName);
    if (!trustedSvg) {
      return {
        allowed: false,
        reason: 'SVG uploads are restricted to internal brand folders and trusted roles.'
      };
    }
  }

  return {
    allowed: true,
    folderName,
    module: moduleKey,
    ...candidate
  };
}

export function getUploadActor(accountability) {
  return {
    actorId: accountability?.user ?? null,
    roleId: accountability?.role ?? null
  };
}

export function getUploadModule(folderName) {
  return folderName ?? 'pages';
}

export function getAllowedModuleFolderNames() {
  return new Set(
    Object.values(MEDIA_POLICY.moduleFolders)
      .map((folderPath) => folderPath.split('/')[1])
      .filter(Boolean)
  );
}
