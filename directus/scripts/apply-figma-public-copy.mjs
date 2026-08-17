import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readItems, updateItem } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '../../frontend/messages');
const client = createDirectusClient();

const customSolutions = {
  vi: {
    eyebrow: 'GIẢI PHÁP THEO YÊU CẦU',
    title: 'Giải pháp thiết kế riêng cho Doanh nghiệp',
    description:
      'Giải pháp đóng gói thông minh được thiết kế riêng theo sản phẩm, điều kiện vận chuyển và mục tiêu tối ưu chi phí của từng doanh nghiệp. ULink đồng hành từ khảo sát, thử mẫu đến chuẩn hóa quy cách và triển khai sản xuất.',
    cta: 'Kết nối với Chúng tôi',
    imageAlt: 'Dây chuyền đóng gói tự động được thiết kế riêng bởi ULink Industries'
  },
  en: {
    eyebrow: 'ENGINEERED TO REQUIREMENT',
    title: 'Solutions engineered for your business',
    description:
      'Smart packaging systems are engineered around each product, transport condition and cost target. ULink supports the full journey from assessment and sampling to specification approval and production rollout.',
    cta: 'Talk to our team',
    imageAlt: 'ULink custom automated industrial packaging line'
  },
  ja: {
    eyebrow: 'カスタムソリューション',
    title: '企業ごとに設計する専用ソリューション',
    description:
      '製品、輸送条件、コスト目標に合わせて包装システムを個別設計します。調査、試作品、仕様承認から量産展開まで ULink が一貫して支援します。',
    cta: 'お問い合わせ',
    imageAlt: 'ULink が設計した自動包装ライン'
  }
};

async function readSolutionsCopy(locale) {
  const messages = JSON.parse(await readFile(join(messagesDir, `${locale}.json`), 'utf8'));
  return { ...messages.solutions, customSolution: customSolutions[locale] };
}

function localeCode(value) {
  return typeof value === 'string' ? value : value?.code;
}

await loginAdmin(client);

const pages = await client.request(
  readItems('pages', {
    filter: { slug: { _eq: 'solutions' } },
    fields: [
      'id',
      'content',
      'translations.id',
      'translations.languages_code',
      'translations.content'
    ],
    limit: 1
  })
);

const page = pages[0];
if (!page) throw new Error('The Directus pages collection is missing slug "solutions".');

const viCopy = await readSolutionsCopy('vi');
await client.request(
  updateItem('pages', page.id, {
    content: { ...(page.content || {}), version: 3, copy: viCopy }
  })
);

for (const translation of page.translations || []) {
  const locale = localeCode(translation.languages_code);
  if (!['vi', 'en', 'ja'].includes(locale)) continue;
  const copy = await readSolutionsCopy(locale);
  await client.request(
    updateItem('pages_translations', translation.id, {
      content: { ...(translation.content || page.content || {}), version: 3, copy }
    })
  );
}

console.log('Applied complete Figma product-page copy to Directus pages/solutions (vi, en, ja).');
