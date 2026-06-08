# Skill 06 — Thiết kế Giao diện & Trải nghiệm (UI/UX) | Nguồn: ULINK-AD-06

> Hệ thiết kế **"Japanese Industrial Minimalism"**, hiện thực bằng **Tailwind CSS + Shadcn/UI**, token-driven, WCAG 2.1 AA. Đây là sản phẩm bàn giao "Hệ thiết kế UI/UX" theo hợp đồng.

## 1. Ngôn ngữ thiết kế
- **Điềm tĩnh, kỹ thuật, chính xác**: khoảng trắng rộng, bảng màu tiết chế, bo góc gần vuông, điểm nhấn monospace cho mã và nhãn.
- **Lấy nội dung làm trung tâm**: kiểu chữ và lưới gánh phần thiết kế; trang trí tối thiểu.
- **Tin cậy thể hiện bằng dữ liệu**: SLA, chứng nhận, thông số trình bày như dữ liệu sạch, không phải lời quảng cáo.

## 2. Design token (RẤT QUAN TRỌNG)

> Token là biến CSS dạng **HSL** được Tailwind tiêu thụ. Component **KHÔNG hard-code màu** — luôn tham chiếu token (vd `bg-primary`, `text-muted-foreground`). Token chỉ thay đổi trong `globals.css`.

### 2.1. Màu sắc
| Token | HSL | Dùng cho |
|---|---|---|
| `--background` | `40 30% 98%` | Nền giấy ấm |
| `--foreground` | `220 18% 12%` | Chữ mực |
| `--primary` | `222 38% 22%` | Chàm thép sâu — hành động chính |
| `--accent` | `8 72% 52%` | Đỏ son (shu-iro) — nhấn mạnh tiết chế |
| `--muted` / `--muted-foreground` | `40 16% 94%` / `220 10% 40%` | Bề mặt / chữ phụ |
| `--border` / `--input` / `--ring` | `220 14% 88%` / … / `222 38% 22%` | Đường kẻ, ô nhập, vòng focus |
| `--card` / `--card-foreground` | `0 0% 100%` / `220 18% 12%` | Bề mặt nổi |

> Chế độ tối giữ chỗ (`darkMode: 'class'`) nhưng KHÔNG nằm trong phạm vi go-live.

### 2.2. Kiểu chữ
- **Sans**: Inter (`--font-sans`) — UI và body.
- **Mono**: IBM Plex Mono (`--font-mono`) — mã SKU, nhãn, eyebrow, dữ liệu.
- **Thang cỡ**: Tailwind `text-xs … text-6xl`. H1 `text-4xl→6xl` semibold `tracking-tight`; body `text-base/lg`; eyebrow `text-xs uppercase tracking-[0.2em]`.

### 2.3. Khoảng cách, bo góc, lưới
- **Container**: căn giữa, padding `1.5rem`, tối đa `1280px`.
- **Bo góc**: `--radius: 0.25rem` (sắc); md/sm dẫn xuất.
- **Nhịp section**: `py-24 md:py-32` cho hero/landing; `py-16` cho nội dung.

## 3. Danh mục component

> Primitive Shadcn/UI cài vào `src/components/ui` và gắn token; component ứng dụng kết hợp chúng.

| Lớp | Component |
|---|---|
| **Primitive Shadcn** | Button, Input, Textarea, Select, Checkbox, Badge, Card, Table, Tabs, Accordion, Dialog, Sheet, Dropdown-menu, Breadcrumb, Pagination, Toast, Skeleton, Form (+ zod) |
| **Ứng dụng** | SiteHeader, SiteFooter, LocaleSwitcher, ProductCard, HubCard, RfqCart, SkuSearch, DocDownload, PortalTable |

## 4. Trạng thái tương tác & khả năng tiếp cận (a11y)
- Mọi phần tử tương tác định nghĩa: **mặc định, hover, focus-visible (vòng), active, disabled, loading**.
- **Trạng thái rỗng và lỗi được thiết kế**, không phải bổ sung sau.
- Độ tương phản **WCAG 2.1 AA** trên tổ hợp token (kiểm tra `accent` trên nền sáng cho chữ nhỏ).
- Vòng focus rõ ràng (`--ring`), landmark ngữ nghĩa, **alt text từ CMS**, điều hướng bàn phím đầy đủ.

## 5. Responsive
- **Ưu tiên mobile**; breakpoint Tailwind: `sm 640` / `md 768` / `lg 1024` / `xl 1280` / `2xl 1280`.
- Điều hướng chính thu gọn thành **sheet** dưới `md`.
- Kiểm chứng trên desktop, tablet, mobile (NFR-04).

## 6. Kiến trúc thông tin & sơ đồ trang

