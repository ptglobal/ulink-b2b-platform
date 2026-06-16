import {
  createCollection,
  createRelation,
  createRoles,
  createPermissions,
  updatePermission,
  createUser,
  readUsers,
  createItem,
  readItems,
  readPermissions,
  deletePermissions,
  createPolicy,
  customEndpoint,
  readSingleton,
  updateSingleton
} from '@directus/sdk';
import { translationCollectionName, translationSourceField } from './i18n.mjs';

export function createEnsureHelpers(client) {
  async function ensureCollection(def) {
    try {
      await client.request(createCollection(def));
      console.log(`+  Collection: ${def.collection} (created)`);
    } catch {
      console.log(`=  Collection: ${def.collection} (already exists / skipped)`);
    }
  }

  async function ensureRelation(def) {
    try {
      await client.request(createRelation(def));
      console.log(`+  Relation: ${def.collection}.${def.field} (created)`);
    } catch {
      console.log(`=  Relation: ${def.collection}.${def.field} (already exists / skipped)`);
    }
  }

  async function ensureRole(def) {
    try {
      const result = await client.request(createRoles([def]));
      console.log(`+  Role: ${def.name} (created)`);
      return result[0].id;
    } catch {
      console.log(`=  Role: ${def.name} (already exists / skipped)`);
      return def.id;
    }
  }

  async function ensurePolicy(def) {
    try {
      const result = await client.request(createPolicy(def));
      console.log(`+  Policy: ${def.name} (created)`);
      return result.id;
    } catch {
      console.log(`=  Policy: ${def.name} (already exists / skipped)`);
      return def.id;
    }
  }

  async function ensureAccess(def) {
    const accesses = await client.request(
      customEndpoint({
        path: '/access',
        method: 'GET'
      })
    );
    const existing = accesses.find((access) => access.role === def.role && access.policy === def.policy);

    if (existing) {
      console.log(`=  Access Mapping: policy ${def.policy} to role ${def.role} (already exists)`);
      return;
    }

    await client.request(
      customEndpoint({
        path: '/access',
        method: 'POST',
        body: JSON.stringify(def),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    const refreshedAccesses = await client.request(
      customEndpoint({
        path: '/access',
        method: 'GET'
      })
    );
    const created = refreshedAccesses.find((access) => access.role === def.role && access.policy === def.policy);
    if (!created) {
      throw new Error(`Failed to attach policy ${def.policy} to role ${def.role}`);
    }

    console.log(`+  Access Mapping: policy ${def.policy} to role ${def.role} (attached)`);
  }

  async function ensurePermission(def) {
    const permissions = await listPermissions();
    const matches = permissions.filter(
      (p) => p.policy === def.policy && p.collection === def.collection && p.action === def.action
    );

    if (matches.length > 0) {
      const [primary, ...duplicates] = matches;

      if (duplicates.length > 0) {
        const duplicateIds = duplicates.map((d) => d.id).filter(Boolean);
        await deletePermissionIds(duplicateIds);
        console.log(`-  Deleted ${duplicates.length} duplicate permission(s) for ${def.collection}:${def.action} under policy ${def.policy}`);
      }

      const isFieldsMatch = JSON.stringify(primary.fields) === JSON.stringify(def.fields ?? ['*']);
      const isPermsMatch = JSON.stringify(primary.permissions ?? {}) === JSON.stringify(def.permissions ?? {});
      const isValidationMatch = JSON.stringify(primary.validation ?? null) === JSON.stringify(def.validation ?? null);
      const isPresetsMatch = JSON.stringify(primary.presets ?? null) === JSON.stringify(def.presets ?? null);

      if (isFieldsMatch && isPermsMatch && isValidationMatch && isPresetsMatch) {
        console.log(`=  Permission: ${def.collection}:${def.action} for policy ID ${def.policy} (already up-to-date)`);
        return;
      }

      await client.request(updatePermission(primary.id, def));
      console.log(`~  Permission: ${def.collection}:${def.action} for policy ID ${def.policy} (updated fields/rules)`);
    } else {
      await client.request(createPermissions([def]));
      console.log(`+  Permission: ${def.collection}:${def.action} for policy ID ${def.policy} (created)`);
    }
  }

  async function listPermissions() {
    return client.request(readPermissions());
  }

  async function deletePermissionIds(ids) {
    if (!ids.length) {
      return;
    }

    await client.request(deletePermissions(ids));
  }

  async function ensureUser(data) {
    const existing = await client.request(readUsers({ filter: { email: { _eq: data.email } } }));
    if (existing.length > 0) {
      console.log(`=  User: ${data.email} (exists, skipped)`);
      return existing[0].id;
    }
    try {
      const created = await client.request(createUser(data));
      console.log(`+  User: ${data.email} (created)`);
      return created.id;
    } catch (err) {
      const msg = err?.errors?.[0]?.message ?? err?.message ?? '';
      if (msg.includes('unique') || msg.includes('already')) {
        const all = await client.request(readUsers({ limit: -1 }));
        const match = all.find(u => u.email === data.email);
        if (match) {
          console.log(`=  User: ${data.email} (exists, skipped)`);
          return match.id;
        }
      }
      throw err;
    }
  }

  async function ensureItem(collection, uniqueField, data) {
    const filter = {
      [uniqueField]: { _eq: data[uniqueField] }
    };
    const existing = await client.request(readItems(collection, { filter }));
    if (existing.length > 0) {
      console.log(`=  Seed Item in ${collection} [${data[uniqueField]}] (exists, skipped)`);
      return existing[0].id;
    }
    try {
      const created = await client.request(createItem(collection, data));
      console.log(`+  Seed Item in ${collection} [${data[uniqueField]}] (created)`);
      return created.id;
    } catch (err) {
      const msg = err?.errors?.[0]?.message ?? err?.message ?? '';
      if (msg.includes('unique')) {
        const all = await client.request(readItems(collection, { limit: -1 }));
        const match = all.find(item => item[uniqueField] === data[uniqueField]);
        if (match) {
          console.log(`=  Seed Item in ${collection} [${data[uniqueField]}] (exists, skipped)`);
          return match.id;
        }
      }
      throw err;
    }
  }

  async function ensureTranslation(collection, sourceId, languageCode, data) {
    const translationCollection = translationCollectionName(collection);
    const sourceField = translationSourceField(collection);
    const filter = {
      [sourceField]: { _eq: sourceId },
      languages_code: { _eq: languageCode }
    };
    const existing = await client.request(readItems(translationCollection, { filter }));
    const payload = {
      [sourceField]: sourceId,
      languages_code: languageCode,
      ...data
    };

    if (existing.length > 0) {
      console.log(`=  Translation in ${translationCollection} [${sourceId}:${languageCode}] (exists, skipped)`);
      return existing[0].id;
    }

    const created = await client.request(createItem(translationCollection, payload));
    console.log(`+  Translation in ${translationCollection} [${sourceId}:${languageCode}] (created)`);
    return created.id;
  }

  async function ensureSingleton(collection, data) {
    try {
      const existing = await client.request(readSingleton(collection));
      if (existing && existing.id) {
        console.log(`=  Singleton in ${collection} (exists, skipped)`);
        return existing.id;
      }
    } catch {
      // fall through to upsert
    }

    const updated = await client.request(updateSingleton(collection, data));
    console.log(`+  Singleton in ${collection} (created/upserted)`);
    return updated.id;
  }

  async function getPublicPolicyId() {
    const policies = await client.request(customEndpoint({ path: '/policies', method: 'GET' }));
    const publicPolicy = policies.find((p) => p.name === '$t:public_label');
    if (!publicPolicy) {
      throw new Error('Could not find system public policy in Directus.');
    }
    return publicPolicy.id;
  }

  return {
    ensureCollection,
    ensureRelation,
    ensureRole,
    ensurePolicy,
    ensureAccess,
    ensurePermission,
    listPermissions,
    deletePermissionIds,
    ensureUser,
    ensureItem,
    ensureTranslation,
    ensureSingleton,
    getPublicPolicyId
  };
}
