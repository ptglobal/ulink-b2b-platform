import { readSingleton } from '@directus/sdk';
import { publicDirectus, type ContentMedia, type HomePage, type HomePageContent } from './directus';

function languageCode(value: string | { code: string }) {
  return typeof value === 'string' ? value : value.code;
}

function assertUniqueMedia(content: HomePageContent) {
  const media: ContentMedia[] = [
    content.hero.image,
    content.materials.image,
    ...(content.about ? [content.about.image] : []),
    ...content.materials.groups.flatMap((group) => (group.image ? [group.image] : []))
  ];
  const paths = new Set<string>();
  const roles = new Set<string>();

  for (const item of media) {
    if (paths.has(item.path)) throw new Error(`Duplicate homepage media path: ${item.path}`);
    if (roles.has(item.role)) throw new Error(`Duplicate homepage media role: ${item.role}`);
    paths.add(item.path);
    roles.add(item.role);
  }
}

export async function getHomePageContent(locale: string): Promise<HomePageContent | null> {
  const homepage = (await publicDirectus.request(
    readSingleton('homepage', {
      fields: ['content', 'translations.languages_code', 'translations.content']
    })
  )) as unknown as HomePage;

  const localized = homepage.translations?.find((translation) => languageCode(translation.languages_code) === locale);
  const vietnamese = homepage.translations?.find((translation) => languageCode(translation.languages_code) === 'vi');
  const content = localized?.content ?? vietnamese?.content ?? homepage.content ?? null;

  if (content) assertUniqueMedia(content);
  return content;
}
