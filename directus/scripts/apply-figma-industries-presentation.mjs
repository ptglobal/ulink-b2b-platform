import { readItems, updateItem } from "@directus/sdk";
import { createDirectusClient, loginAdmin } from "../lib/config.mjs";

const client = createDirectusClient();

const images = {
  furniture: "/images/brand/ulink-industry-card-furniture-royal-v1.webp",
  logistics: "/images/brand/ulink-industry-card-logistics-royal-v1.webp",
  pharmaceutical: "/images/brand/ulink-industry-card-pharma-royal-v1.webp",
  food: "/images/brand/ulink-industry-card-food-royal-v1.webp",
  manufacturing: "/images/brand/ulink-industry-card-hvac-royal-v1.webp",
  electronics: "/images/brand/ulink-industry-card-electronics-royal-v1.webp",
};

const localized = {
  vi: {
    breadcrumbHome: "Trang chủ",
    breadcrumbCurrent: "Ngành nghề",
    heroTitle:
      "Tối ưu chuỗi cung ứng nguyên liệu và vật tư với giải pháp Phòng sạch & Đóng gói.",
    heroDescription:
      "ULink Industries thấu hiểu tiêu chuẩn khắt khe và thách thức vận hành trong từng ngành. Giải pháp được chuẩn hóa để nâng cao chất lượng, an toàn và hiệu suất sản xuất.",
    heroCta: "Liên hệ với Chúng tôi",
    heroAlt: "Hệ sinh thái giải pháp vật tư theo ngành của ULink Industries",
    sectionTitle: "Giải pháp theo ngành nghề",
    sectionDescription:
      "Các giải pháp phòng sạch và đóng gói được thiết kế phù hợp với đặc thù và yêu cầu riêng của sáu nhóm ngành sản xuất trọng điểm.",
    viewDetails: "Xem chi tiết",
    industries: [
      [
        "furniture",
        "Nội thất",
        "Armchair",
        images.furniture,
        "Bảo vệ bề mặt gỗ, da, vải và kim loại trong sản xuất, vận chuyển và lắp đặt nội thất cao cấp.",
        [
          "Màng bọc PE bảo vệ bề mặt gỗ & da",
          "Bao bì carton chống va đập & xốp định hình",
          "Túi chống ẩm cho linh kiện & phụ kiện",
        ],
      ],
      [
        "logistics",
        "Kho & Logistics",
        "Warehouse",
        images.logistics,
        "Tối ưu lưu kho, vận chuyển và phân phối bằng hệ vật tư đóng gói bảo vệ chuyên dụng.",
        [
          "Màng co và màng quấn pallet",
          "Bao bì chống ẩm, chống va đập",
          "Vật tư đóng gói và dán nhãn kho",
        ],
      ],
      [
        "pharmaceutical-cosmetics",
        "Dược phẩm & Mỹ phẩm",
        "Pill",
        images.pharmaceutical,
        "Vật tư kiểm soát nhiễm bẩn, bao bì và bảo hộ phù hợp môi trường sản xuất được kiểm soát.",
        [
          "Khẩu trang và găng tay theo tiêu chuẩn",
          "Dụng cụ bảo hộ dùng một lần",
          "Bao bì chuyên dụng cho môi trường sạch",
        ],
      ],
      [
        "food-beverage",
        "Thực phẩm & Đồ uống",
        "Utensils",
        images.food,
        "Giải pháp bao bì, bảo hộ và vệ sinh cho quy trình chế biến thực phẩm và đồ uống.",
        [
          "Màng bọc và túi đóng gói an toàn",
          "Trang phục bảo hộ cho công nhân chế biến",
          "Kiểm soát vi sinh bề mặt thiết bị",
        ],
      ],
      [
        "construction",
        "Cơ khí chế tạo & HVAC",
        "Wrench",
        images.manufacturing,
        "Vật tư cơ khí, phụ kiện và giải pháp bảo vệ cho hệ thống HVAC và sản xuất công nghiệp.",
        [
          "Màng PE đóng kiện và dây đai chịu lực",
          "Dầu mỡ bôi trơn và hóa chất công nghiệp",
          "Kẹp cơ khí và màng chống gỉ VCI",
        ],
      ],
      [
        "electronics",
        "Điện tử & Bán dẫn",
        "Cpu",
        images.electronics,
        "Kiểm soát bụi và tĩnh điện để bảo vệ linh kiện nhạy cảm trong môi trường sản xuất điện tử.",
        [
          "Trang phục phòng sạch & PPE",
          "Sản phẩm chống tĩnh điện ESD",
          "Bao bì chống ẩm và shielding đa lớp",
        ],
      ],
    ],
  },
  en: {
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Industries",
    heroTitle:
      "Optimizing material supply chains with Cleanroom & Packaging solutions.",
    heroDescription:
      "ULink Industries understands the strict standards and operational challenges of every sector. Our governed solutions improve quality, safety and production performance.",
    heroCta: "Contact us",
    heroAlt: "ULink Industries multi-sector material solution ecosystem",
    sectionTitle: "Solutions by industry",
    sectionDescription:
      "Cleanroom and packaging solutions configured for six priority manufacturing groups.",
    viewDetails: "View details",
    industries: [
      [
        "furniture",
        "Furniture & Interior",
        "Armchair",
        images.furniture,
        "Surface protection for wood, leather, fabric and metal throughout manufacturing, transport and installation.",
        [
          "PE protection for wood & leather",
          "Impact-resistant cartons & molded foam",
          "Moisture barriers for components",
        ],
      ],
      [
        "logistics",
        "Warehouse & Logistics",
        "Warehouse",
        images.logistics,
        "Specialized protective packaging for efficient warehousing, transport and distribution.",
        [
          "Shrink film and pallet wrap",
          "Moisture and impact protection",
          "Warehouse packaging and labels",
        ],
      ],
      [
        "pharmaceutical-cosmetics",
        "Pharmaceuticals & Cosmetics",
        "Pill",
        images.pharmaceutical,
        "Contamination-control, packaging and PPE supplies for controlled manufacturing environments.",
        [
          "Standards-based masks and gloves",
          "Single-use protective equipment",
          "Packaging for clean environments",
        ],
      ],
      [
        "food-beverage",
        "Food & Beverage",
        "Utensils",
        images.food,
        "Packaging, PPE and hygiene systems for food and beverage processing operations.",
        [
          "Food-safe wraps and bags",
          "Protective clothing for operators",
          "Equipment-surface microbial control",
        ],
      ],
      [
        "construction",
        "Engineering & HVAC",
        "Wrench",
        images.manufacturing,
        "Engineering materials, fittings and protective solutions for HVAC and industrial production.",
        [
          "PE unitization film and strapping",
          "Industrial lubricants and chemicals",
          "Mechanical clamps and VCI film",
        ],
      ],
      [
        "electronics",
        "Electronics & Semiconductors",
        "Cpu",
        images.electronics,
        "Dust and ESD control that protects sensitive components in electronics manufacturing.",
        [
          "Cleanroom garments & PPE",
          "Specialized ESD control products",
          "Multi-layer moisture and shielding bags",
        ],
      ],
    ],
  },
  ja: {
    breadcrumbHome: "ホーム",
    breadcrumbCurrent: "業界別",
    heroTitle:
      "クリーンルームと包装ソリューションで資材サプライチェーンを最適化。",
    heroDescription:
      "ULink Industries は各業界の厳格な基準と運用課題を理解し、品質、安全性、生産性を高める標準化されたソリューションを提供します。",
    heroCta: "お問い合わせ",
    heroAlt: "ULink Industries の業界別資材ソリューション",
    sectionTitle: "業界別ソリューション",
    sectionDescription:
      "6つの主要製造業グループ向けのクリーンルーム・包装ソリューション。",
    viewDetails: "詳しく見る",
    industries: [
      [
        "furniture",
        "家具・インテリア",
        "Armchair",
        images.furniture,
        "製造・輸送・設置工程で木材、革、布、金属の表面を保護します。",
        [
          "木材・革用PE保護フィルム",
          "耐衝撃カートンと成形フォーム",
          "部品用防湿バッグ",
        ],
      ],
      [
        "logistics",
        "倉庫・物流",
        "Warehouse",
        images.logistics,
        "倉庫保管、輸送、流通を最適化する専用保護包装。",
        [
          "シュリンク・パレットラップ",
          "防湿・耐衝撃包装",
          "倉庫用梱包・ラベル資材",
        ],
      ],
      [
        "pharmaceutical-cosmetics",
        "医薬品・化粧品",
        "Pill",
        images.pharmaceutical,
        "管理された製造環境向けの汚染制御、包装、PPE資材。",
        ["規格対応マスク・手袋", "使い捨て保護具", "クリーン環境向け包装"],
      ],
      [
        "food-beverage",
        "食品・飲料",
        "Utensils",
        images.food,
        "食品・飲料加工向けの包装、PPE、衛生システム。",
        ["食品対応ラップ・バッグ", "作業者用保護衣", "設備表面の微生物制御"],
      ],
      [
        "construction",
        "精密機械・HVAC",
        "Wrench",
        images.manufacturing,
        "HVACと産業生産向けの機械資材、継手、保護ソリューション。",
        [
          "PE梱包フィルム・ストラップ",
          "工業用潤滑油・化学品",
          "機械クランプ・VCIフィルム",
        ],
      ],
      [
        "electronics",
        "電子・半導体",
        "Cpu",
        images.electronics,
        "電子製造の精密部品を保護する防塵・ESD制御。",
        ["クリーンルーム衣・PPE", "専用ESD対策製品", "多層防湿・シールド包装"],
      ],
    ],
  },
};

