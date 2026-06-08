# Skill 03 — Kiến trúc Hệ thống & Thiết kế Tổng thể (HLD) | Nguồn: ULINK-AD-03

> Cầu nối giữa yêu cầu (AD-01/02) và thiết kế chi tiết (AD-04/05/06/07). Đọc để hiểu **vì sao** hệ thống được thiết kế như vậy và **ranh giới** giữa các thành phần.

## 1. Yếu tố định hướng kiến trúc

Hai điều khoản thương mại chi phối toàn bộ kiến trúc:
- **Đồng sở hữu + royalty 10%** trên các lần triển khai sau.
- **Phí bảo trì hằng năm theo site**.

→ Tư thế kỹ thuật: **"xây một lần, tái triển khai nhiều lần với chi phí thấp"**.

| Yếu tố định hướng | Đáp ứng kiến trúc |
|---|---|
| Chi phí biên thấp mỗi lần triển khai | CMS headless, Docker-Compose, cấu hình env, nội dung seed, design token |
| SEO + hiệu năng mạnh | Next.js App Router SSG/ISR, edge CDN, cache Redis, ngân sách ảnh/JS |
| Trọn phạm vi, ngân sách cố định | Directus cấp sẵn admin/API/auth/RBAC/i18n/media; đội xây model + frontend |
| Tích hợp ERP tương lai | ERP interface (REST + CSV + webhook) đặt sẵn; NestJS BFF hoãn |
| Mã kế thừa được | Phân lớp rõ, ranh giới có kiểu, quy ước CI cưỡng chế |

## 2. Kiến trúc logic — Thành phần và trách nhiệm

```
                    ┌─────────────────────────────────────────┐
  Khách / Customer  │   Vercel Edge / CDN  (SSG/ISR, ảnh)       │
       │            │   Next.js 14 App Router                   │
       ▼            │   - Trang SSG/ISR (marketing, nội dung)   │
   HTTPS  ─────────▶│   - Cổng B2B (SSR, auth)                  │
                    │   - Route handler: /api/sku, /api/rfq     │
                    └───────────────┬─────────────┬─────────────┘
                                    │             │
                       REST/GraphQL │             │ đọc thẳng (cache)
                                    ▼             ▼
                    ┌───────────────────────┐  ┌──────────────┐
   Editor/Sales ───▶│  Directus 11          │  │  Redis 7     │
   (Admin UI)       │  Admin, REST, GraphQL │◀─│  cache SKU   │
                    │  auth, RBAC, i18n,    │  │  <50ms       │
                    │  media, Flows         │  └──────────────┘
                    └───────────┬───────────┘
                                ▼
                    ┌───────────────────────┐
                    │  PostgreSQL 16        │  ◀── ERP interface (tương lai)
                    │  nguồn dữ liệu chuẩn  │      REST + CSV + webhook
                    └───────────────────────┘
```

| Thành phần | Công nghệ | Trách nhiệm |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Trang SSR/ISR, Cổng B2B, route handler API |
| CMS / API | Directus 11 | Admin UI, REST + GraphQL, auth, RBAC + theo dòng, i18n, media |
| CSDL | PostgreSQL 16 | Nguồn dữ liệu chuẩn (nội dung, SP/SKU, đơn, hóa đơn, giao hàng) |
| Cache | Redis 7 | Cache tra cứu SKU (<50ms) + cache phản hồi Directus |
| Edge/CDN | Vercel | Phân phối tĩnh/ISR, tối ưu ảnh, preview |
| Hạ tầng | VPS + Docker Compose | Directus + PostgreSQL + Redis sau Caddy/Nginx (HTTPS) |
| Chống spam | Cloudflare Turnstile | Xác minh con người trên thao tác ghi công khai |

## 3. Chính sách render (RẤT QUAN TRỌNG khi code Next.js)

| Loại trang | Chiến lược | Lý do |
|---|---|---|
| Marketing + nội dung (trang chủ, hub, sản phẩm, ngành, tài nguyên, about) | **SSG / ISR** | Render sẵn theo locale, revalidate khi publish; nhanh + lập chỉ mục |
| Cổng, giỏ RFQ, bộ lọc, chuyển ngôn ngữ, form | **Client / SSR** | Tương tác cô lập trong client component; cổng cần auth |
| `/api/sku`, `/api/rfq` | **Route handler** | SKU đọc Redis; RFQ chống spam → Directus |

→ Ánh xạ chi tiết route ↔ render xem skill 06 §7.1.

## 4. Luồng dữ liệu chính
1. Khách → Vercel Edge/CDN → Next.js (trang SSG/ISR; `/api/sku`; `/api/rfq`).
2. Next.js đọc nội dung qua Directus REST/GraphQL; **tra cứu SKU đọc thẳng Redis** (đổ về Directus khi miss).
3. Directus đọc/ghi PostgreSQL (nguồn dữ liệu chuẩn).
4. Editor/Sales thao tác trên **cùng bản quản trị Directus**.
5. ERP interface (REST + CSV + webhook) đặt cạnh PostgreSQL cho tương lai.

