import { readItems, readSingleton, updateItem, updateSingleton } from '@directus/sdk';
import { createDirectusClient, loginAdmin } from '../lib/config.mjs';

const client = createDirectusClient();

const images = {
  cleanroom: { path: '/images/home/section2/solution-cleanroom.webp', role: 'homepage.products.cleanroom-solution' },
  automation: { path: '/images/home/section2/solution-packaging.webp', role: 'homepage.products.packaging-automation' },
  protection: { path: '/images/home/section2/product-cut-gloves.webp', role: 'homepage.products.cut-protection' },
  tape: { path: '/images/home/section2/product-hvac-tape.webp', role: 'homepage.products.hvac-tape' },
  packaging: { path: '/images/home/section2/product-custom-pkg.webp', role: 'homepage.products.made-to-spec-packaging' }
};

const groups = {
  vi: [
    { title: 'Găng tay & Vật tư Phòng sạch', description: 'Hệ vật tư kiểm soát nhiễm bẩn gồm găng tay, khăn lau, trang phục và phụ kiện được lựa chọn theo cấp độ sạch và công đoạn sản xuất.', href: '/products/categories/cleanroom-consumables', image: { ...images.cleanroom, alt: 'Vật tư và găng tay phòng sạch ULink Industries' } },
    { title: 'Giải pháp Đóng gói & Tự động hóa', description: 'Thiết kế quy cách, thử mẫu và tích hợp thiết bị đóng gói giúp ổn định chất lượng, tăng năng suất và giảm hao phí vật liệu.', href: '/products/categories/industrial-packaging', image: { ...images.automation, alt: 'Giải pháp đóng gói công nghiệp tự động hóa ULink' } },
    { title: 'Găng tay Chống cắt Công nghiệp', description: 'Danh mục bảo hộ bàn tay theo cấp độ chống cắt, độ bám và môi trường thao tác cho dây chuyền cơ khí và lắp ráp.', href: '/products/categories/cleanroom-gloves', image: { ...images.protection, alt: 'Găng tay chống cắt công nghiệp do ULink cung cấp' } },
    { title: 'Băng Keo Nhôm – Ứng dụng trong HVAC', description: 'Băng keo nhôm kỹ thuật cho mối nối bảo ôn và hệ thống thông gió, đáp ứng yêu cầu về độ bám, độ kín và khả năng chịu nhiệt.', href: '/products/categories/esd-supplies', image: { ...images.tape, alt: 'Băng keo nhôm kỹ thuật ứng dụng trong HVAC' } },
    { title: 'Bao bì – Sản xuất theo Yêu cầu', description: 'Thùng, khay, màng và vật liệu chèn bảo vệ được phát triển theo kích thước sản phẩm, tiêu chuẩn đóng gói và luồng vận chuyển.', href: '/products/categories/industrial-packaging', image: { ...images.packaging, alt: 'Bao bì công nghiệp sản xuất theo yêu cầu ULink' } }
  ],
  en: [
    { title: 'Cleanroom gloves & consumables', description: 'Contamination-control gloves, wipers, garments and accessories selected for each cleanroom class and production step.', href: '/products/categories/cleanroom-consumables', image: { ...images.cleanroom, alt: 'ULink cleanroom gloves and consumables' } },
    { title: 'Packaging & automation solutions', description: 'Specification design, sampling and equipment integration to improve quality, productivity and material efficiency.', href: '/products/categories/industrial-packaging', image: { ...images.automation, alt: 'ULink automated industrial packaging solution' } },
    { title: 'Industrial cut-resistant gloves', description: 'Hand protection selected by cut level, grip and operating environment for mechanical and assembly lines.', href: '/products/categories/cleanroom-gloves', image: { ...images.protection, alt: 'ULink industrial cut-resistant gloves' } },
    { title: 'Aluminum tape for HVAC', description: 'Technical aluminum tapes for insulation joints and ventilation systems, specified for adhesion, sealing and heat resistance.', href: '/products/categories/esd-supplies', image: { ...images.tape, alt: 'Technical aluminum tape for HVAC applications' } },
    { title: 'Made-to-spec packaging', description: 'Cartons, trays, films and protective inserts developed around product dimensions, packing standards and logistics flow.', href: '/products/categories/industrial-packaging', image: { ...images.packaging, alt: 'ULink made-to-spec industrial packaging' } }
  ],
  ja: [
    { title: 'クリーンルーム手袋・消耗品', description: '清浄度クラスと工程に合わせて、手袋、ワイパー、ウェア、関連資材を選定します。', href: '/products/categories/cleanroom-consumables', image: { ...images.cleanroom, alt: 'ULink クリーンルーム手袋・消耗品' } },
    { title: '包装・自動化ソリューション', description: '仕様設計、試作、設備連携により、品質と生産性を安定させ材料ロスを削減します。', href: '/products/categories/industrial-packaging', image: { ...images.automation, alt: 'ULink 自動包装ソリューション' } },
    { title: '産業用耐切創手袋', description: '耐切創レベル、グリップ、作業環境に合わせて機械・組立工程向けの手袋を提案します。', href: '/products/categories/cleanroom-gloves', image: { ...images.protection, alt: 'ULink 産業用耐切創手袋' } },
    { title: 'HVAC用アルミテープ', description: '断熱材の継ぎ目と換気設備向けに、粘着性、気密性、耐熱性を満たす技術テープです。', href: '/products/categories/esd-supplies', image: { ...images.tape, alt: 'HVAC向け技術用アルミテープ' } },
    { title: '仕様対応の産業包装', description: '製品寸法、包装基準、物流フローに合わせて箱、トレー、フィルム、保護材を開発します。', href: '/products/categories/industrial-packaging', image: { ...images.packaging, alt: 'ULink 仕様対応産業包装' } }
  ]
};

function localeCode(value) {
  return typeof value === 'string' ? value : value?.code;
}

function updateProducts(content, locale) {
  if (!content?.materials) return content;
  return {
    ...content,
    version: Math.max(Number(content.version) || 0, 5),
    materials: { ...content.materials, groups: groups[locale] || groups.vi }
  };
}

await loginAdmin(client);
const homepage = await client.request(readSingleton('homepage', { fields: ['content'] }));
await client.request(updateSingleton('homepage', { content: updateProducts(homepage.content, 'vi') }));

const translations = await client.request(
  readItems('homepage_translations', { fields: ['id', 'languages_code', 'content'], limit: -1 })
);
for (const translation of translations) {
  const locale = localeCode(translation.languages_code);
  await client.request(
    updateItem('homepage_translations', translation.id, {
      content: updateProducts(translation.content || homepage.content, locale)
    })
  );
}

console.log('Applied the five-card Figma homepage product grid to Directus (vi, en, ja).');
