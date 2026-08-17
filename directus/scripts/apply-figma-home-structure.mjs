import { readItems, readSingleton, updateItem, updateSingleton } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const client = createDirectusClient();

const media = {
  hero: {
    path: '/images/home/section1/HomeBanner.webp',
    role: 'homepage.hero.cleanroom-production',
    alt: 'Chuyên viên phòng sạch tại khu vực sản xuất công nghiệp ULink Industries'
  },
  about: {
    path: '/images/home/section4/companyu.webp',
    role: 'homepage.about.hanam-factory',
    alt: 'Trung tâm vận hành và kho công nghiệp ULink tại Hà Nam'
  },
  cleanroom: {
    path: '/images/home/section2/product-cut-gloves.webp',
    role: 'homepage.products.cleanroom-protection'
  },
  packaging: {
    path: '/images/home/section2/product-custom-pkg.webp',
    role: 'homepage.products.custom-packaging'
  },
  hvac: {
    path: '/images/home/section2/product-hvac-tape.webp',
    role: 'homepage.products.hvac-material'
  }
};

const localized = {
  vi: {
    hero: {
      kicker: 'Nhà sản xuất và phân phối vật tư công nghiệp · Phòng sạch và bao bì đóng gói',
      title: 'Giải pháp vật tư tiêu hao công nghiệp cho sản xuất.',
      description:
        'ULINK Industries cung cấp các giải pháp toàn diện và sản phẩm chất lượng cao, đáp ứng nhu cầu sản xuất và đảm bảo chất lượng trong mọi quy trình.',
      primaryAction: { label: 'Yêu cầu Báo giá', href: '/quick-order' },
      secondaryAction: { label: 'Tải Catalogue', href: '/resources' },
      assurance: 'Tư vấn kỹ thuật, đối chiếu quy cách và điều phối giao hàng theo từng khu công nghiệp.',
      image: media.hero
    },
    journey: {
      title: 'Năng lực phục vụ ULink Industries',
      description: 'Bốn cam kết nền tảng cho hoạt động cung ứng vật tư công nghiệp.',
      items: [
        {
          icon: 'document',
          label: '01',
          title: 'Phục vụ toàn quốc',
          description: 'Kết nối đến các KCN trọng điểm',
          href: '/regional-hubs',
          action: 'Xem mạng lưới'
        },
        {
          icon: 'catalog',
          label: '02',
          title: 'Đáp ứng nhanh & Linh hoạt',
          description: 'Hàng có sẵn tại kho',
          href: '/products',
          action: 'Xem danh mục'
        },
        {
          icon: 'quote',
          label: '03',
          title: 'Tối ưu chi phí mua hàng',
          description: 'Giải pháp phù hợp theo nhu cầu',
          href: '/quick-order',
          action: 'Yêu cầu báo giá'
        },
        {
          icon: 'delivery',
          label: '04',
          title: 'Đảm bảo chất lượng',
          description: 'Tuân thủ tiêu chuẩn kỹ thuật và ISO',
          href: '/about/standards',
          action: 'Xem tiêu chuẩn'
        }
      ]
    },
    about: {
      title: 'Hạ tầng cung ứng được thiết kế cho môi trường nhà máy',
      description:
        'ULink kết nối năng lực kho, đội ngũ kỹ thuật và danh mục vật tư trong một hệ vận hành thống nhất tại Hub Hà Nam.',
      bullets: [
        'Đối chiếu SKU và hồ sơ kỹ thuật trước khi báo giá',
        'Kiểm soát nhập kho, đóng gói và chứng từ theo lô',
        'Điều phối giao hàng theo cụm khu công nghiệp'
      ],
      action: { label: 'Về ULink Industries', href: '/about' },
      image: media.about
    },
    materials: {
      title: 'Danh mục sản phẩm',
      description: 'ULINK INDUSTRIES - Đối tác cung cấp vật tư công nghiệp cho các nhà sản xuất',
      groups: [
        {
          title: 'Băng Keo Nhôm - Ứng dụng trong HVAC',
          description:
            'Băng keo nhôm chuyên dụng dùng để dán kín mối nối, bề mặt bảo ôn và hệ thống gió HVAC. Lớp nhôm kết hợp keo acrylic chất lượng cao giúp làm kín, hạn chế thất thoát nhiệt và đáp ứng yêu cầu kỹ thuật riêng.',
          href: '/solutions/categories/esd-supplies',
          image: { ...media.hvac, alt: 'Băng keo nhôm kỹ thuật dùng trong hệ thống HVAC công nghiệp' }
        },
        {
          title: 'Bao bì công nghiệp theo quy cách',
          description:
            'Thùng, khay, màng và vật liệu chèn bảo vệ được thiết kế theo kích thước sản phẩm, tiêu chuẩn đóng gói và luồng vận chuyển của từng nhà máy.',
          href: '/solutions/categories/industrial-packaging',
          image: { ...media.packaging, alt: 'Giải pháp bao bì công nghiệp thiết kế theo quy cách ULink' }
        },
        {
          title: 'Vật tư bảo hộ & phòng sạch',
          description:
            'Găng tay chống cắt, găng nitrile, khăn lau, trang phục phòng sạch và vật tư kiểm soát tĩnh điện được lựa chọn theo môi trường sản xuất.',
          href: '/solutions/categories/cleanroom-consumables',
          image: { ...media.cleanroom, alt: 'Găng tay và vật tư bảo hộ phòng sạch do ULink cung cấp' }
        }
      ]
    }
  },
  en: {
    hero: {
      kicker: 'Industrial materials manufacturer and distributor · Cleanroom and packaging',
      title: 'Industrial consumable solutions for manufacturing.',
      description:
        'ULINK Industries provides comprehensive solutions and quality products that support manufacturing needs and quality assurance across every process.',
      primaryAction: { label: 'Request a quote', href: '/quick-order' },
      secondaryAction: { label: 'Download catalogue', href: '/resources' },
      assurance: 'Technical consultation, specification validation, and coordinated delivery to industrial parks.',
      image: { ...media.hero, alt: 'ULink Industries cleanroom specialist in an industrial production facility' }
    },
    journey: {
      title: 'ULink Industries service capability',
      description: 'Four operating commitments behind our industrial supply network.',
      items: [
        { icon: 'document', label: '01', title: 'Nationwide coverage', description: 'Connected to key industrial parks', href: '/regional-hubs', action: 'View network' },
        { icon: 'catalog', label: '02', title: 'Fast and flexible response', description: 'Stock available at our hub', href: '/products', action: 'View products' },
        { icon: 'quote', label: '03', title: 'Optimized purchasing cost', description: 'Solutions matched to each requirement', href: '/quick-order', action: 'Request a quote' },
        { icon: 'delivery', label: '04', title: 'Quality assurance', description: 'Technical and ISO compliance', href: '/about/standards', action: 'View standards' }
      ]
    },
    materials: {
      title: 'Product categories',
      description: 'ULINK INDUSTRIES - Industrial materials partner for manufacturers',
      groups: [
        { title: 'Aluminum foil tape for HVAC', description: 'Specialized aluminum tape for sealing insulation joints and industrial HVAC ducting, with high-performance acrylic adhesive.', href: '/solutions/categories/esd-supplies', image: { ...media.hvac, alt: 'Industrial aluminum foil tape for HVAC systems' } },
        { title: 'Made-to-spec industrial packaging', description: 'Cartons, trays, films, and protective inserts designed around product dimensions, packing standards, and factory logistics.', href: '/solutions/categories/industrial-packaging', image: { ...media.packaging, alt: 'ULink made-to-spec industrial packaging solution' } },
        { title: 'Protection and cleanroom materials', description: 'Cut-resistant gloves, nitrile gloves, wipers, garments, and static-control supplies selected for the production environment.', href: '/solutions/categories/cleanroom-consumables', image: { ...media.cleanroom, alt: 'ULink cleanroom and protective consumables' } }
      ]
    }
  },
  ja: {
    hero: {
      kicker: '産業資材メーカー・販売会社 · クリーンルーム・包装資材',
      title: '製造現場のための産業用消耗品ソリューション。',
      description: 'ULINK Industries は、製造ニーズと各工程の品質保証に対応する包括的なソリューションと高品質な製品を提供します。',
      primaryAction: { label: '見積を依頼', href: '/quick-order' },
      secondaryAction: { label: 'カタログをダウンロード', href: '/resources' },
      assurance: '技術相談、仕様照合、工業団地ごとの納品調整に対応します。',
      image: { ...media.hero, alt: 'ULink Industries のクリーンルーム製造現場' }
    },
    journey: {
      title: 'ULink Industries の供給力',
      description: '産業資材供給を支える4つの運用コミットメント。',
      items: [
        { icon: 'document', label: '01', title: '全国対応', description: '主要工業団地へ接続', href: '/regional-hubs', action: 'ネットワークを見る' },
        { icon: 'catalog', label: '02', title: '迅速かつ柔軟な対応', description: '拠点在庫から供給', href: '/products', action: '製品を見る' },
        { icon: 'quote', label: '03', title: '購買コストを最適化', description: '要件に合ったソリューション', href: '/quick-order', action: '見積を依頼' },
        { icon: 'delivery', label: '04', title: '品質保証', description: '技術規格・ISOに準拠', href: '/about/standards', action: '規格を見る' }
      ]
    },
    materials: {
      title: '製品カテゴリー',
      description: 'ULINK INDUSTRIES - 製造業向け産業資材パートナー',
      groups: [
        { title: 'HVAC用アルミテープ', description: '断熱材の継ぎ目や産業用HVACダクトのシールに使用する高性能アクリル粘着剤付きアルミテープ。', href: '/solutions/categories/esd-supplies', image: { ...media.hvac, alt: '産業用HVACシステム向けアルミテープ' } },
        { title: '仕様対応の産業包装', description: '製品寸法、包装基準、工場物流に合わせた箱、トレー、フィルム、保護インサート。', href: '/solutions/categories/industrial-packaging', image: { ...media.packaging, alt: 'ULink の仕様対応産業包装' } },
        { title: '保護具・クリーンルーム資材', description: '製造環境に合わせた耐切創手袋、ニトリル手袋、ワイパー、ウェア、静電気対策用品。', href: '/solutions/categories/cleanroom-consumables', image: { ...media.cleanroom, alt: 'ULink のクリーンルーム・保護消耗品' } }
      ]
    }
  }
};

function localeCode(value) {
  return typeof value === 'string' ? value : value?.code;
}

function withFigmaStructure(content, locale) {
  const extension = localized[locale] ?? localized.vi;
  if (!content?.materials) return content;

  return {
    ...content,
    version: Math.max(Number(content.version) || 0, 4),
    hero: extension.hero,
    journey: extension.journey,
    about: extension.about ?? content.about,
    materials: { ...content.materials, ...extension.materials }
  };
}

await loginAdmin(client);

const homepage = await client.request(readSingleton('homepage', { fields: ['content'] }));
if (homepage?.content) {
  await client.request(updateSingleton('homepage', { content: withFigmaStructure(homepage.content, 'vi') }));
}

const translations = await client.request(
  readItems('homepage_translations', { fields: ['id', 'languages_code', 'content'], limit: -1 })
);

for (const translation of translations) {
  if (!translation.content) continue;
  await client.request(
    updateItem('homepage_translations', translation.id, {
      content: withFigmaStructure(translation.content, localeCode(translation.languages_code))
    })
  );
}

console.log(`Updated Figma homepage structure in the singleton and ${translations.length} translations.`);
