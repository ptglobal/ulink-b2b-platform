const LIST_O2M_FIELD = {
  type: 'alias',
  meta: {
    interface: 'list-o2m',
    special: ['o2m']
  }
};

const M2O_FIELD = {
  type: 'integer',
  meta: {
    interface: 'select-dropdown-m2o',
    special: ['m2o']
  }
};

export const DEFAULT_LOCALE = 'vi';

export const LOCALES = [
  { code: 'vi', name: 'Vietnamese', direction: 'ltr', sort: 1 },
  { code: 'en', name: 'English', direction: 'ltr', sort: 2 },
  { code: 'ja', name: 'Japanese', direction: 'ltr', sort: 3 }
];

export const TRANSLATABLE_COLLECTIONS = [
  'hero_banners',
  'partners',
  'product_categories',
  'products',
  'industries',
  'regional_hubs',
  'blog_posts',
  'case_studies',
  'iso_certifications',
  'pages',
  'site_settings',
  'homepage'
];

export const TRANSLATION_FIELDS = {
  hero_banners: [
    { field: 'title', type: 'string', meta: { interface: 'input' } },
    { field: 'subtitle', type: 'text', meta: { interface: 'textarea' } },
    { field: 'cta_label', type: 'string', meta: { interface: 'input' } }
  ],
  partners: [{ field: 'name', type: 'string', meta: { interface: 'input' } }],
  product_categories: [
    { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'description', type: 'text', meta: { interface: 'textarea' } },
    { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
    { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
  ],
  products: [
    { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'short_description', type: 'text', meta: { interface: 'textarea' } },
    { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
    { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
  ],
  industries: [
    { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'description', type: 'text', meta: { interface: 'textarea' } }
  ],
  regional_hubs: [
    { field: 'name', type: 'string', meta: { interface: 'input', required: true } }
  ],
  blog_posts: [
    { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
    { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
    { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
  ],
  case_studies: [
    { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'summary', type: 'text', meta: { interface: 'textarea' } },
    { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } }
  ],
  iso_certifications: [
    { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'issuer', type: 'string', meta: { interface: 'input' } }
  ],
  pages: [
    { field: 'title', type: 'string', meta: { interface: 'input', required: true } },
    { field: 'body', type: 'text', meta: { interface: 'wysiwyg' } },
    { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
    { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } }
  ],
  site_settings: [
    { field: 'meta_title', type: 'string', meta: { interface: 'input' } },
    { field: 'meta_description', type: 'text', meta: { interface: 'textarea' } },
    { field: 'address', type: 'text', meta: { interface: 'textarea' } }
  ],
  homepage: [{ field: 'title', type: 'string', meta: { interface: 'input' } }]
};

function cloneField(field) {
  return {
    field: field.field,
    type: field.type,
    meta: field.meta ? { ...field.meta } : undefined,
    schema: field.schema ? { ...field.schema } : undefined
  };
}

export function translationCollectionName(collection) {
  return `${collection}_translations`;
}

export function translationSourceField(collection) {
  return `${collection}_id`;
}

export function createLanguageCollectionDef() {
  return {
    collection: 'languages',
    meta: { icon: 'language', note: 'Languages', sort_field: 'sort' },
    schema: {},
    fields: [
      {
        field: 'code',
        type: 'string',
        meta: { interface: 'input', required: true, width: 'half' },
        schema: { is_primary_key: true }
      },
      {
        field: 'sort',
        type: 'integer',
        meta: { interface: 'input', hidden: true },
        schema: { default_value: 1 }
      },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true, width: 'half' } },
      {
        field: 'direction',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Left to Right', value: 'ltr' },
              { text: 'Right to Left', value: 'rtl' }
            ]
          },
          width: 'half'
        },
        schema: { default_value: 'ltr' }
      }
    ]
  };
}

export function createTranslationCollectionDef(collection) {
  const fields = TRANSLATION_FIELDS[collection];
  if (!fields) {
    throw new Error(`Missing translation field map for collection: ${collection}`);
  }

  return {
    collection: translationCollectionName(collection),
    meta: { hidden: true, note: `${collection} translations` },
    schema: {},
    fields: [
      {
        field: 'id',
        type: 'integer',
        meta: { hidden: true, readonly: true, interface: 'input' },
        schema: { is_primary_key: true, has_auto_increment: true }
      },
      {
        field: translationSourceField(collection),
        ...M2O_FIELD,
        meta: { ...M2O_FIELD.meta, required: true }
      },
      {
        field: 'languages_code',
        type: 'string',
        meta: {
          interface: 'select-dropdown-m2o',
          special: ['m2o'],
          required: true
        }
      },
      ...fields.map(cloneField)
    ]
  };
}

export function createTranslationRelationDefs(collection) {
  return [
    {
      collection: translationCollectionName(collection),
      field: translationSourceField(collection),
      related_collection: collection,
      meta: { one_field: 'translations' }
    },
    {
      collection: translationCollectionName(collection),
      field: 'languages_code',
      related_collection: 'languages'
    }
  ];
}

export const LANGUAGE_COLLECTION_DEF = createLanguageCollectionDef();
export const TRANSLATION_COLLECTION_DEFS = TRANSLATABLE_COLLECTIONS.map(createTranslationCollectionDef);
export const TRANSLATION_RELATION_DEFS = TRANSLATABLE_COLLECTIONS.flatMap(createTranslationRelationDefs);
export const TRANSLATION_COLLECTION_NAMES = TRANSLATABLE_COLLECTIONS.map(translationCollectionName);

export function createTranslationAliasField() {
  return {
    field: 'translations',
    ...LIST_O2M_FIELD
  };
}
