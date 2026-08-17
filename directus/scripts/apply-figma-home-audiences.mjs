import { readItems, readSingleton, updateItem, updateSingleton } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const client = createDirectusClient();

const audiencesByLocale = {
  vi: {
    title: 'Dịch vụ & Giải pháp Công nghiệp',
    subtitle: 'Đồng hành cùng sự phát triển của Doanh nghiệp',
    items: [
      {
        icon: 'building',
        title: 'Doanh nghiệp FDI',
        description: 'Giải pháp toàn diện cho doanh nghiệp có vốn đầu tư nước ngoài',
        bullets: [
          'Đáp ứng các yêu cầu tiêu chuẩn ISO',
          'Hợp đồng dài hạn và ổn định giá cả',
          'Giao hàng nhanh - Kết nối các KCN toàn quốc',
          'Hỗ trợ kỹ thuật & tư vấn giải pháp tối ưu'
        ],
        action: {
          label: 'Xem chi tiết',
          href: '/solutions/categories/cleanroom-consumables'
        }
      },
      {
        icon: 'factory',
        title: 'Doanh nghiệp Sản xuất',
        description: 'Đồng hành cùng doanh nghiệp sản xuất trong nước',
        bullets: [
          'Sản phẩm đa dạng, đáp ứng mọi nhu cầu',
          'Giá cạnh tranh - Chiết khấu theo số lượng',
          'Đội ngũ tư vấn chuyên nghiệp 24/7',
          'Hệ thống kho hàng phủ khắp cả nước'
        ],
        action: {
          label: 'Xem chi tiết',
          href: '/solutions/categories/industrial-packaging'
        }
      }
    ]
  },
  en: {
    title: 'Industrial Services & Solutions',
    subtitle: 'Supporting every stage of business growth',
    items: [
      {
        icon: 'building',
        title: 'FDI Enterprises',
        description: 'Comprehensive solutions for foreign-invested manufacturers in Vietnam',
        bullets: [
          'ISO-aligned product and process requirements',
          'Long-term contracts with stable commercial terms',
          'Fast delivery across Vietnam’s industrial parks',
          'Technical support and solution consultation'
        ],
        action: {
          label: 'View details',
          href: '/solutions/categories/cleanroom-consumables'
        }
      },
      {
        icon: 'factory',
        title: 'Manufacturing Enterprises',
        description: 'A supply partner for domestic manufacturing businesses',
        bullets: [
          'A broad portfolio for varied production needs',
          'Competitive pricing and volume discounts',
          'Professional consultation available 24/7',
          'A nationwide warehouse and delivery network'
        ],
        action: {
          label: 'View details',
          href: '/solutions/categories/industrial-packaging'
        }
      }
    ]
  },
  ja: {
    title: '産業サービス＆ソリューション',
    subtitle: '企業の成長をあらゆる段階で支援',
    items: [
      {
        icon: 'building',
        title: '外資系企業',
        description: 'ベトナムの外資系製造企業向け総合ソリューション',
        bullets: [
          'ISOに準拠した製品・工程要件への対応',
          '長期契約と安定した取引条件',
          '全国の工業団地への迅速な配送',
          '技術支援と最適なソリューション提案'
        ],
        action: {
          label: '詳細を見る',
          href: '/solutions/categories/cleanroom-consumables'
        }
      },
      {
        icon: 'factory',
        title: '製造企業',
        description: '国内製造企業のための安定した供給パートナー',
        bullets: [
          '多様な生産ニーズに対応する製品群',
          '競争力のある価格と数量割引',
          '24時間体制の専門コンサルティング',
          '全国をカバーする倉庫・配送ネットワーク'
        ],
        action: {
          label: '詳細を見る',
          href: '/solutions/categories/industrial-packaging'
        }
      }
    ]
  }
};

function localeCode(value) {
  return typeof value === 'string' ? value : value?.code;
}

function withFigmaAudiences(content, locale) {
  if (!content) return content;
  return {
    ...content,
    version: Math.max(Number(content.version) || 0, 5),
    audiences: audiencesByLocale[locale] ?? audiencesByLocale.vi
  };
}

await loginAdmin(client);

const homepage = await client.request(readSingleton('homepage', { fields: ['content'] }));
if (homepage?.content) {
  await client.request(
    updateSingleton('homepage', {
      content: withFigmaAudiences(homepage.content, 'vi')
    })
  );
}

const translations = await client.request(
  readItems('homepage_translations', {
    fields: ['id', 'languages_code', 'content'],
    limit: -1
  })
);

for (const translation of translations) {
  if (!translation.content) continue;
  await client.request(
    updateItem('homepage_translations', translation.id, {
      content: withFigmaAudiences(
        translation.content,
        localeCode(translation.languages_code)
      )
    })
  );
}

console.log(
  `Updated Figma audience content in the homepage singleton and ${translations.length} translations.`
);
process.exit(0);