function copyFor(locale) {
  const copy = localized[locale];
  return {
    ...copy,
    industries: copy.industries.map(
      ([slug, name, icon, image, description, bullets]) => ({
        slug,
        name,
        icon,
        image,
        description,
        bullets,
      }),
    ),
  };
}

await loginAdmin(client);
const pages = await client.request(
  readItems("pages", {
    filter: { slug: { _eq: "industries" } },
    fields: [
      "id",
      "content",
      "translations.id",
      "translations.languages_code",
      "translations.content",
    ],
    limit: 1,
  }),
);
const page = pages[0];
if (!page) throw new Error("The industries CMS page does not exist.");

await client.request(
  updateItem("pages", page.id, {
    content: { ...(page.content ?? {}), version: 3, copy: copyFor("vi") },
  }),
);

for (const translation of page.translations ?? []) {
  const locale =
    typeof translation.languages_code === "string"
      ? translation.languages_code
      : translation.languages_code?.code;
  if (!localized[locale]) continue;
  await client.request(
    updateItem("pages_translations", translation.id, {
      content: {
        ...(translation.content ?? page.content ?? {}),
        version: 3,
        copy: copyFor(locale),
      },
    }),
  );
}

console.log(
  "Applied the six-industry Figma presentation to Directus for vi, en and ja.",
);
process.exit(0);
