# Skill 12 — SEO & i18n (Đa ngôn ngữ) Chuyên sâu | Nguồn: AD-06 §7–9 + AD-03 §7 + NFR-08/09

> Skill chuyên sâu tách từ skill 06, dành cho việc hiện thực **i18n VI/EN/JP** và **SEO + schema markup** ở mức senior. Hai vấn đề này là **xuyên suốt** — áp đồng nhất qua cơ chế dùng chung, KHÔNG vá lẻ theo trang (AD-06 §10).

## PHẦN A — ĐA NGÔN NGỮ (i18n)

### A1. Mô hình hai tầng dịch
ULink dịch ở **2 tầng tách biệt**, đừng trộn lẫn:

| Tầng | Cái gì | Cơ chế | Nguồn |
|---|---|---|---|
| **Chuỗi UI** | Nhãn nút, menu, thông báo, label form | **next-intl** catalog `messages/{vi,en,ja}.json` | Lập trình viên |
| **Nội dung** | Tên SP, mô tả, blog, hub, page | **Directus Translations** trên trường văn bản | CMS/Editor |

> Quy tắc vàng: chuỗi cố định trong code → next-intl; dữ liệu do CMS quản lý → Directus Translations. KHÔNG hard-code chuỗi hiển thị ở bất kỳ đâu (AD-06 §7).

### A2. Cấu hình next-intl (App Router)
- **Locale**: `vi` (mặc định), `en`, `ja`.
- **`localePrefix: 'always'`** → locale luôn là phân đoạn URL đầu tiên: `/vi/...`, `/en/...`, `/ja/...`.
- Chuyển ngôn ngữ **giữ nguyên trang hiện tại** (đổi prefix, giữ slug).

```
src/
├── i18n/
│   ├── routing.ts      # defineRouting({ locales:['vi','en','ja'], defaultLocale:'vi', localePrefix:'always' })
│   └── request.ts      # getRequestConfig → load messages theo locale
├── messages/
│   ├── vi.json         # chia namespace: { "nav": {...}, "rfq": {...}, "portal": {...} }
│   ├── en.json
│   └── ja.json
└── middleware.ts       # next-intl middleware xử lý redirect/locale
```

### A3. Đọc nội dung Directus theo locale
Frontend yêu cầu bản dịch qua `deep` / `translations` theo locale hiện hành (AD-05 §3):
```http
GET /items/products/7
  ?fields=*,translations.*
  &deep[translations][_filter][languages_code][_eq]=vi
```
Đặt logic này trong `@/lib/directus` (không ở component) — truyền `locale` xuống như tham số.

### A4. Quy tắc dự phòng (fallback) — BẮT BUỘC
| Tình huống | Xử lý |
|---|---|
| Thiếu **bản dịch nội dung** | Lùi về **VI** + **đánh dấu cho biên tập** (không để trống) |
| Thiếu **khóa UI** (next-intl) | **CI FAIL** (i18n key-check) — KHÔNG render khóa thô ra UI |

→ Cổng CI `i18n key-check` so 3 catalog, thiếu khóa ở bất kỳ locale nào thì chặn merge (skill 10 §4).

### A5. Định dạng số/ngày/tiền tệ
- Dùng `Intl` (qua next-intl format) cho ngày, số, tiền tệ.
- **Tiền tệ hiển thị VND** (dữ liệu lưu `decimal(15,2)` — AD-04 §2).

### A6. Trạng thái nội dung lúc go-live (kỳ vọng thực tế)
- **VI**: 100%.
- **EN**: 100% trang chính/cấu trúc.
- **JP**: trang chủ, hub, trang sản phẩm trọng yếu + cấu trúc; phần JP còn lại bổ sung qua CMS sau.

→ Khi code, đảm bảo trang **render được kể cả khi JP thiếu nội dung** (nhờ fallback A4).

## PHẦN B — SEO

### B1. URL & canonical & hreflang
- URL sạch theo **slug** (viết thường, ổn định, dễ đọc), có **tiền tố locale**.
- Mỗi trang phát **canonical** + **hreflang cho mọi locale + `x-default`** (AD-06 §7.3, §9).
- `x-default` thường trỏ về VI (mặc định).

```tsx
// PSEUDO — generateMetadata trong app/[locale]/products/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const p = await getProduct(params.slug, params.locale); // qua @/lib/directus
  return {
    title: p.meta_title,                       // CMS điều khiển, mặc định site_settings
    description: p.meta_description,
    alternates: {
      canonical: `/${params.locale}/products/${p.slug}`,
      languages: {
        vi: `/vi/products/${p.slug}`,
        en: `/en/products/${p.slug}`,
        ja: `/ja/products/${p.slug}`,
        "x-default": `/vi/products/${p.slug}`,
      },
    },
    openGraph: { title: p.meta_title, description: p.meta_description /* ... */ },
  };
}
```

