import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createItem, readItems, updateItem } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '../../frontend/messages');
const client = createDirectusClient();

const slideMedia = [
  '/images/home/section2/solution-packaging.webp',
  '/images/home/section2/product-cut-gloves.webp',
  '/images/home/section2/product-hvac-tape.webp',
  '/images/home/section2/solution-cleanroom.webp',
  '/images/home/section2/product-custom-pkg.webp'
];

const localized = {
  vi: {
    title: 'Cụm khu công nghiệp',
    network: {
      eyebrow: 'VIỆT NAM / MẠNG LƯỚI HUB',
      title: 'Mạng lưới trung tâm vùng',
      subtitle: 'Chọn hub để xem phạm vi phục vụ hoặc gửi RFQ theo khu vực',
      liveLabel: 'DỮ LIỆU CMS',
      signature: 'ULINK INDUSTRIAL NETWORK // PUBLISHED HUB DATA',
      emptyLabel: 'Chưa có hub published trong CMS.'
    },
    stats: {
      distanceNote: 'Trung bình từ phạm vi phục vụ của từng hub',
      deliveryNote: 'Tổng hợp từ SLA giao hàng của từng hub',
      zonesLabel: 'KCN đang được phục vụ',
      zonesUnit: 'KCN',
      zonesNote: 'Liên kết trực tiếp với các hub trong CMS'
    },
    dashboard: {
      title: 'Thông tin vận hành từ hệ thống quản trị',
      sourceLabel: 'Dữ liệu published từ Directus CMS',
      capacityLabel: 'Năng lực xử lý mỗi ngày',
      capacityUnit: 'đơn/ngày',
      capacityNote: 'Tổng công suất thiết lập tại các hub',
      onTimeLabel: 'Tỷ lệ giao hàng đúng hạn',
      onTimeNote: 'Trung bình theo dữ liệu SLA của mạng lưới',
      hubsLabel: 'Hub đang hoạt động',
      hubsUnit: 'hub',
      hubsNote: 'Trạng thái active trong hệ thống',
      warehouseLabel: 'Tổng diện tích kho',
      warehouseNote: 'Tổng hợp từ các hub đang published'
    },
    featuredHub: {
      eyebrow: 'TRUNG TÂM PHÂN PHỐI VÙNG',
      title: 'Kết nối các KCN trọng điểm, giao hàng theo SLA',
      descriptionTemplate: '{hubName} đang phục vụ {zoneCount} KCN với quy mô kho {warehouseArea} m², năng lực xử lý {dailyCapacity} đơn mỗi ngày và tỷ lệ giao hàng đúng hạn {onTimeRate}%. Toàn bộ chỉ số được lấy trực tiếp từ hồ sơ hub đang published trong CMS.',
      primaryLabel: 'Liên hệ Sales',
      secondaryLabel: 'Xem chi tiết hub'
    },
    resources: {
      eyebrow: 'ULINK INTELLIGENCE',
      docsEyebrow: 'THƯ VIỆN TÀI LIỆU',
      documentTypeLabels: { tds: 'Tài liệu kỹ thuật', msds: 'An toàn vật liệu', certificate: 'Chứng nhận', brochure: 'Catalogue' }
    },
    testimonialNavigation: { previousLabel: 'Đánh giá trước', nextLabel: 'Đánh giá tiếp theo' }
  },
  en: {
    title: 'Industrial clusters',
    network: {
      eyebrow: 'VIETNAM / HUB NETWORK',
      title: 'Regional hub network',
      subtitle: 'Select a hub to review coverage or submit a region-specific RFQ',
      liveLabel: 'CMS DATA',
      signature: 'ULINK INDUSTRIAL NETWORK // PUBLISHED HUB DATA',
      emptyLabel: 'No published hub is available in the CMS.'
    },
    stats: {
      distanceNote: 'Average of each hub service radius',
      deliveryNote: 'Calculated from the delivery SLA of every hub',
      zonesLabel: 'Industrial parks served',
      zonesUnit: 'parks',
      zonesNote: 'Linked directly to published CMS hub records'
    },
    dashboard: {
      title: 'Operational information from the management system',
      sourceLabel: 'Published data from Directus CMS',
      capacityLabel: 'Daily handling capacity',
      capacityUnit: 'orders/day',
      capacityNote: 'Combined configured capacity of all hubs',
      onTimeLabel: 'On-time delivery rate',
      onTimeNote: 'Network average from published SLA data',
      hubsLabel: 'Active hubs',
      hubsUnit: 'hubs',
      hubsNote: 'Records with active operating status',
      warehouseLabel: 'Total warehouse area',
      warehouseNote: 'Combined area of published hubs'
    },
    featuredHub: {
      eyebrow: 'REGIONAL DISTRIBUTION CENTER',
      title: 'Connecting key industrial parks through governed SLAs',
      descriptionTemplate: '{hubName} serves {zoneCount} industrial parks with {warehouseArea} m² of warehouse space, capacity for {dailyCapacity} orders per day, and an on-time delivery rate of {onTimeRate}%. Every figure comes directly from the published hub record in the CMS.',
      primaryLabel: 'Contact sales',
      secondaryLabel: 'View hub details'
    },
    resources: {
      eyebrow: 'ULINK INTELLIGENCE',
      docsEyebrow: 'DOCUMENT LIBRARY',
      documentTypeLabels: { tds: 'Technical data', msds: 'Material safety', certificate: 'Certificate', brochure: 'Catalogue' }
    },
    testimonialNavigation: { previousLabel: 'Previous testimonial', nextLabel: 'Next testimonial' }
  },
  ja: {
    title: '工業団地クラスター',
    network: {
      eyebrow: 'ベトナム / ハブネットワーク',
      title: '地域ハブネットワーク',
      subtitle: 'ハブを選択して対応地域を確認、または地域別RFQを送信できます',
      liveLabel: 'CMS データ',
      signature: 'ULINK INDUSTRIAL NETWORK // PUBLISHED HUB DATA',
      emptyLabel: 'CMS に公開済みのハブがありません。'
    },
    stats: {
      distanceNote: '各ハブのサービス範囲から算出した平均',
      deliveryNote: '各ハブの配送 SLA から算出',
      zonesLabel: '対応工業団地',
      zonesUnit: '団地',
      zonesNote: 'CMS の公開ハブに直接紐付くデータ'
    },
    dashboard: {
      title: '管理システムの運用情報',
      sourceLabel: 'Directus CMS の公開データ',
      capacityLabel: '1日あたり処理能力',
      capacityUnit: '件/日',
      capacityNote: '全ハブの設定処理能力の合計',
      onTimeLabel: '定時配送率',
      onTimeNote: '公開済み SLA データのネットワーク平均',
      hubsLabel: '稼働中ハブ',
      hubsUnit: '拠点',
      hubsNote: '稼働状態が active のレコード',
      warehouseLabel: '倉庫総面積',
      warehouseNote: '公開済みハブの総面積'
    },
    featuredHub: {
      eyebrow: '地域物流センター',
      title: '主要工業団地を SLA でつなぐ',
      descriptionTemplate: '{hubName} は {zoneCount} か所の工業団地を担当し、倉庫面積 {warehouseArea} m²、1日 {dailyCapacity} 件の処理能力、定時配送率 {onTimeRate}% を備えています。すべての数値は CMS の公開ハブ情報から直接取得しています。',
      primaryLabel: '営業に連絡',
      secondaryLabel: 'ハブ詳細を見る'
    },
    resources: {
      eyebrow: 'ULINK INTELLIGENCE',
      docsEyebrow: '資料ライブラリ',
      documentTypeLabels: { tds: '技術データ', msds: '安全データ', certificate: '証明書', brochure: 'カタログ' }
    },
    testimonialNavigation: { previousLabel: '前のお客様の声', nextLabel: '次のお客様の声' }
  }
};

