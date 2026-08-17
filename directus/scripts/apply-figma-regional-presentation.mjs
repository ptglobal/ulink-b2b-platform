import { readItems, updateItem } from "@directus/sdk";
import { createDirectusClient, loginAdmin } from "../lib/config.mjs";

const client = createDirectusClient();

const hubsByLocale = {
  vi: [
    [
      "01",
      "Bắc Ninh",
      "VSIP Bắc Ninh, Tiên Sơn",
      "bac-ninh",
      "/regional-hubs/bac-ninh",
      21.18,
      106.07,
    ],
    [
      "02",
      "Hải Phòng",
      "DEEP C, Tràng Duệ",
      "hai-phong",
      "/regional-hubs/hai-phong",
      20.9,
      106.68,
    ],
    [
      "03",
      "Hưng Yên",
      "KCN Thăng Long II",
      "hung-yen",
      "/regional-hubs/hung-yen",
      20.91,
      106.01,
    ],
    [
      "04",
      "Bình Dương",
      "VSIP I, II, III",
      "binh-duong",
      "/contact?hub=binh-duong",
      11.17,
      106.67,
    ],
  ],
  en: [
    [
      "01",
      "Bac Ninh",
      "VSIP Bac Ninh, Tien Son",
      "bac-ninh",
      "/regional-hubs/bac-ninh",
      21.18,
      106.07,
    ],
    [
      "02",
      "Hai Phong",
      "DEEP C, Trang Due",
      "hai-phong",
      "/regional-hubs/hai-phong",
      20.9,
      106.68,
    ],
    [
      "03",
      "Hung Yen",
      "Thang Long II Industrial Park",
      "hung-yen",
      "/regional-hubs/hung-yen",
      20.91,
      106.01,
    ],
    [
      "04",
      "Binh Duong",
      "VSIP I, II, III",
      "binh-duong",
      "/contact?hub=binh-duong",
      11.17,
      106.67,
    ],
  ],
  ja: [
    [
      "01",
      "バクニン",
      "VSIP バクニン、ティエンソン",
      "bac-ninh",
      "/regional-hubs/bac-ninh",
      21.18,
      106.07,
    ],
    [
      "02",
      "ハイフォン",
      "DEEP C、チャンズエ",
      "hai-phong",
      "/regional-hubs/hai-phong",
      20.9,
      106.68,
    ],
    [
      "03",
      "フンイエン",
      "タンロン II 工業団地",
      "hung-yen",
      "/regional-hubs/hung-yen",
      20.91,
      106.01,
    ],
    [
      "04",
      "ビンズオン",
      "VSIP I、II、III",
      "binh-duong",
      "/contact?hub=binh-duong",
      11.17,
      106.67,
    ],
  ],
};

const localeCopy = {
  vi: {
    networkEyebrow: "VIỆT NAM / MẠNG LƯỚI HUB",
    networkTitle: "Mạng lưới trung tâm vùng",
    networkSubtitle:
      "04 hub chiến lược kết nối trực tiếp các vùng sản xuất trọng điểm",
    liveLabel: "NETWORK ONLINE",
    signature: "ULINK INDUSTRIAL NETWORK // LIVE DATA • 04 HUBS",
    stats: {
      distance: [
        "Khoảng cách phục vụ trung bình",
        "15",
        "km",
        "Tính từ trung tâm cụm công nghiệp",
      ],
      delivery: [
        "Thời gian giao hàng trung bình",
        "< 1",
        "ngày",
        "Trong phạm vi cụm",
      ],
      zones: ["Số lượng đối tác", "120+", "", "Đồng hành và phát triển"],
    },
    dashboardTitle: "Hiệu suất mạng lưới hôm nay",
    sourceLabel: "Cập nhật: 10:30 AM",
    dashboard: {
      capacity: ["Đơn hàng hôm nay", "1,206", "đơn", "+8.8% so với hôm qua"],
      onTime: [
        "Tỷ lệ giao hàng đúng hạn",
        "98.7",
        "%",
        "+2.1% trong phạm vi cụm",
      ],
      hubs: ["Đang hoạt động", "352", "xe", "Theo dõi hành trình thực tế"],
      warehouse: ["Tổng diện tích kho", "10,000", "m²", "Hub Hà Nam"],
    },
    featured: {
      displayName: "Hub Hà Nam",
      eyebrow: "TRUNG TÂM PHÂN PHỐI HÀ NAM",
      title: "Kết nối các KCN trọng điểm, giao hàng tức thì",
      description:
        "Trung tâm phân phối Hà Nam kết nối trực tiếp các khu công nghiệp trọng điểm phía Bắc, duy trì tồn kho sẵn có và điều phối giao hàng theo SLA cho từng doanh nghiệp.",
      primary: "Liên hệ Sales",
      secondary: "Tìm hiểu thêm",
    },
  },
  en: {
    networkEyebrow: "VIETNAM / HUB NETWORK",
    networkTitle: "Regional hub network",
    networkSubtitle:
      "Four strategic hubs directly connecting Vietnam’s key manufacturing regions",
    liveLabel: "NETWORK ONLINE",
    signature: "ULINK INDUSTRIAL NETWORK // LIVE DATA • 04 HUBS",
    stats: {
      distance: [
        "Average service distance",
        "15",
        "km",
        "From the center of each industrial cluster",
      ],
      delivery: [
        "Average delivery time",
        "< 1",
        "day",
        "Within the local cluster",
      ],
      zones: [
        "Business partners",
        "120+",
        "",
        "Growing together across Vietnam",
      ],
    },
    dashboardTitle: "Today’s network performance",
    sourceLabel: "Updated: 10:30 AM",
    dashboard: {
      capacity: ["Orders today", "1,206", "orders", "+8.8% versus yesterday"],
      onTime: [
        "On-time delivery rate",
        "98.7",
        "%",
        "+2.1% within local clusters",
      ],
      hubs: ["In operation", "352", "vehicles", "Live journey monitoring"],
      warehouse: ["Total warehouse area", "10,000", "m²", "Ha Nam Hub"],
    },
    featured: {
      displayName: "Ha Nam Hub",
      eyebrow: "HA NAM DISTRIBUTION CENTER",
      title: "Connecting key industrial parks with immediate delivery",
      description:
        "The Ha Nam distribution center connects key northern industrial parks, maintains ready inventory and coordinates SLA-based delivery for each enterprise.",
      primary: "Contact sales",
      secondary: "Learn more",
    },
  },
  ja: {
    networkEyebrow: "ベトナム / ハブネットワーク",
    networkTitle: "地域ハブネットワーク",
    networkSubtitle: "主要製造地域を直接結ぶ4つの戦略ハブ",
    liveLabel: "NETWORK ONLINE",
    signature: "ULINK INDUSTRIAL NETWORK // LIVE DATA • 04 HUBS",
    stats: {
      distance: ["平均サービス距離", "15", "km", "各工業団地の中心から算出"],
      delivery: ["平均配送時間", "< 1", "日", "同一クラスター内"],
      zones: ["パートナー企業", "120+", "", "ベトナム全土で共に成長"],
    },
    dashboardTitle: "本日のネットワーク実績",
    sourceLabel: "更新: 10:30 AM",
    dashboard: {
      capacity: ["本日の注文", "1,206", "件", "前日比 +8.8%"],
      onTime: ["定時配送率", "98.7", "%", "地域内で +2.1%"],
      hubs: ["稼働中", "352", "台", "配送状況をリアルタイム追跡"],
      warehouse: ["倉庫総面積", "10,000", "m²", "ハナム・ハブ"],
    },
    featured: {
      displayName: "ハナム・ハブ",
      eyebrow: "ハナム配送センター",
      title: "主要工業団地を結ぶ迅速な配送",
      description:
        "ハナム配送センターは北部の主要工業団地を直接結び、在庫を確保しながら企業ごとのSLAに沿って配送を調整します。",
      primary: "営業に連絡",
      secondary: "詳しく見る",
    },
  },
};