### B2. Metadata do CMS điều khiển
- `title` / `description` / Open Graph (`meta_*`) **do CMS điều khiển**, mặc định từ `site_settings` (AD-06 §9).
- **Mẫu tiêu đề**: `%s · ULink Industries`.
- Mỗi collection nội dung có `meta_title` / `meta_description` (i18n) — ghi đè SEO (AD-04 §5.x).

### B3. JSON-LD theo loại trang
> Đặt builder JSON-LD trong `@/lib/seo.ts` dùng chung, không viết lẻ từng trang.

| Trang | Schema | Trường chính |
|---|---|---|
| Toàn cục (layout) | `Organization` | logo, liên hệ, `sameAs` (mạng XH từ `site_settings`) |
| Chi tiết sản phẩm | `Product` | name, sku, brand, `+ Offer/RFQ` (không giá checkout) |
| Listing / chi tiết | `BreadcrumbList` | theo điều hướng breadcrumb |
| Bài blog | `Article` | title, author, `published_at`, cover |
| Khối FAQ (nơi có) | `FAQPage` | cặp câu hỏi/đáp |

> Lưu ý mô hình RFQ (ADR-0008): `Product` schema có thể kèm `Offer` nhưng **không có giá thanh toán online** — phản ánh đúng "không checkout".

### B4. sitemap.xml & robots.txt (sinh tự động)
- `app/sitemap.ts` sinh **mọi locale** (tạo entry cho `/vi`, `/en`, `/ja` của mỗi URL); lấy danh sách từ Directus (chỉ `status = published`).
- `app/robots.ts` sinh `robots.txt`.
- **Loại trừ**: trang **cổng** (`/portal/*`) và nội dung **chưa publish** (AD-06 §9, BR-01).

```tsx
// PSEUDO app/sitemap.ts
export default async function sitemap() {
  const products = await getPublishedProductSlugs(); // chỉ published
  const locales = ['vi','en','ja'];
  return products.flatMap(p =>
    locales.map(l => ({
      url: `https://ulink.vn/${l}/products/${p.slug}`,
      alternates: { languages: Object.fromEntries(locales.map(x => [x, `https://ulink.vn/${x}/products/${p.slug}`])) },
    }))
  );
  // KHÔNG include /portal/* và draft/archived
}
```

### B5. Render phục vụ SEO
- Trang marketing/nội dung dùng **SSG/ISR** → render sẵn theo từng locale, revalidate khi publish (AD-03 §6, skill 06 §6.1).
- Cổng dùng **SSR (auth)** và **bị loại khỏi sitemap/index**.

## PHẦN C — KIỂM CHỨNG (gắn NFR-08/09)

| Hạng mục | Kiểm chứng | NFR |
|---|---|---|
| Chuyển ngôn ngữ VI/EN/JP + hreflang | Demo chuyển ngôn ngữ; kiểm hreflang | NFR-08 |
| URL/metadata/schema đúng | Trình kiểm rich-results; schema checker | NFR-09 |
| Thiếu khóa UI | CI i18n key-check FAIL nếu thiếu | NFR-08 |
| sitemap/robots đúng | Mở `/sitemap.xml`, `/robots.txt`; xác nhận loại trừ cổng/draft | NFR-09 |
| Canonical + x-default | Kiểm từng trang | NFR-09 |

## Checklist SEO/i18n khi code một trang
- [ ] Chuỗi UI qua next-intl (namespace đúng), KHÔNG hard-code?
- [ ] Nội dung đọc theo `locale` qua `@/lib/directus` (deep translations)?
- [ ] Có fallback: nội dung thiếu → VI + đánh dấu; khóa UI thiếu → CI fail?
- [ ] `generateMetadata` trả title/description từ CMS (mặc định site_settings), mẫu `%s · ULink Industries`?
- [ ] Canonical + hreflang mọi locale + x-default?
- [ ] JSON-LD đúng loại trang (builder dùng chung `@/lib/seo`)?
- [ ] Trang vào sitemap (nếu công khai) / bị loại nếu là cổng hoặc chưa publish?
- [ ] Render đúng (ISR cho công khai, SSR cho cổng)?
- [ ] Số/ngày/tiền tệ qua Intl; tiền tệ VND?