function capabilityItems(base) {
  return [
    { icon: 'factory', title: base.manufacturing.title, description: base.manufacturing.desc, href: '/solutions' },
    { icon: 'clock', title: base.supplyChain.title, description: base.supplyChain.desc, href: '/regional-hubs' },
    { icon: 'award', title: base.quality.title, description: base.quality.desc, href: '/about/standards' }
  ];
}

function testimonialItems(base) {
  return [
    { company: base.company1, quote: base.quote1, name: base.name1, role: base.role1 },
    { company: base.company2, quote: base.quote2, name: base.name2, role: base.role2 }
  ];
}

function processSteps(base) {
  const icons = ['document', 'users', 'settings', 'truck'];
  return icons.map((icon, index) => {
    const step = index + 1;
    return {
      icon,
      number: base[`step${step}Number`],
      title: base[`step${step}Title`],
      description: base[`step${step}Desc`],
      kpiLabel: base[`step${step}KpiLabel`],
      kpiValue: base[`step${step}KpiValue`]
    };
  });
}

async function makeContent(locale) {
  const messages = JSON.parse(await readFile(join(messagesDir, `${locale}.json`), 'utf8'));
  const base = messages.regionalHubs;
  const extra = localized[locale];
  const resources = messages.home.resourcesSection;
  const contact = messages.aboutContact;

  return {
    version: 5,
    supportingMedia: [
      {
        path: '/images/brand/ulink-hub-hanam-overview-royal-v1.webp',
        role: 'regional-hubs.featured-network',
        alt: locale === 'vi'
          ? 'Đội ngũ ULink vận hành trung tâm phân phối vùng'
          : locale === 'ja'
            ? 'ULink 地域物流センターの運用チーム'
            : 'ULink regional distribution center operations team'
      }
    ],
    copy: {
      eyebrow: base.eyebrow,
      title: base.title,
      description: base.description,
      network: extra.network,
      stats: {
        distance: { label: base.stats.distanceLabel, unit: base.stats.distanceUnit, note: extra.stats.distanceNote },
        delivery: { label: base.stats.timeLabel, unit: base.stats.timeUnit, note: extra.stats.deliveryNote },
        zones: { label: extra.stats.zonesLabel, unit: extra.stats.zonesUnit, note: extra.stats.zonesNote }
      },
      dashboard: {
        title: extra.dashboard.title,
        sourceLabel: extra.dashboard.sourceLabel,
        capacity: { label: extra.dashboard.capacityLabel, unit: extra.dashboard.capacityUnit, note: extra.dashboard.capacityNote },
        onTime: { label: extra.dashboard.onTimeLabel, unit: '%', note: extra.dashboard.onTimeNote },
        hubs: { label: extra.dashboard.hubsLabel, unit: extra.dashboard.hubsUnit, note: extra.dashboard.hubsNote },
        warehouse: { label: extra.dashboard.warehouseLabel, unit: 'm²', note: extra.dashboard.warehouseNote }
      },
      hubRfq: base.hubRfq,
      featuredProducts: {
        title: base.featuredProducts.title,
        subtitle: base.featuredProducts.subtitle,
        viewAll: base.featuredProducts.viewAll,
        emptyLabel: locale === 'vi' ? 'CMS chưa có sản phẩm nổi bật đang published.' : locale === 'ja' ? 'CMS に公開中の注目製品がありません。' : 'No published featured products are available in the CMS.'
      },
      carousel: {
        rfqButton: base.carousel.rfqButton,
        learnMore: base.carousel.learnMore,
        slides: slideMedia.map((image, index) => ({
          ...base.carousel[`slide${index + 1}`],
          image,
          alt: base.carousel[`slide${index + 1}`].eyebrow
        }))
      },
      capabilities: {
        title: base.capabilities.title,
        description: base.capabilities.desc,
        learnMore: base.capabilities.learnMore,
        items: capabilityItems(base.capabilities)
      },
      featuredHub: {
        slug: 'ninh-binh',
        eyebrow: extra.featuredHub.eyebrow,
        title: extra.featuredHub.title,
        descriptionTemplate: extra.featuredHub.descriptionTemplate,
        primaryAction: { label: extra.featuredHub.primaryLabel, href: '/quick-order' },
        secondaryAction: { label: extra.featuredHub.secondaryLabel, href: '/regional-hubs/{slug}' },
        imageRole: 'regional-hubs.featured-network',
        imageAlt: extra.featuredHub.eyebrow
      },
      testimonials: {
        eyebrow: base.testimonials.eyebrow,
        title: base.testimonials.title,
        subtitle: base.testimonials.subtitle,
        ...extra.testimonialNavigation,
        items: testimonialItems(base.testimonials)
      },
      workingProcess: {
        title: base.workingProcess.title,
        subtitle: base.workingProcess.subtitle,
        steps: processSteps(base.workingProcess)
      },
      resources: {
        eyebrow: extra.resources.eyebrow,
        sectionTitle: resources.sectionTitle,
        sectionSubTitle: resources.sectionSubTitle,
        viewAllNews: resources.viewAllNews,
        readMore: resources.readMore,
        docsEyebrow: extra.resources.docsEyebrow,
        docsTitle: resources.docsTitle,
        supportTitle: resources.supportTitle,
        documentTypeLabels: extra.resources.documentTypeLabels,
        supportItems: [1, 2, 3, 4].map((index) => ({
          title: resources[`supp${index}Title`],
          description: resources[`supp${index}Desc`]
        }))
      },
      contact
    }
  };
}

