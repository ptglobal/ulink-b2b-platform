import { readItems, readSingleton, updateItem, updateSingleton } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const client = createDirectusClient();
const heroImage = {
  path: '/images/home/section1/HomeBanner.webp',
  role: 'homepage.hero.cleanroom-production',
  alt: 'Chuyên viên phòng sạch trong khu vực sản xuất công nghiệp ULink Industries'
};

function withFigmaHero(content) {
  if (!content?.hero) return content;
  return { ...content, hero: { ...content.hero, image: { ...content.hero.image, ...heroImage } } };
}

await loginAdmin(client);
const homepage = await client.request(readSingleton('homepage', { fields: ['content'] }));
if (homepage?.content) await client.request(updateSingleton('homepage', { content: withFigmaHero(homepage.content) }));

const translations = await client.request(readItems('homepage_translations', { fields: ['id', 'content'], limit: -1 }));
for (const translation of translations) {
  if (translation.content) await client.request(updateItem('homepage_translations', translation.id, { content: withFigmaHero(translation.content) }));
}

console.log(`Updated homepage Figma hero media in the singleton and ${translations.length} translations.`);
