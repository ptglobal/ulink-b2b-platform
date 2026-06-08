# Bộ Skills — ULink Industries B2B Platform

Bộ skills này được trích xuất và hệ thống hóa từ 7 tài liệu thiết kế chính thức (ULINK-AD-01 → 07). Mục tiêu: cung cấp cho model (và lập trình viên) một "bản đồ tri thức" đầy đủ, có thể tra cứu nhanh trong quá trình code, đảm bảo mọi dòng code đều truy vết ngược về yêu cầu gốc.

## Bối cảnh dự án (đọc trước khi code)

ULink Industries là **nền tảng thương mại B2B đa ngôn ngữ (VI/EN/JP)**, tối ưu SEO, có luồng **RFQ (Yêu cầu Báo giá — KHÔNG có checkout/thanh toán online)**, CMS đầy đủ và Cổng B2B có xác thực. Bàn giao trọn phạm vi trong **8 tuần** trên kiến trúc **Directus-only**.

Triết lý cốt lõi: **"xây một lần, tái triển khai nhiều lần với chi phí thấp"** (đồng sở hữu + royalty 10% + phí bảo trì theo site). Mọi lựa chọn kiến trúc đều nhằm hạ chi phí biên cho lần triển khai sau.

## Stack công nghệ (cố định — không thay đổi)

| Tầng | Công nghệ | ADR |
|---|---|---|
| Frontend | Next.js 14 (App Router) + next-intl | ADR-0004 |
| UI | Tailwind CSS + Shadcn/UI (token-driven) | — |
| Backend/Admin/API | Directus 11 trên PostgreSQL 16 | ADR-0001 |
| API tùy biến | 2 route handler Next.js (`/api/sku`, `/api/rfq`) | ADR-0007 |
| Cache | Redis 7 | ADR-0005 |
| Hạ tầng | Vercel (FE) + VPS Docker Compose (BE) | ADR-0006 |
| Chống spam | Cloudflare Turnstile | — |
| Mô hình thương mại | RFQ, không checkout | ADR-0008 |
| ERP | Hoãn (NestJS BFF tương lai), đặt sẵn interface | ADR-0003/0007 |

## Cấu trúc bộ skills

| File | Giai đoạn / Tài liệu nguồn | Nội dung |
|---|---|---|
| `00-directus-backend.md` | Xuyên suốt | Skill Directus: collections, RBAC, REST/GraphQL, Flows, Docker, env |
| `01-requirements-srs.md` | AD-01 — SRS | 20 FR + 12 NFR, vai trò, phạm vi, tiêu chí nghiệm thu, RTM |
| `02-functional-usecases.md` | AD-02 — Use Case | 5 tác nhân, 22 UC, 11 Business Rule, luồng chi tiết |
| `03-architecture-hld.md` | AD-03 — Kiến trúc | Kiến trúc logic, luồng dữ liệu, render policy, 8 ADR |
| `04-database-datamodel.md` | AD-04 — CSDL | Toàn bộ collection + từ điển dữ liệu trường-theo-trường, ERD, index |
| `05-api-design.md` | AD-05 — API | Directus REST/GraphQL, `/api/sku`, `/api/rfq`, error model, ERP stub |
| `06-ui-ux-design.md` | AD-06 — UI/UX | Design token, component, IA/routing, i18n, SEO/JSON-LD |
| `07-security-rbac.md` | AD-07 — Bảo mật | Auth, RBAC + row-level, headers, secrets, threat model, test |
| `08-project-structure.md` | Tổng hợp + ENG | Cấu trúc thư mục từng repo (web, backend, contracts, bff), quy ước đặt file |
| `09-microservices-multi-repo-ci.md` | Tổng hợp + ENG | Ranh giới service, phụ thuộc qua contracts, CI truyền artifact qua nhau, quality gates |
| `10-engineering-practices-quality.md` | AD-01/02/03 + ENG/PROC/TEST/REV | Quy ước lập trình, cổng chất lượng CI, chiến lược test, Definition of Done (operator-green) |
| `11-mcp-ai-workflow.md` | Directus AI docs | MCP là gì, bật Directus MCP (remote/local), cấu hình Kiro, bảo mật, use case |
| `12-seo-i18n-deep-dive.md` | AD-06 §7–9 + AD-03 | i18n hai tầng (next-intl + Directus Translations), hreflang, JSON-LD, sitemap/robots |
| `13-scaffolding-getting-started.md` | Tổng hợp 00/03/05/06/08 | Khung khởi tạo copy-paste được: docker-compose, env, Tailwind token, DAL, 2 route handler, smoke test |

## Quy ước truy vết (luôn ghi nhớ)

```
SRS (FR/NFR) → Use Case (UC/BR) → Thiết kế (AD-03..07) → Code → UAT
```
Mỗi tính năng phải truy vết ngược về một FR. Mỗi quy tắc nghiệp vụ (BR-xx) phải được hiện thực và kiểm chứng.

## 10 nguyên tắc bất di bất dịch khi code

1. **Directus là backend duy nhất** — KHÔNG xây backend riêng (ADR-0001/0007).
2. **Chỉ 2 route handler tùy biến**: `GET /api/sku/{code}` và `POST /api/rfq`.
3. **Token quản trị (`DIRECTUS_TOKEN`) KHÔNG BAO GIỜ lộ ra client** — chỉ dùng phía server.
4. **Chỉ nội dung `status = published` mới công khai** (BR-01).
5. **Mọi truy vấn danh sách phải có `limit`** — không truy vấn không chặn.
6. **Frontend KHÔNG gọi Directus trực tiếp từ component** — đi qua `@/lib/directus`.
7. **Không hard-code màu** — luôn dùng design token (Tailwind).
8. **Không hard-code chuỗi hiển thị** — dùng next-intl catalog + Directus Translations.
9. **Khách chỉ thấy dữ liệu của mình** — row-level filter `$CURRENT_USER` (BR-10).
10. **RFQ không phải checkout** — "Thêm vào giỏ" = thêm vào giỏ RFQ (BR-06).

## Cách dùng bộ skill này khi code

- Bắt đầu một tính năng → đọc `01` (FR liên quan) + `02` (UC/BR liên quan).
- Cần biết schema/trường → `04`.
- Gọi API → `05` + `00`.
- Dựng giao diện → `06`.
- Vấn đề phân quyền/bảo mật → `07` + `00`.
- Bất kỳ thao tác Directus nào → `00`.
- Tạo file mới / biết đặt code ở đâu → `08`.
- Thiết lập repo, phụ thuộc liên repo, CI/CD → `09`.
- Chuẩn code, cổng chất lượng, test, "định nghĩa xong" → `10`.
- Dùng MCP / AI hỗ trợ với Directus → `11`.
- Hiện thực i18n VI/EN/JP, hreflang, JSON-LD, sitemap → `12`.
- Khởi tạo dự án từ zero, docker-compose, route handler mẫu → `13`.

## Cấu hình MCP

Đã có sẵn cấu hình Directus MCP tại `.kiro/settings/mcp.json` (xem skill `11`). Trước khi dùng, thay `DIRECTUS_TOKEN` bằng **static token đặc quyền tối thiểu** (KHÔNG dùng token admin) và chỉnh `DIRECTUS_URL` cho đúng môi trường.
