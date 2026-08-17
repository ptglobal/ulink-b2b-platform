import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createItem, readFiles, readItems, updateItem, uploadFiles } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendPublic = join(__dirname, '../../frontend/public');

function resourceArticle({ slug, title, image, date, description, en, ja }) {
  return {
    slug,
    title,
    image,
    published_at: `${date}T08:00:00.000Z`,
    body: `<p>${description}</p>`,
    description,
    translations: { vi: title, en, ja }
  };
}

const articles = [
  {
    slug: 'semiconductor-cleanroom-particle-control',
    title: 'Kiểm soát hạt trong phòng sạch bán dẫn: 5 điểm cần xác minh trước khi nhập vật tư',
    image: '/images/brand/ulink-news-semiconductor-particle-control-royal-v2.webp',
    published_at: '2026-07-22T08:00:00.000Z',
    body: '<p>Hồ sơ vật liệu, cấp độ sạch, phương pháp đóng gói, điều kiện lưu kho và khả năng truy xuất là năm điểm cần được xác minh trước khi phê duyệt vật tư cho dây chuyền bán dẫn.</p>',
    description: 'Danh sách kiểm tra kỹ thuật dành cho bộ phận mua hàng và quản lý chất lượng phòng sạch.',
    translations: {
      vi: 'Kiểm soát hạt trong phòng sạch bán dẫn: 5 điểm cần xác minh trước khi nhập vật tư',
      en: 'Semiconductor cleanroom particle control: five checks before material approval',
      ja: '半導体クリーンルームの粒子管理：資材承認前に確認すべき5項目'
    }
  },
  {
    slug: 'pe-pallet-film-quality-inspection',
    title: 'Kiểm định màng PE quấn pallet: độ dày, độ bám và tải trọng vận chuyển',
    image: '/images/brand/ulink-news-pe-film-quality-control-royal-v2.webp',
    published_at: '2026-07-20T08:00:00.000Z',
    body: '<p>Độ dày màng, lực kéo, độ bám và độ ổn định tải là các thông số cần được kiểm tra đồng thời để giảm hư hỏng trong lưu kho và vận chuyển.</p>',
    description: 'Hướng dẫn đánh giá màng PE quấn pallet theo điều kiện vận hành thực tế.',
    translations: {
      vi: 'Kiểm định màng PE quấn pallet: độ dày, độ bám và tải trọng vận chuyển',
      en: 'PE pallet film inspection: thickness, cling performance and transport load',
      ja: 'PEパレットフィルム検査：厚み、粘着性能、輸送荷重の確認'
    }
  },
  {
    slug: 'optimizing-esd-control',
    title: 'Audit ESD tại bàn thao tác điện tử: từ vòng đeo tay đến túi shielding',
    image: '/images/brand/ulink-news-esd-protection-audit-royal-v2.webp',
    published_at: '2026-07-18T08:00:00.000Z',
    body: '<p>Một vòng audit ESD cần kiểm tra điểm tiếp địa, vòng đeo tay, mặt bàn, thiết bị đo và bao bì shielding theo cùng một chuỗi kiểm soát.</p>',
    description: 'Quy trình kiểm tra ESD thực tế cho khu vực lắp ráp điện tử.',
    translations: {
      vi: 'Audit ESD tại bàn thao tác điện tử: từ vòng đeo tay đến túi shielding',
      en: 'ESD workstation audit: from wrist straps to shielding bags',
      ja: 'ESD作業台監査：リストストラップからシールドバッグまで'
    }
  },
  resourceArticle({
    slug: 'guide-cleanroom-material-selection',
    title: 'Cẩm nang lựa chọn vật tư phòng sạch theo cấp độ ISO',
    image: '/images/brand/ulink-product-cleanroom-mask-royal-v1.webp',
    date: '2026-07-16',
    description: 'Hướng dẫn đối chiếu cấp độ sạch, vật liệu, quy cách đóng gói và hồ sơ kỹ thuật trước khi phê duyệt vật tư.',
    en: 'Guide to selecting cleanroom materials by ISO class',
    ja: 'ISOクラス別クリーンルーム資材選定ガイド'
  }),
  resourceArticle({
    slug: 'guide-industrial-wiper-validation',
    title: 'Quy trình đánh giá khăn lau công nghiệp cho dây chuyền chính xác',
    image: '/images/brand/ulink-product-cleanroom-wipers-royal-v1.webp',
    date: '2026-07-14',
    description: 'Các chỉ tiêu cần kiểm tra gồm mức phát sinh hạt, độ thấm hút, tương thích dung môi và khả năng truy xuất theo lô.',
    en: 'Industrial wiper validation for precision production lines',
    ja: '精密生産ライン向け工業用ワイパー評価手順'
  }),
  resourceArticle({
    slug: 'standard-esd-packaging-compliance',
    title: 'Tiêu chuẩn kiểm soát bao bì chống tĩnh điện trong chuỗi cung ứng',
    image: '/images/brand/ulink-product-esd-shielding-bag-royal-v1.webp',
    date: '2026-07-12',
    description: 'Tổng hợp yêu cầu về điện trở bề mặt, shielding, ghi nhãn và bảo quản bao bì ESD cho linh kiện điện tử.',
    en: 'ESD packaging compliance across the supply chain',
    ja: 'サプライチェーンにおけるESD包装コンプライアンス'
  }),
  resourceArticle({
    slug: 'case-esd-workstation-standardization',
    title: 'Case study: Chuẩn hóa bàn thao tác ESD cho nhà máy điện tử',
    image: '/images/brand/ulink-product-esd-table-mat-royal-v1.webp',
    date: '2026-07-10',
    description: 'ULink đồng bộ thảm bàn, tiếp địa và quy trình kiểm tra định kỳ để giảm rủi ro phóng tĩnh điện trên dây chuyền.',
    en: 'Case study: ESD workstation standardization for electronics manufacturing',
    ja: '事例：電子工場のESD作業台標準化'
  }),
  resourceArticle({
    slug: 'event-esd-control-workshop',
    title: 'Workshop thực hành: Xây dựng vùng kiểm soát ESD đạt chuẩn',
    image: '/images/brand/ulink-product-esd-wrist-strap-royal-v1.webp',
    date: '2026-08-28',
    description: 'Chuyên gia ULink hướng dẫn thiết lập điểm tiếp địa, kiểm tra thiết bị và quản lý hồ sơ EPA tại nhà máy.',
    en: 'Hands-on workshop: building a compliant ESD protected area',
    ja: '実践ワークショップ：規格準拠ESD保護区域の構築'
  }),
  resourceArticle({
    slug: 'event-cleanroom-chemical-seminar',
    title: 'Seminar kỹ thuật: Quản lý hóa chất làm sạch trong nhà máy',
    image: '/images/brand/ulink-product-ipa-cleanroom-royal-v1.webp',
    date: '2026-09-12',
    description: 'Chương trình tập trung vào lựa chọn dung môi, an toàn lưu kho và kiểm soát nhiễm chéo trong khu vực sạch.',
    en: 'Technical seminar: cleaning chemical management in manufacturing',
    ja: '技術セミナー：工場における洗浄薬品管理'
  }),
  resourceArticle({
    slug: 'event-hanam-hub-open-day',
    title: 'ULink Hub Hà Nam Open Day: Kết nối mua hàng và vận hành',
    image: '/images/brand/ulink-product-nitrile-gloves-royal-v1.webp',
    date: '2026-10-03',
    description: 'Tham quan quy trình kiểm soát nhập kho, lưu trữ, đóng gói và điều phối vật tư tới các khu công nghiệp phía Bắc.',
    en: 'ULink Ha Nam Hub Open Day: procurement and operations connection',
    ja: 'ULinkハナム拠点オープンデー：調達とオペレーション'
  }),
  resourceArticle({
    slug: 'cleanroom-entry-contamination-control',
    title: 'Kiểm soát nhiễm bẩn tại lối vào phòng sạch bằng thảm dính bụi',
    image: '/images/brand/ulink-product-sticky-mat-royal-v1.webp',
    date: '2026-07-08',
    description: 'Phân tích vị trí lắp đặt, tần suất thay lớp và phương pháp theo dõi hiệu quả của thảm dính bụi nhiều lớp.',
    en: 'Cleanroom entrance contamination control with sticky mats',
    ja: '粘着マットによるクリーンルーム入口の汚染管理'
  }),
  resourceArticle({
    slug: 'protective-apparel-procurement-checklist',
    title: 'Checklist mua trang phục bảo hộ dùng trong môi trường kiểm soát',
    image: '/images/brand/ulink-product-tyvek-coverall-royal-v1.webp',
    date: '2026-07-06',
    description: 'Danh sách kiểm tra về vật liệu, kích thước, cấp độ bảo vệ, đóng gói và truy xuất dành cho bộ phận mua hàng.',
    en: 'Protective apparel procurement checklist for controlled environments',
    ja: '管理環境向け保護服調達チェックリスト'
  })
];

