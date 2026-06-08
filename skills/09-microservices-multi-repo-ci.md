# Skill 09 — Microservice, Multi-Repo & CI/CD | Nguồn: tổng hợp AD-03/04/05/07 + ENG

> Hệ thống ULink được tổ chức thành **nhiều repo/service độc lập** tương tác qua **hợp đồng (contracts)** và **pipeline CI** truyền tạo phẩm (artifact) qua nhau. Skill này định nghĩa ranh giới service, cách các repo phụ thuộc và "pass qua nhau" trên CI, và các cổng chất lượng (quality gates).

> **Lưu ý kiến trúc**: Baseline tài liệu là Directus-only với 2 đơn vị triển khai (AD-03 §5.2) và hoãn NestJS (ADR-0007). Cách tiếp cận multi-repo dưới đây coi mỗi đơn vị triển khai/đóng gói là một "service" độc lập; nó **mở rộng** baseline mà không phá vỡ ADR — NestJS BFF vẫn chỉ kích hoạt ở giai đoạn Tích hợp.

## 1. Bản đồ service và ranh giới

| Service / Repo | Loại | Giao tiếp ra ngoài | Phụ thuộc vào |
|---|---|---|---|
| `ulink-web` | Frontend + edge API | REST/GraphQL → Directus; HTTP → client | `@ulink/contracts` |
| `ulink-backend` | Directus + DB + cache | REST/GraphQL, webhook (Flows) | — (nguồn schema) |
| `ulink-contracts` | Thư viện hợp đồng | npm package | sinh từ schema backend |
| `ulink-erp-bff` *(tương lai)* | NestJS BFF | `/erp/import/*`, webhook | `@ulink/contracts`, Directus |

### Nguyên tắc ranh giới
- **Mỗi service triển khai độc lập** (AD-03 §5.2): frontend lên Vercel, backend lên VPS — không deploy chung.
- **Giao tiếp chỉ qua hợp đồng ổn định**: Directus REST/GraphQL + 2 route handler + ERP interface. KHÔNG service nào chạm DB của service khác trực tiếp.
- **`@ulink/contracts` là biên giới có kiểu** giữa các repo (types, zod, OpenAPI, mã lỗi).
- **Thay đổi cộng thêm**; thay đổi phá vỡ → đánh version + ADR + thông báo downstream (AD-05 §7).

## 2. Sơ đồ phụ thuộc và luồng artifact

```
                     ┌──────────────────┐
                     │  ulink-backend   │  (Directus schema = nguồn)
                     │  directus/SCHEMA │
                     └────────┬─────────┘
              CI: snapshot →  │ sinh types
                              ▼
                     ┌──────────────────┐
                     │ ulink-contracts  │  publish @ulink/contracts@x.y.z
                     │ types/zod/openapi│  → npm registry (private)
                     └───┬──────────┬───┘
            consume      │          │     consume
                         ▼          ▼
              ┌──────────────┐  ┌──────────────────┐
              │  ulink-web   │  │ ulink-erp-bff     │ (tương lai)
              │  (Vercel)    │  │  (NestJS)         │
              └──────────────┘  └──────────────────┘
```

- **Hướng phụ thuộc một chiều**: backend → contracts → (web, bff). Tránh phụ thuộc vòng.
- Artifact truyền qua nhau: **schema snapshot** → **gói npm contracts** → **build frontend/bff** → **docker image / Vercel deploy**.

## 3. Chiến lược versioning hợp đồng (semver)
- `@ulink/contracts` dùng **semver**: `MAJOR` (phá vỡ) · `MINOR` (cộng thêm) · `PATCH` (sửa lỗi).
- Downstream pin theo range an toàn (vd `^1.4.0`); thay đổi MAJOR yêu cầu PR cập nhật có chủ đích + ADR.
- Mỗi release contracts kèm **CHANGELOG** ghi rõ collection/field/endpoint thay đổi.

## 4. Cách các repo "pass qua nhau" trên CI

Có 3 cơ chế truyền giữa repo (dùng kết hợp):

### (a) Gói npm dùng chung (chính)
1. `ulink-backend` đổi schema → commit `directus/snapshots/schema.yaml` + cập nhật `SCHEMA.md`.
2. CI backend chạy job `gen-contracts`: sinh `types/collections.ts` từ snapshot.
3. Mở PR/commit sang `ulink-contracts`, bump version, **publish lên registry**.
4. CI của `ulink-web` / `ulink-erp-bff` cài bản contracts mới → typecheck → nếu types đổi gây lỗi build, **CI chặn** (bắt lỗi sớm).

### (b) Cross-repo trigger (đồng bộ pipeline)
- Sau khi publish contracts, dùng `repository_dispatch` / `workflow_dispatch` (GitHub) hoặc downstream/trigger (GitLab) để **kích hoạt CI của repo tiêu thụ** chạy lại typecheck + build với contract mới.
- Kết quả truyền ngược: nếu downstream fail → đánh dấu contract release là "breaking", chặn merge.

### (c) Contract testing (provider/consumer)
- **Consumer** (`ulink-web`) định nghĩa kỳ vọng với `/api/sku`, `/api/rfq`, Directus đọc.
- **Provider** (`ulink-backend`) chạy test xác minh đáp ứng kỳ vọng (theo OpenAPI trong contracts).
- Mục tiêu: thay đổi backend không lặng lẽ làm hỏng frontend (giảm rủi ro "phụ thuộc quy ước Directus" — AD-03 §11).

