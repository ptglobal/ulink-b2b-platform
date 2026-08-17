import { readItems } from '@directus/sdk';
import { publicDirectus, type ContentPage, type PagePresentation } from '@/lib/directus';

function languageCode(value: string | { code: string }) {
  return typeof value === 'string' ? value : value.code;
}

export async function getPagePresentation(slug: string, locale: string): Promise<PagePresentation | null> {
  try {
    const rows = (await publicDirectus.request(
      readItems('pages', {
        filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
        fields: [
          'id',
          'slug',
          'content',
          'translations.id',
          'translations.languages_code',
          'translations.content'
        ],
        limit: 1
      })
    )) as unknown as ContentPage[];
    const page = rows[0];
    if (!page) return null;
    const translation = page.translations?.find((item) => languageCode(item.languages_code) === locale);
    return translation?.content || page.content || null;
  } catch {
    return null;
  }
}