const client = createDirectusClient();

async function ensureFile(publicPath, title) {
  const filename = `ulink-cms-${publicPath.split('/').pop()}`;
  const existing = await client.request(
    readFiles({ filter: { filename_download: { _eq: filename } }, fields: ['id'], limit: 1 })
  );
  if (existing.length) return existing[0].id;

  const bytes = await readFile(join(frontendPublic, publicPath.replace(/^\//, '')));
  const form = new FormData();
  form.append('title', title);
  form.append('description', title);
  form.append('file', new Blob([bytes], { type: 'image/webp' }), filename);
  const uploaded = await client.request(uploadFiles(form));
  return uploaded.id;
}

async function main() {
  await loginAdmin(client);

  for (const article of articles) {
    const cover = await ensureFile(article.image, article.title);
    const payload = {
      title: article.title,
      slug: article.slug,
      body: article.body,
      cover,
      author: 'ULink Technical Advisory',
      published_at: article.published_at,
      meta_title: article.title,
      meta_description: article.description,
      status: 'published'
    };
    const existing = await client.request(
      readItems('blog_posts', { filter: { slug: { _eq: article.slug } }, fields: ['id'], limit: 1 })
    );
    const postId = existing.length
      ? (await client.request(updateItem('blog_posts', existing[0].id, payload))).id
      : (await client.request(createItem('blog_posts', payload))).id;

    for (const [languages_code, title] of Object.entries(article.translations)) {
      const translationPayload = {
        blog_posts_id: postId,
        languages_code,
        title,
        body: article.body,
        meta_title: title,
        meta_description: article.description
      };
      const translation = await client.request(
        readItems('blog_posts_translations', {
          filter: {
            _and: [
              { blog_posts_id: { _eq: postId } },
              { languages_code: { _eq: languages_code } }
            ]
          },
          fields: ['id'],
          limit: 1
        })
      );
      if (translation.length) {
        await client.request(updateItem('blog_posts_translations', translation[0].id, translationPayload));
      } else {
        await client.request(createItem('blog_posts_translations', translationPayload));
      }
    }
    console.log(`Seeded hub resource: ${article.slug}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Hub resource content seed failed:', error);
    process.exit(1);
  });