## 5. Pipeline CI cho từng repo

### `ulink-web`
```
lint → typecheck → unit test → build (next build)
     → Lighthouse CI (NFR-01: PageSpeed ≥ 90, CWV tốt)
     → i18n key-check (thiếu khóa UI → FAIL, không render thô — skill 06 §7)
     → secret scan (không lộ DIRECTUS_TOKEN trong bundle — skill 07 §11)
     → preview deploy (Vercel theo PR) → revalidate ISR
```

### `ulink-backend`
```
lint (extensions/flows) → validate schema snapshot
     → migration check (cộng thêm, không phá vỡ ngoài ý muốn)
     → gen-contracts (sinh types từ snapshot)
     → k6 SKU benchmark (NFR-02: /api/sku <50ms cache hit)
     → build & push docker image → deploy VPS (Caddy/Compose)
```

### `ulink-contracts`
```
lint → build (tsup: ESM+CJS+d.ts) → semver check (so type cũ → phát hiện breaking)
     → publish npm (private registry) → tag CHANGELOG
     → dispatch CI downstream (ulink-web, ulink-erp-bff)
```

### `ulink-erp-bff` *(tương lai)*
```
lint → typecheck → test (idempotent upsert theo erp_ref) → contract test (provider /erp/import/*)
     → build docker image → deploy
```

## 6. Cổng chất lượng dùng chung (quality gates — bắt buộc qua mới merge)

| Cổng | Yêu cầu nguồn | Áp dụng repo |
|---|---|---|
| Lint / Format / Typecheck | NFR-11 | mọi repo |
| Unit / integration test | NFR-10 (zero-critical RFQ/Đơn) | web, bff |
| Lighthouse CI ≥ 90 / CWV tốt | NFR-01 | web |
| k6 SKU < 50ms (cache hit) | NFR-02 | backend |
| Diễn tập vai trò + chéo tài khoản | NFR-06, BR-10 | backend, web |
| Quét SSL/HSTS/header | NFR-05 | hạ tầng |
| Kiểm thử flood chống spam | NFR-07, BR-08 | web |
| Secret scan (no secret in bundle/log/VCS) | AD-07 §11 | mọi repo |
| Semver/contract breaking check | AD-05 §7 | contracts |

> **Định nghĩa Hoàn thành = operator-green** (AD-01 §6): CI-green và staging-green CHƯA đủ — phải có người mở URL production xác nhận + ký UAT.

## 7. Quản lý môi trường & secrets liên repo
- Mỗi repo có `.env.example` riêng; secrets nằm ở **CI secrets store** (GitHub/GitLab) + Vercel/host secrets, KHÔNG vào VCS (skill 07 §7).
- `DIRECTUS_TOKEN` chỉ ở CI/runtime của `ulink-web` (server) và `ulink-erp-bff`; KHÔNG bao giờ trong bundle client.
- Registry npm private cần token đọc; CI inject lúc `install`.
- Xoay vòng khóa khi bàn giao và khi nghi rò rỉ (skill 07 §7).

## 8. Quy trình thay đổi xuyên repo (ví dụ thêm field vào `products`)
1. `ulink-backend`: thêm field (cộng thêm) → migration → cập nhật `SCHEMA.md` + snapshot → CI sinh contracts.
2. `ulink-contracts`: bump MINOR → publish `@ulink/contracts@1.x+1.0` → CHANGELOG.
3. `ulink-web`: cập nhật dependency → dùng field mới trong `@/lib/directus` → CI typecheck/build/Lighthouse.
4. Mỗi bước qua cổng chất lượng tương ứng; merge khi tất cả xanh.
5. Publish nội dung trên Directus → Flow webhook → revalidate ISR (không redeploy — AD-03 §5.3).

## 9. Anti-pattern cần tránh
- ❌ Frontend gọi Directus SDK trực tiếp từ component (bỏ qua `@/lib/directus`).
- ❌ Copy-paste type/zod giữa các repo thay vì dùng `@ulink/contracts`.
- ❌ Một service đọc DB của service khác trực tiếp (phá ranh giới).
- ❌ Thêm backend service thứ ba trong 8 tuần (vi phạm ADR-0007 — NestJS chỉ ở giai đoạn Tích hợp).
- ❌ Thay đổi phá vỡ contract mà không bump MAJOR + ADR + thông báo downstream.
- ❌ Deploy chung frontend và backend như một đơn vị (phá AD-03 §5.2).

## Checklist khi làm việc multi-repo / CI
- [ ] Thay đổi liên-repo đi qua `@ulink/contracts` (không copy type)?
- [ ] Đã bump semver đúng (MAJOR cho phá vỡ) + CHANGELOG?
- [ ] CI downstream được kích hoạt và xanh sau khi publish contracts?
- [ ] Mọi quality gate liên quan (NFR-01/02/06/07/10/11) đã cấu hình?
- [ ] Secrets ở CI store/host, KHÔNG trong VCS hay bundle client?
- [ ] Không thêm service backend ngoài phạm vi (tôn trọng ADR-0007)?
- [ ] Đạt operator-green trước khi coi là Done?
