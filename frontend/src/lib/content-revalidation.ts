export type ContentCollection =
  | 'products'
  | 'pages'
  | 'blog_posts'
  | 'case_studies'
  | 'regional_hubs'
  | 'documents'
  | 'product_categories'
  | 'partners'
  | 'hero_banners';

export type PublishWebhookEvent = 'items.create' | 'items.update' | 'items.delete';

export interface PublishWebhookPayload {
  event: PublishWebhookEvent;
  collection: ContentCollection;
  id?: string | number;
  keys?: Array<string | number>;
  slug?: string;
  status?: 'published' | 'draft' | 'archived';
  locale?: string;
}

export interface RevalidationTargets {
  tags: string[];
  paths: string[];
}

function normalizeIds(payload: PublishWebhookPayload): string[] {
  const ids = new Set<string>();

  if (payload.id !== undefined && payload.id !== null && String(payload.id).trim()) {
    ids.add(String(payload.id));
  }

  for (const key of payload.keys ?? []) {
    if (key !== undefined && key !== null && String(key).trim()) {
      ids.add(String(key));
    }
  }

  return Array.from(ids);
}

export function requireRevalidateSecret(
  authorization: string | null | undefined = undefined,
  expectedSecret = process.env.REVALIDATE_SECRET
): string {
  if (!expectedSecret) {
    throw new Error('REVALIDATE_SECRET is required for content webhook requests.');
  }

  const received = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : authorization ?? undefined;

  if (!received || received !== expectedSecret) {
    throw new Error('Invalid webhook secret.');
  }

  return received;
}

export function parsePublishWebhookPayload(
  value: unknown
): { ok: true; data: PublishWebhookPayload } | { ok: false; error: Error } {
  if (!value || typeof value !== 'object') {
    return { ok: false, error: new Error('Request body must be an object.') };
  }

  const body = value as Record<string, unknown>;
  const event = body.event;
  const collection = body.collection;

  if (
    event !== 'items.create' &&
    event !== 'items.update' &&
    event !== 'items.delete'
  ) {
    return { ok: false, error: new Error('Unsupported webhook event.') };
  }

  if (
    collection !== 'products' &&
    collection !== 'pages' &&
    collection !== 'blog_posts' &&
    collection !== 'case_studies' &&
    collection !== 'regional_hubs' &&
    collection !== 'documents' &&
    collection !== 'product_categories' &&
    collection !== 'partners' &&
    collection !== 'hero_banners'
  ) {
    return { ok: false, error: new Error('Unsupported content collection.') };
  }

  return {
    ok: true,
    data: {
      event: event as PublishWebhookEvent,
      collection: collection as ContentCollection,
      id: body.id as string | number | undefined,
      keys: Array.isArray(body.keys) ? (body.keys as Array<string | number>) : undefined,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      status:
        body.status === 'published' ||
        body.status === 'draft' ||
        body.status === 'archived'
          ? body.status
          : undefined,
      locale: typeof body.locale === 'string' && body.locale.trim() ? body.locale : 'vi'
    }
  };
}

export function resolveRevalidationTargets(
  payload: PublishWebhookPayload
): RevalidationTargets {
  const locale = payload.locale ?? 'vi';
  const tags = new Set<string>([`col:${payload.collection}`]);
  const paths = new Set<string>();

  for (const id of normalizeIds(payload)) {
    tags.add(`entity:${payload.collection}:${id}`);
  }

  if (payload.collection === 'hero_banners' || payload.collection === 'partners') {
    paths.add(`/${locale}`);
  }

  if (
    payload.collection === 'product_categories' ||
    payload.collection === 'products'
  ) {
    paths.add(`/${locale}/solutions`);
  }

  if (payload.collection === 'products' && payload.slug) {
    paths.add(`/${locale}/products/${payload.slug}`);
  }

  if (payload.collection === 'regional_hubs') {
    paths.add(`/${locale}/regional-hubs`);
  }

  if (
    payload.collection === 'documents' ||
    payload.collection === 'blog_posts' ||
    payload.collection === 'case_studies'
  ) {
    paths.add(`/${locale}/resources`);
  }

  if (payload.collection === 'pages' && payload.slug) {
    paths.add(`/${locale}/${payload.slug}`);
  }

  return {
    tags: Array.from(tags),
    paths: Array.from(paths)
  };
}
