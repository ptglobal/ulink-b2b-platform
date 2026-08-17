import { readItems, updateItem } from "@directus/sdk";
import { createDirectusClient, loginAdmin } from "../lib/config.mjs";

const client = createDirectusClient();

const figmaIndustries = [
  {
    slug: "furniture",
    name: "Nội thất",
    icon: "Armchair",
    image: "/images/brand/ulink-industry-card-furniture-royal-v1.webp",
    description:
      "Bảo vệ toàn diện bề mặt gỗ, da, vải và kim loại trong suốt quy trình sản xuất, vận chuyển và lắp đặt nội thất cao cấp.",
    bullets: [
      "Màng bọc PE bảo vệ bề mặt gỗ & da",
      "Bao bì carton chống va đập & xốp định hình",
      "Túi chống ẩm cho linh kiện & phụ kiện nội thất",
    ],
  },
  {
    slug: "logistics",
    name: "Kho & Logistics",
    icon: "Warehouse",
    image: "/images/brand/ulink-industry-card-logistics-royal-v1.webp",
    description:
      "Tối ưu hóa quy trình lưu kho, vận chuyển và phân phối hàng hóa với giải pháp bao bì bảo vệ chuyên dụng từ ULink Industries.",
    bullets: [
      "Màng co, màng quấn pallet bảo vệ hàng hóa",
      "Bao bì chống ẩm, chống va đập khi vận chuyển",
      "Vật tư đóng gói & dán nhãn cho kho bãi",
    ],
  },
  {
    slug: "pharmaceutical-cosmetics",
    name: "Dược phẩm",
    icon: "Pill",
    image: "/images/brand/ulink-industry-card-pharma-royal-v1.webp",
    description:
      "Các sản phẩm bảo hộ y tế chất lượng cao, phục vụ môi trường khám chữa bệnh, phẫu thuật chuẩn vô trùng.",
    bullets: [
      "Khẩu trang y tế, găng tay vô trùng tiêu chuẩn",
      "Dụng cụ bảo hộ phẫu thuật dùng một lần",
      "Bao bì và hộp đựng rác thải y tế chuyên dụng",
    ],
  },
  {
    slug: "food-beverage",
    name: "Thực phẩm",
    icon: "Utensils",
    image: "/images/brand/ulink-industry-card-food-royal-v1.webp",
    description:
      "Giải pháp bao bì chuyên dụng cho ngành thực phẩm & đồ uống — màng co PE, màng bọc thực phẩm, bảo quản tươi ngon, đạt chuẩn ISO 22000.",
    bullets: [
      "Màng bọc, túi đóng gói thực phẩm an toàn",
      "Trang phục bảo hộ cho công nhân chế biến",
      "Giải pháp kiểm soát vi sinh bề mặt thiết bị",
    ],
  },
  {
    slug: "construction",
    name: "Cơ khí chế tạo & HVAC",
    icon: "Wrench",
    image: "/images/brand/ulink-industry-card-hvac-royal-v1.webp",
    description:
      "Cung cấp vật tư cơ khí, phụ kiện ống đồng, van điều khiển và thiết bị HVAC chính hãng cho hệ thống điều hòa không khí và thông gió công nghiệp.",
    bullets: [
      "Màng PE đóng kiện, dây đai chịu lực lớn",
      "Dầu, mỡ bôi trơn và hóa chất công nghiệp",
      "Kẹp cơ khí và màng chống rỉ sét VCI",
    ],
  },
  {
    slug: "electronics",
    name: "Điện tử",
    icon: "Cpu",
    image: "/images/brand/ulink-industry-card-electronics-royal-v1.webp",
    description:
      "Đảm bảo môi trường sản xuất không ô nhiễm hạt bụi và tĩnh điện, bảo vệ cấu trúc nhạy cảm của vi mạch.",
    bullets: [
      "Phòng sạch & trang phục bảo hộ PPE",
      "Sản phẩm chống tĩnh điện ESD chuyên dụng",
      "Bao bì chống ẩm, chống từ trường đa lớp",
    ],
  },
];

await loginAdmin(client);

const [page] = await client.request(
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

if (!page) throw new Error("Industries page was not found in Directus.");

const nextDefaultContent = {
  ...(page.content ?? {}),
  version: 4,
  copy: {
    ...(page.content?.copy ?? {}),
    industries: figmaIndustries,
  },
};

await client.request(
  updateItem("pages", page.id, { content: nextDefaultContent }),
);

const vietnamese = (page.translations ?? []).find((translation) => {
  const language =
    typeof translation.languages_code === "string"
      ? translation.languages_code
      : translation.languages_code?.code;
  return language === "vi";
});

if (!vietnamese)
  throw new Error("Vietnamese industries translation was not found.");

await client.request(
  updateItem("pages_translations", vietnamese.id, {
    content: {
      ...(vietnamese.content ?? nextDefaultContent),
      version: 4,
      copy: {
        ...(vietnamese.content?.copy ?? nextDefaultContent.copy),
        industries: figmaIndustries,
      },
    },
  }),
);

console.log(
  "Synchronized the Vietnamese industries card content with the Figma frame.",
);
