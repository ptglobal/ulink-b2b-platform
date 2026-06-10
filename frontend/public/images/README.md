# Static Images — `public/images`

Quy ước tổ chức tài nguyên ảnh **tĩnh** của frontend. Mọi file ở đây được phục vụ tại đường dẫn gốc `/images/...` (vd `public/images/logo/ulink-mark.svg` → `/images/logo/ulink-mark.svg`).

## Tĩnh (repo) vs CMS (Directus) — ranh giới quan trọng

| Loại ảnh | Nguồn | Đặt ở đâu |
|---|---|---|
| Logo, favicon, OG mặc định, nền trang trí, placeholder | **Tĩnh** | `public/images`, `public/icons`, `public/og` |
| Ảnh sản phẩm, banner hero, ảnh hub, logo đối tác, blog/case study | **CMS (Directus Files)** | KHÔNG để ở đây — tải qua `next/image` từ Directus assets |

> Nội dung do biên tập viên quản lý (sản phẩm, hub, banner trang chủ…) đến từ Directus và hiển thị qua `next/image` với `remotePatterns` đã cấu hình trong `next.config.mjs`. Chỉ đặt vào `public/` những asset **thương hiệu/tĩnh không do CMS quản lý**.

## Cấu trúc thư mục

```
public/
├── images/
│   ├── logo/           # Logo thương hiệu (SVG ưu tiên)
│   ├── banners/        # Ảnh nền/hero TĨNH dùng chung (vd nền trang login)
│   ├── backgrounds/    # Hoa văn, texture, gradient trang trí
│   ├── partners/       # Logo đối tác dạng tĩnh (nếu không qua CMS)
│   ├── illustrations/  # Minh hoạ, empty-state, hình kỹ thuật
│   └── placeholders/   # Ảnh fallback khi thiếu media CMS
├── icons/              # favicon, apple-touch-icon, icon PWA
└── og/                 # Ảnh chia sẻ mạng xã hội (Open Graph) mặc định
```

## Quy ước đặt tên (bắt buộc)

- **kebab-case**, không dấu, không khoảng trắng: `ulink-mark.svg`, `login-hero.webp`.
- Tiền tố theo ngữ cảnh khi cần: `og-default.png`, `bg-dot-grid.svg`, `partner-acme.svg`.
- Biến thể theo hậu tố: `-white` (nền tối), `-dark`, `-mark` (chỉ icon), `@2x` (mật độ cao).
- Locale (hiếm khi cần cho ảnh): hậu tố `-vi` / `-en` / `-ja`.

## Định dạng & tối ưu (NFR-01 — hiệu năng)

- **Logo / icon / hoa văn** → **SVG** (sắc nét mọi kích thước, nhẹ). Outline font khi export để không phụ thuộc font hệ thống.
- **Ảnh chụp** → **WebP** (hoặc AVIF) thay JPG/PNG; PNG chỉ khi cần nền trong suốt không vector hoá được.
- Luôn dùng `next/image` (lazy-load, responsive, tối ưu) — KHÔNG dùng `<img>` trực tiếp cho ảnh nội dung.
- Cung cấp `width`/`height` thật để tránh CLS (Core Web Vitals).
- Ảnh hero/above-the-fold: cân nhắc `priority`.

## Khả năng tiếp cận (WCAG 2.1 AA)

- Mọi ảnh có ý nghĩa → `alt` mô tả (lấy từ CMS với ảnh nội dung).
- Ảnh trang trí thuần → `alt=""` + `aria-hidden` nếu là SVG inline.

## Tham chiếu trong code (chuẩn senior)

- KHÔNG rải chuỗi đường dẫn khắp nơi. Dùng hằng số tập trung tại `src/lib/assets.ts` (xem ví dụ dưới) hoặc component `<Logo />`.

```ts
// src/lib/assets.ts (gợi ý)
export const ASSETS = {
  logo: {
    full: '/images/logo/ulink-logo.svg',
    mark: '/images/logo/ulink-mark.svg',
    white: '/images/logo/ulink-logo-white.svg'
  },
  og: { default: '/og/og-default.png' }
} as const;
```

## Logo có sẵn (tái dựng — thay bằng bản chính thức)

| File | Dùng cho |
|---|---|
| `logo/ulink-mark.svg` | Icon U-mark (favicon, header thu gọn, mobile) |
| `logo/ulink-logo.svg` | Logo ngang đầy đủ (nền sáng) |
| `logo/ulink-logo-white.svg` | Logo ngang (nền tối — vd panel login) |

> Màu thương hiệu: **xanh `#2563EB`** (hsl 221 83% 53%). Khi có file logo chính thức từ Figma/brand, ghi đè các file này giữ nguyên tên để không phải sửa code.
