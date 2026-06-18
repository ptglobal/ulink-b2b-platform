import {
  customEndpoint,
  readCollections,
  readFields,
  readRelations,
  readRoles,
  readPolicies,
  readPermissions,
  readItems,
  readSingleton,
  readUsers
} from '@directus/sdk';
import { createDirectusClient, loginAdmin, DIRECTUS_ADMIN_EMAIL, DIRECTUS_URL } from '../lib/config.mjs';
import { listFolders, withDbClient } from '../lib/folder-db.mjs';
import { DEFAULT_LOCALE, LOCALES, TRANSLATION_COLLECTION_NAMES, TRANSLATION_RELATION_DEFS } from '../lib/i18n.mjs';
import { MEDIA_POLICY } from '../lib/media-policy.mjs';
import {
  EDITOR_ROLE_ID,
  SALES_ROLE_ID,
  CUSTOMER_ROLE_ID,
  EDITOR_POLICY_ID,
  SALES_POLICY_ID,
  CUSTOMER_POLICY_ID
} from '../lib/constants.mjs';
import { logInfo, logStep, logPass, logFail, logDone, logFatal } from '../lib/logging.mjs';

const client = createDirectusClient();

async function verify() {
  logInfo(`Connecting to Directus at ${DIRECTUS_URL}`);
  await loginAdmin(client);
  logInfo(`Authenticated as ${DIRECTUS_ADMIN_EMAIL}`);

  let failed = false;

  const assert = (condition, message) => {
    if (condition) {
      logPass(message);
    } else {
      logFail(message);
      failed = true;
    }
  };

  logStep('1/7 Check collections');
  const collections = await client.request(readCollections());
  const collectionNames = collections.map((c) => c.collection);

  const expectedCollections = [
    'languages',
    'hero_banners',
    'partners',
    'product_categories',
    'products',
    'product_skus',
    'documents',
    'regional_hubs',
    'industries',
    'blog_posts',
    'case_studies',
    'iso_certifications',
    'pages',
    'site_settings',
      'homepage',
      'media_retention',
      'media_audit_events',
      'customers',
    'orders',
    'order_items',
    'invoices',
    'deliveries',
    'integration_events',
    'rfq_requests',
    'rfq_assignment_rules',
    'products_industries',
    'products_files',
    ...TRANSLATION_COLLECTION_NAMES
  ];

  for (const name of expectedCollections) {
    assert(collectionNames.includes(name), `Collection "${name}" exists.`);
  }

  const integrationEventFields = await client.request(readFields('integration_events'));
  const integrationEventFieldNames = integrationEventFields.map((field) => field.field);
  const expectedIntegrationEventFields = [
    'id',
    'entity',
    'op',
    'record_id',
    'erp_ref',
    'revision',
    'idempotency_key',
    'payload',
    'status',
    'attempts',
    'next_attempt_at',
    'last_attempt_at',
    'last_status_code',
    'last_error',
    'destination_url'
  ];
  for (const fieldName of expectedIntegrationEventFields) {
    assert(integrationEventFieldNames.includes(fieldName), `integration_events field "${fieldName}" exists.`);
  }

  const customerFields = await client.request(readFields('customers'));
  const customerFieldNames = customerFields.map((field) => field.field);
  const expectedCustomerFields = [
    'id',
    'status',
    'user',
    'erp_ref',
    'company_name',
    'tax_code',
    'contact_name',
    'email',
    'phone',
    'address',
    'sales_owner'
  ];
  for (const fieldName of expectedCustomerFields) {
    assert(customerFieldNames.includes(fieldName), `customers field "${fieldName}" exists.`);
  }

  await withDbClient(async (db) => {
    const result = await db.query(
      `
        select indexname
        from pg_indexes
        where schemaname = current_schema()
          and tablename = 'customers'
          and indexname = any($1::text[])
      `,
      [['customers_erp_ref_key', 'customers_tax_code_key', 'customers_email_key']]
    );
    const indexNames = result.rows.map((row) => row.indexname);
    for (const expectedIndex of ['customers_erp_ref_key', 'customers_tax_code_key', 'customers_email_key']) {
      assert(indexNames.includes(expectedIndex), `Index "${expectedIndex}" exists on customers.`);
    }
  });

  logStep('2/7 Check key relations');
  const relations = await client.request(readRelations());
  const relationKeys = relations.map((r) => `${r.collection}.${r.field}`);

  const expectedRelations = [
    'product_categories.parent',
    'products.category',
    'product_skus.product',
    'documents.product',
    'documents.file',
    'case_studies.industry',
    'customers.user',
    'customers.sales_owner',
    'orders.customer',
    'orders.hub',
    'order_items.order',
    'order_items.sku',
    'invoices.customer',
    'invoices.order',
    'deliveries.order',
    'deliveries.hub',
    'rfq_requests.hub',
    'rfq_requests.assigned_sales',
    'rfq_requests.user',
    'rfq_assignment_rules.hub',
    'rfq_assignment_rules.industry',
    'rfq_assignment_rules.assigned_sales',
      'products_industries.products_id',
      'products_industries.industries_id',
      'products_files.products_id',
      'products_files.directus_files_id',
      'media_retention.file',
      'media_retention.deleted_by',
      'media_retention.hard_deleted_by',
      'media_audit_events.actor',
      ...TRANSLATION_RELATION_DEFS.map((relation) => `${relation.collection}.${relation.field}`)
    ];

  for (const rel of expectedRelations) {
    assert(relationKeys.includes(rel), `Relation "${rel}" exists.`);
  }

  logStep('3/7 Check custom roles');
  const roles = await client.request(readRoles());
  const roleNames = roles.map((r) => r.name);
  const roleIds = roles.map((r) => r.id);

  const expectedRoles = [
    { name: 'Editor', id: EDITOR_ROLE_ID },
    { name: 'Sales', id: SALES_ROLE_ID },
    { name: 'Customer', id: CUSTOMER_ROLE_ID }
  ];

  for (const role of expectedRoles) {
    assert(roleNames.includes(role.name), `Role "${role.name}" exists by name.`);
    assert(roleIds.includes(role.id), `Role "${role.name}" exists by exact ID: ${role.id}`);
  }

  logStep('4/7 Check policies');
  const policies = await client.request(
    readPolicies({
      fields: ['id', 'name', 'app_access', 'admin_access', 'roles', 'permissions']
    })
  );
  const policyById = new Map(policies.map((policy) => [policy.id, policy]));

  const expectedPolicies = [
    {
      name: 'Editor Access Policy',
      id: EDITOR_POLICY_ID,
      roleId: EDITOR_ROLE_ID
    },
    {
      name: 'Sales Access Policy',
      id: SALES_POLICY_ID,
      roleId: SALES_ROLE_ID
    },
    {
      name: 'Customer Portal Access Policy',
      id: CUSTOMER_POLICY_ID,
      roleId: CUSTOMER_ROLE_ID
    }
  ];

  for (const expected of expectedPolicies) {
    const policy = policyById.get(expected.id);
    assert(Boolean(policy), `Policy "${expected.name}" exists by exact ID: ${expected.id}`);
    assert(policy?.name === expected.name, `Policy "${expected.name}" exists by name.`);
    assert(policy?.app_access === true, `Policy "${expected.name}" has app access enabled.`);
    assert(policy?.admin_access === false, `Policy "${expected.name}" does not grant admin access.`);
  }

  const accessResponse = await client.request(
    customEndpoint({
      path: '/access',
      method: 'GET'
    })
  );
  const accesses = accessResponse ?? [];
  for (const expected of expectedPolicies) {
    assert(
      accesses.some((access) => access.role === expected.roleId && access.policy === expected.id),
      `Policy "${expected.name}" is attached to role ${expected.roleId}.`
    );
  }

  logStep('5/7 Check permissions');
  const permissions = await client.request(readPermissions());
  assert(permissions.length > 0, `Permissions count: ${permissions.length} (> 0).`);

  const editorPerms = permissions.filter((p) => p.policy === EDITOR_POLICY_ID);
  const salesPerms = permissions.filter((p) => p.policy === SALES_POLICY_ID);
  const customerPerms = permissions.filter((p) => p.policy === CUSTOMER_POLICY_ID);

  assert(editorPerms.length > 0, `Editor Access Policy has ${editorPerms.length} permissions defined.`);
  assert(salesPerms.length > 0, `Sales Access Policy has ${salesPerms.length} permissions defined.`);
  assert(customerPerms.length > 0, `Customer Portal Access Policy has ${customerPerms.length} permissions defined.`);

  const mediaPerms = permissions.filter((p) => p.collection === 'directus_files');
  const editorFilePerms = mediaPerms.filter((p) => p.policy === EDITOR_POLICY_ID);
  const salesFilePerms = mediaPerms.filter((p) => p.policy === SALES_POLICY_ID);
  assert(
    ['create', 'read', 'update'].every((action) => editorFilePerms.some((perm) => perm.action === action)),
    'Editor policy has create/read/update permissions on directus_files.'
  );
  assert(
    ['create', 'read', 'update'].every((action) => salesFilePerms.some((perm) => perm.action === action)),
    'Sales policy has create/read/update permissions on directus_files.'
  );
  assert(
    !mediaPerms.some((perm) => perm.action === 'delete' && [EDITOR_POLICY_ID, SALES_POLICY_ID].includes(perm.policy)),
    'Editor and Sales do not have native delete permission on directus_files.'
  );

  logStep('6/7 Check singletons');
  const locales = (await client.request(readItems('languages'))).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  assert(locales.length >= 3, `languages has ${locales.length} locale rows.`);
  const actualCodes = locales.slice(0, LOCALES.length).map((locale) => locale.code);
  const expectedCodes = LOCALES.map((locale) => locale.code);
  const isMatch = actualCodes.length === expectedCodes.length && actualCodes.every((val, index) => val === expectedCodes[index]);
  assert(
    isMatch,
    `languages order matches ${expectedCodes.join(', ')}.`
  );
  assert(locales[0]?.code === DEFAULT_LOCALE, `Fallback locale is ${DEFAULT_LOCALE}.`);

  const siteSettings = await client.request(readSingleton('site_settings', { fields: ['*'] }));
  if (!siteSettings || siteSettings.contact_email !== 'contact@ulink.com') {
    logInfo(`site_settings debug: ${JSON.stringify(siteSettings, null, 2)}`);
  }
  assert(siteSettings && siteSettings.contact_email === 'contact@ulink.com', 'site_settings contains expected contact email.');

  const homepage = await client.request(readSingleton('homepage', { fields: ['*'] }));
  if (!homepage || typeof homepage.title !== 'string') {
    logInfo(`homepage debug: ${JSON.stringify(homepage, null, 2)}`);
  }
  assert(homepage && typeof homepage.title === 'string' && homepage.title.includes('ULink'), 'homepage contains expected title text.');
  assert(homepage && typeof homepage.title === 'string' && homepage.title.length > 0, 'Homepage fallback locale content is readable.');

  const homepageTranslations = await client.request(
    readItems('homepage_translations', {
      filter: { languages_code: { _eq: DEFAULT_LOCALE } },
      limit: 1
    })
  );
  assert(homepageTranslations.length > 0, `homepage_translations has a ${DEFAULT_LOCALE} row.`);
  assert(
    typeof homepageTranslations[0]?.title === 'string' && homepageTranslations[0].title.length > 0,
    'Homepage fallback translation row is readable.'
  );

  const siteSettingsTranslations = await client.request(
    readItems('site_settings_translations', {
      filter: { languages_code: { _eq: DEFAULT_LOCALE } },
      limit: 1
    })
  );
  assert(siteSettingsTranslations.length > 0, `site_settings_translations has a ${DEFAULT_LOCALE} row.`);
  assert(
    typeof siteSettingsTranslations[0]?.meta_title === 'string' && siteSettingsTranslations[0].meta_title.length > 0,
    'Site settings fallback translation row is readable.'
  );

  const folderRows = await withDbClient((dbClient) => listFolders(dbClient));
  const rootMediaFolder = folderRows.find((folder) => folder.name === 'media' && !folder.parent);
  assert(Boolean(rootMediaFolder), 'Root media folder exists.');
  for (const folderPath of Object.values(MEDIA_POLICY.moduleFolders)) {
    const [, leaf] = folderPath.split('/');
    assert(
      folderRows.some(
        (folder) =>
          folder.name === leaf &&
          (typeof folder.parent === 'object' ? folder.parent?.id : folder.parent) === rootMediaFolder?.id
      ),
      `Media subfolder "${leaf}" exists under root media folder.`
    );
  }

  logStep('7/7 Check seeded records');
  const industries = await client.request(readItems('industries'));
  assert(industries.length >= 2, `Industries has ${industries.length} seeded items.`);
  assert(industries.some((i) => i.slug === 'electronics'), 'Industry "electronics" exists.');
  assert(industries.some((i) => i.slug === 'pharmaceutical-cosmetics'), 'Industry "pharmaceutical-cosmetics" exists.');

  const products = await client.request(readItems('products'));
  assert(products.length >= 2, `Products has ${products.length} seeded items.`);
  assert(products.some((p) => p.slug === 'nitrile-cleanroom-gloves'), 'Product "nitrile-cleanroom-gloves" exists.');

  const skus = await client.request(readItems('product_skus'));
  assert(skus.length >= 3, `Product SKUs has ${skus.length} seeded items.`);
  assert(skus.some((s) => s.sku_code === 'sku-gloves-nitrile-s'), 'SKU "sku-gloves-nitrile-s" exists.');

  const hubs = await client.request(readItems('regional_hubs'));
  assert(hubs.length >= 2, `Regional Hubs has ${hubs.length} seeded items.`);
  assert(hubs.some((h) => h.slug === 'dong-van-4'), 'Hub "dong-van-4" exists.');

  const users = await client.request(readUsers({
    filter: {
      email: { _eq: 'customer@ulink.com' }
    },
    fields: ['id', 'email']
  }));
  assert(users.length > 0, 'User "customer@ulink.com" exists.');

  const customers = await client.request(readItems('customers'));
  assert(customers.length >= 1, `Customers has ${customers.length} seeded items.`);
  assert(customers.some((c) => c.email === 'customer@ulink.com'), 'Customer "customer@ulink.com" exists.');

  const orders = await client.request(readItems('orders'));
  assert(orders.length >= 1, `Orders has ${orders.length} seeded items.`);
  assert(orders.some((o) => o.code === 'ORD-2026-0001'), 'Order "ORD-2026-0001" exists.');

  const invoices = await client.request(readItems('invoices'));
  assert(invoices.length >= 1, `Invoices has ${invoices.length} seeded items.`);
  assert(invoices.some((i) => i.code === 'INV-2026-0001'), 'Invoice "INV-2026-0001" exists.');

  const deliveries = await client.request(readItems('deliveries'));
  assert(deliveries.length >= 1, `Deliveries has ${deliveries.length} seeded items.`);
  assert(deliveries.some((d) => d.erp_ref === 'ERP-DLV-2026-77001'), 'Delivery "ERP-DLV-2026-77001" exists.');

  if (failed) {
    logFatal('Bootstrap verification failed with one or more checks.');
    process.exit(1);
  }

  logDone('Bootstrap verification passed. Baseline assets and seeds are present.');
  process.exit(0);
}

verify().catch((err) => {
  logFatal('Bootstrap verification crashed.', err);
  process.exit(1);
});