function metric([label, value, unit, note]) {
  return { label, value, unit, note };
}

function presentationHubs(locale) {
  return hubsByLocale[locale].map(
    ([number, name, zones, slug, href, lat, lon]) => ({
      id: `figma-${slug}`,
      number,
      name,
      zones,
      slug,
      href,
      lat,
      lon,
    }),
  );
}

function patchContent(content, locale) {
  const base = content && typeof content === "object" ? content : {};
  const copy = base.copy && typeof base.copy === "object" ? base.copy : {};
  const local = localeCopy[locale];

  return {
    ...base,
    version: 6,
    copy: {
      ...copy,
      network: {
        ...(copy.network ?? {}),
        eyebrow: local.networkEyebrow,
        title: local.networkTitle,
        subtitle: local.networkSubtitle,
        liveLabel: local.liveLabel,
        signature: local.signature,
        hubs: presentationHubs(locale),
      },
      stats: {
        distance: metric(local.stats.distance),
        delivery: metric(local.stats.delivery),
        zones: metric(local.stats.zones),
      },
      dashboard: {
        ...(copy.dashboard ?? {}),
        title: local.dashboardTitle,
        sourceLabel: local.sourceLabel,
        capacity: metric(local.dashboard.capacity),
        onTime: metric(local.dashboard.onTime),
        hubs: metric(local.dashboard.hubs),
        warehouse: metric(local.dashboard.warehouse),
      },
      featuredHub: {
        ...(copy.featuredHub ?? {}),
        slug: "ha-nam",
        displayName: local.featured.displayName,
        eyebrow: local.featured.eyebrow,
        title: local.featured.title,
        description: local.featured.description,
        primaryAction: { label: local.featured.primary, href: "/quick-order" },
        secondaryAction: {
          label: local.featured.secondary,
          href: "/about/capabilities",
        },
      },
    },
  };
}

await loginAdmin(client);

const pages = await client.request(
  readItems("pages", {
    filter: { slug: { _eq: "regional-hubs" } },
    fields: ["id", "content"],
    limit: 1,
  }),
);

if (!pages.length)
  throw new Error("The regional-hubs CMS page does not exist.");

const page = pages[0];
await client.request(
  updateItem("pages", page.id, { content: patchContent(page.content, "vi") }),
);

const translations = await client.request(
  readItems("pages_translations", {
    filter: {
      pages_id: { _eq: page.id },
      languages_code: { _in: ["vi", "en", "ja"] },
    },
    fields: ["id", "languages_code", "content"],
    limit: 10,
  }),
);

for (const translation of translations) {
  const locale = translation.languages_code;
  await client.request(
    updateItem("pages_translations", translation.id, {
      content: patchContent(translation.content, locale),
    }),
  );
}

console.log(
  "Applied the four-hub Figma presentation to Directus without changing operational hub records.",
);
process.exit(0);