| Đường dẫn | Trang |
|---|---|
| `/[locale]` | Trang chủ |
| `/regional-hubs[/slug]` | Cụm vùng → Đông Văn 4 / Bắc Thăng Long / Bắc Ninh / Hưng Yên / Hải Phòng |
| `/solutions[/category]` | Cleanroom / Packaging (+ danh mục con) |
| `/products/[slug]` | Chi tiết sản phẩm (thông số, TDS/MSDS, mẫu, RFQ) |
| `/industries/[slug]` | Điện tử / Dược / Mỹ phẩm / F&B |
| `/resources (+ con)` | Tài liệu, ISO, Case study, Blog & Tin, Trung tâm Tải |
| `/quick-order` | Nhập SKU · tải hàng loạt · giỏ RFQ · gửi |
| `/portal (+ con)` | Dashboard, Lịch sử đơn, Lịch giao hàng, Công nợ, Đặt lại (auth) |
| `/about` | Công ty · Năng lực · Bền vững · Tuyển dụng · Liên hệ |
| `/api/sku/[code]`, `/api/rfq` | Endpoint API |
| `/sitemap.xml`, `/robots.txt` | SEO |

### 6.1. Ánh xạ Đường dẫn ↔ Dữ liệu ↔ Render (dùng khi code page)
| Đường dẫn | Collection | Render |
|---|---|---|
| `/` | `hero_banners`, `partners`, `case_studies`, `products` | **ISR** |
| `/regional-hubs/[slug]` | `regional_hubs` | **ISR** |
| `/solutions/[category]` | `product_categories`, `products` | **ISR** |
| `/products/[slug]` | `products`, `product_skus`, `documents` | **ISR** |
| `/industries/[slug]` | `industries`, `products` | **ISR** |
| `/resources/*` | `documents`, `iso_certifications`, `case_studies`, `blog_posts` | **ISR** |
| `/quick-order` | `product_skus` (qua `/api/sku`), `rfq_requests` | **client + API** |
| `/portal/*` | `customers`, `orders`, `invoices`, `deliveries` | **SSR (auth)** |
| `/about` | `pages` | **ISR** |

### 6.2. Điều hướng
- **Nav chính**: Cụm vùng, Giải pháp, Ngành, Tài nguyên, Quick Order, Giới thiệu (+ chuyển ngôn ngữ, đăng nhập Cổng).
- **Footer**: công ty, hub, giải pháp, tài nguyên, liên hệ, pháp lý, ngôn ngữ.
- **Breadcrumb**: trên sản phẩm, tài nguyên, chi tiết hub.

### 6.3. Quy tắc URL
Tiền tố locale (`/vi`, `/en`, `/ja`); slug viết thường, ổn định, dễ đọc; canonical + hreflang theo từng trang.

## 7. Đa ngôn ngữ (i18n)
- **Locale**: `vi` (mặc định), `en`, `ja`; locale là **phân đoạn URL đầu tiên** (`localePrefix: 'always'`).
- **Chuỗi UI** qua catalog next-intl (`messages/{vi,en,ja}.json`), chia namespace; **KHÔNG hard-code chuỗi hiển thị**.
- **Nội dung** qua Directus Translations trên trường có văn bản; frontend yêu cầu locale hiện hành.
- Chuyển ngôn ngữ **giữ nguyên trang hiện tại**; hreflang cho mọi locale + x-default.
- **Dự phòng**: thiếu bản dịch nội dung → lùi về VI + đánh dấu cho biên tập; thiếu khóa UI → **CI bắt lỗi**, không render thô.
- **Định dạng** (ngày, số, tiền tệ) qua `Intl`; tiền tệ hiển thị VND.
- **Nội dung lúc go-live**: VI 100% · EN 100% trang chính/cấu trúc · JP trang chủ, hub và trang sản phẩm trọng yếu + cấu trúc; phần JP còn lại bổ sung qua CMS sau.

## 8. Cấu trúc phục vụ SEO
- URL sạch theo slug, tiền tố locale; canonical + hreflang trên mọi trang.
- `title` / `description` / Open Graph (`meta_*`) do CMS điều khiển, mặc định từ `site_settings`; mẫu tiêu đề `%s · ULink Industries`.
- `sitemap.xml` (mọi locale) và `robots.txt` sinh tự động; loại trừ trang cổng/chưa publish.

### Schema JSON-LD theo trang
| Trang | Schema |
|---|---|
| Toàn cục | `Organization` (logo, liên hệ, sameAs) |
| Chi tiết sản phẩm | `Product` (+ Offer/RFQ, brand, sku) |
| Listing / chi tiết | `BreadcrumbList` |
| Bài blog | `Article` |
| Khối FAQ | `FAQPage` (nơi có) |

## 9. Quản trị hệ thiết kế (quy tắc bất biến)
- Token chỉ thay đổi trong `globals.css`; component tiêu thụ token, **không bao giờ hard-code hex**.
- Component mới theo cấu trúc Shadcn + quy ước lập trình.
- Vấn đề xuyên suốt (i18n, a11y, SEO) áp dụng đồng nhất qua cơ chế dùng chung, **không vá lẻ theo từng trang**.

## Checklist khi code UI
- [ ] Dùng token Tailwind, KHÔNG hard-code màu/hex?
- [ ] Chuỗi hiển thị qua next-intl, KHÔNG hard-code?
- [ ] Có đủ trạng thái: default/hover/focus-visible/active/disabled/loading?
- [ ] Có trạng thái rỗng và lỗi được thiết kế?
- [ ] Độ tương phản đạt WCAG 2.1 AA + điều hướng bàn phím?
- [ ] Render đúng chiến lược (ISR/SSR/client) theo §6.1?
- [ ] Trang có canonical + hreflang + JSON-LD phù hợp?
- [ ] Responsive kiểm chứng desktop/tablet/mobile?