async function upsertTranslation(pageId, locale, title, content) {
  const rows = await client.request(
    readItems('pages_translations', {
      filter: { pages_id: { _eq: pageId }, languages_code: { _eq: locale } },
      fields: ['id'],
      limit: 1
    })
  );
  const payload = { pages_id: pageId, languages_code: locale, title, content };
  if (rows.length) await client.request(updateItem('pages_translations', rows[0].id, payload));
  else await client.request(createItem('pages_translations', payload));
}

await loginAdmin(client);

const contents = Object.fromEntries(
  await Promise.all(Object.keys(localized).map(async (locale) => [locale, await makeContent(locale)]))
);
const existing = await client.request(
  readItems('pages', { filter: { slug: { _eq: 'regional-hubs' } }, fields: ['id'], limit: 1 })
);
const payload = {
  status: 'published',
  slug: 'regional-hubs',
  title: localized.vi.title,
  content: contents.vi,
  meta_title: 'Mạng lưới cụm khu công nghiệp | ULink Industries',
  meta_description: 'Dữ liệu hub, khu công nghiệp, năng lực kho và SLA được quản trị tập trung trong Directus CMS.'
};
const page = existing.length
  ? await client.request(updateItem('pages', existing[0].id, payload))
  : await client.request(createItem('pages', payload));
const pageId = page?.id ?? existing[0]?.id;

for (const locale of Object.keys(localized)) {
  await upsertTranslation(pageId, locale, localized[locale].title, contents[locale]);
}

console.log('Applied Figma regional-hubs structure and localized CMS content for vi, en, ja.');
process.exit(0);