## 5. Vòng publish nội dung & cache (cơ chế cốt lõi)
```
Editor publish trong Directus
        │
        ▼
Directus Flow bắn webhook
        │
        ├──▶ Next.js revalidateTag (ISR) → làm mới các trang liên quan
        └──▶ Redis cache SKU được làm nóng (sku:{code})
        │
        ▼
Khách luôn nhận HTML tĩnh/cache-edge; SKU lookup chạm Redis đã ấm
→ Nội dung luôn mới mà KHÔNG cần redeploy
```

## 6. Đơn vị triển khai (2 đơn vị độc lập)
- **Frontend → Vercel**: triển khai độc lập; preview theo PR; revalidate ISR.
- **Backend stack → `docker-compose.yml` trên VPS**: Directus + PostgreSQL + Redis sau Caddy/Nginx với HTTPS Let's Encrypt.

## 7. Vấn đề xuyên suốt (cross-cutting concerns)

| Vấn đề | Cơ chế |
|---|---|
| Đa ngôn ngữ | next-intl message catalog + Directus Translations; locale trong URL; hreflang |
| SEO | Metadata CMS điều khiển + JSON-LD + sitemap/robots sinh tự động |
| Bảo mật | RBAC Directus + theo dòng; HTTPS; chống spam; secrets qua env |
| Hiệu năng | SSG/ISR, cache SKU Redis, ngân sách ảnh/JS, Lighthouse CI |
| Quan trắc | Nhật ký hoạt động Directus; đo thời gian đường SKU; metrics/uptime host |
| Cấu hình | Biến môi trường có kiểu, được kiểm tra; một nguồn sự thật; `.env.example` |

## 8. Quyết định Kiến trúc (ADR) — 8 quyết định bất biến

> Thay đổi phá vỡ sẽ **thay thế** ADR thay vì sửa trực tiếp.

| ADR | Quyết định | Hệ quả chính |
|---|---|---|
| **0001** | CMS headless (Directus) thay vì backend tự xây | Loại ~70% công sức backend; 4 phân hệ CMS là tính năng sẵn có |
| **0002** | Trọn phạm vi hợp đồng trong 8 tuần | Có tuần riêng cho i18n/hiệu năng/QA + tuần UAT; 2 luồng song song |
| **0003** | Dữ liệu cổng do CMS quản lý; hoãn đồng bộ ERP | Bàn giao đầy đủ, demo được; ERP interface đặt sẵn |
| **0004** | Next.js App Router + next-intl | Render sẵn theo locale, hreflang, revalidate khi publish |
| **0005** | Tra cứu SKU cache Redis | Cache hit vài ms; cần làm nóng/vô hiệu cache khi publish |
| **0006** | Hosting Vercel + VPS Docker Compose | ~$10–25/tháng; container hóa, tái triển khai rẻ |
| **0007** | Directus-only; hoãn NestJS | Một backend hiện tại; NestJS cho giai đoạn Tích hợp |
| **0008** | Thương mại RFQ (không checkout) | Không phạm vi PCI/thanh toán; công nợ theo dõi riêng |

## 9. Khả năng mở rộng và tiến hóa
- Frontend phi trạng thái, mở rộng ngang trên Vercel.
- Backend mở rộng dọc trước; lộ trình: PostgreSQL managed + nhiều bản sao Directus sau Redis.
- Cache có chủ đích, vô hiệu hóa tường minh (đường SKU Redis); không trạng thái ẩn theo instance.
- Giai đoạn Tích hợp: NestJS BFF tiêu thụ ERP interface mà không đổi schema lõi.
- Tăng trưởng cộng thêm: phân hệ/collection mới = thêm tệp, không sửa mã không liên quan; schema đổi có migration.

## 10. Rủi ro kiến trúc & giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| VPS đơn = điểm hỏng đơn | Tự động sao lưu PostgreSQL + restart policy; lộ trình Postgres managed |
| Phụ thuộc quy ước Directus | Tầng truy cập dữ liệu mỏng (`@/lib/*`) + ERP interface cô lập backend |
| Cache lệch trên đường SKU | Làm nóng/vô hiệu khi publish qua Directus Flow webhook |
| Kỳ vọng đồng bộ ERP thời gian thực trong 8 tuần | Chốt ADR-0003 tại kickoff; đồng bộ thực là phụ lục Tích hợp riêng |

## Nguyên tắc kiến trúc khi code
1. Frontend KHÔNG gọi Directus trực tiếp từ component → qua `@/lib/directus` (tầng cô lập backend).
2. Chỉ 2 route handler tùy biến — không thêm endpoint backend khác (ADR-0007).
3. Mọi thay đổi schema phá vỡ cần migration + ADR mới.
4. Cache SKU phải có cơ chế làm nóng/vô hiệu khi publish — không để cache lệch.
5. Cấu hình qua env có kiểu; ghi mọi biến mới vào `.env.example`.
