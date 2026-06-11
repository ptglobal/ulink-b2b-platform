import pg from 'pg';

function createDbConfig() {
  return {
    host: process.env.DB_HOST_EXTERNAL || 'localhost',
    port: parseInt(process.env.DB_PORT_EXTERNAL || '5432', 10),
    database: process.env.POSTGRES_DB || 'ulink',
    user: process.env.POSTGRES_USER || 'ulink',
    password: process.env.POSTGRES_PASSWORD
  };
}

export function createDbClient() {
  return new pg.Client(createDbConfig());
}

export async function withDbClient(fn) {
  const client = createDbClient();
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function listFolders(client) {
  const result = await client.query('SELECT id, name, parent FROM directus_folders ORDER BY name ASC');
  return result.rows;
}

export async function ensureFolder(client, name, parentId = null) {
  const existing = await client.query(
    'SELECT id, name, parent FROM directus_folders WHERE name = $1 AND ((parent IS NULL AND $2::uuid IS NULL) OR parent = $2::uuid) LIMIT 1',
    [name, parentId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const created = await client.query(
    'INSERT INTO directus_folders (name, parent) VALUES ($1, $2) RETURNING id, name, parent',
    [name, parentId]
  );

  return created.rows[0];
}

export async function ensureFolderTree(moduleFolders, rootName = 'media') {
  return withDbClient(async (client) => {
    let root = (await client.query(
      'SELECT id, name, parent FROM directus_folders WHERE name = $1 AND parent IS NULL LIMIT 1',
      [rootName]
    )).rows[0] ?? null;

    if (!root) {
      root = await ensureFolder(client, rootName, null);
    }

    for (const folderPath of Object.values(moduleFolders)) {
      const [, leaf] = String(folderPath).split('/');
      if (!leaf) {
        continue;
      }
      await ensureFolder(client, leaf, root.id);
    }

    const folders = await listFolders(client);
    return { root, folders };
  });
}

export async function getFileById(client, fileId) {
  const result = await client.query(
    'SELECT id, filename_download, filename_disk, title, type, filesize, folder, created_on AS date_created FROM directus_files WHERE id = $1 LIMIT 1',
    [fileId]
  );
  return result.rows[0] ?? null;
}

export async function listFilesInFolder(client, folderId) {
  const result = await client.query(
    'SELECT id, filename_download, filename_disk, title, type, filesize, folder, created_on AS date_created FROM directus_files WHERE folder = $1 ORDER BY created_on ASC',
    [folderId]
  );
  return result.rows;
}

export async function deleteFileRecord(client, fileId) {
  const result = await client.query(
    'DELETE FROM directus_files WHERE id = $1 RETURNING id, filename_download, filename_disk, title, type, filesize, folder, created_on AS date_created',
    [fileId]
  );
  return result.rows[0] ?? null;
}
