# Skill 08 — Cấu trúc Thư mục & Tổ chức Mã nguồn | Nguồn: tổng hợp AD-03/05/06 + quy ước ENG

> Skill này định nghĩa cấu trúc thư mục chuẩn cho từng repo trong hệ thống ULink, nhất quán với kiến trúc Directus-only (AD-03) và tầng truy cập dữ liệu `@/lib/directus` (AD-05 §3, skill 00). Mục tiêu: mã **đầy đủ · sạch · kế thừa được · mở rộng được**, tăng trưởng **cộng thêm** (thêm file thay vì sửa mã không liên quan).

## 1. Bản đồ repo (xem chi tiết quan hệ ở skill 09)

| Repo | Vai trò | Triển khai |
|---|---|---|
| `ulink-web` | Frontend Next.js 14 + 2 route handler | Vercel |
| `ulink-backend` | Directus 11 + PostgreSQL 16 + Redis 7 | VPS Docker Compose |
| `ulink-contracts` | Gói dùng chung: types, schema zod, OpenAPI, CSV schema ERP | npm registry (private) |
| `ulink-erp-bff` *(tương lai)* | NestJS BFF đồng bộ ERP (ADR-0007) | Giai đoạn Tích hợp |

---

## 2. `ulink-web` — Frontend (Next.js 14 App Router)

```
ulink-web/
├── src/
│   ├── app/
│   │   ├── [locale]/                      # localePrefix: 'always' (vi|en|ja)
│   │   │   ├── layout.tsx                  # SiteHeader/Footer, i18n provider
│   │   │   ├── (marketing)/               # nhóm route → ISR
│   │   │   │   ├── page.tsx                # / Trang chủ (FR-01)
│   │   │   │   ├── regional-hubs/
│   │   │   │   │   ├── page.tsx            # danh sách hub (FR-02)
│   │   │   │   │   └── [slug]/page.tsx     # chi tiết hub
│   │   │   │   ├── solutions/
│   │   │   │   │   └── [category]/page.tsx # danh mục SP (FR-03)
│   │   │   │   ├── products/[slug]/page.tsx# chi tiết SP (FR-05)
│   │   │   │   ├── industries/[slug]/page.tsx # (FR-06)
│   │   │   │   ├── resources/              # (FR-07)
│   │   │   │   └── about/                  # (FR-20)
│   │   │   ├── quick-order/page.tsx        # client + API (FR-08/09)
│   │   │   └── portal/                     # SSR (auth) (FR-10..15)
│   │   │       ├── layout.tsx              # guard phiên
│   │   │       ├── page.tsx                # dashboard (FR-11)
│   │   │       ├── orders/                 # (FR-12)
│   │   │       ├── deliveries/             # (FR-13)
│   │   │       ├── invoices/               # (FR-14)
│   │   │       └── reorder/                # (FR-15)
│   │   ├── api/                            # CHỈ 2 route handler (ADR-0007)
│   │   │   ├── sku/[code]/route.ts         # GET tra cứu SKU <50ms (NFR-02)
│   │   │   └── rfq/route.ts                # POST gửi RFQ + chống spam
│   │   ├── sitemap.ts                      # sinh tự động mọi locale
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                             # primitive Shadcn (token-driven)
│   │   └── app/                            # SiteHeader, SiteFooter, LocaleSwitcher,
│   │                                       # ProductCard, HubCard, RfqCart, SkuSearch,
│   │                                       # DocDownload, PortalTable
│   ├── lib/
│   │   ├── directus/                       # TẦNG TRUY CẬP DỮ LIỆU (duy nhất gọi Directus)
│   │   │   ├── client.ts                   # khởi tạo Directus SDK
│   │   │   ├── products.ts                 # query SP/SKU
│   │   │   ├── content.ts                  # query blog/hub/pages
│   │   │   ├── portal.ts                   # query orders/invoices/deliveries
│   │   │   ├── auth.ts                     # login/refresh/logout
│   │   │   └── types.ts                    # re-export từ @ulink/contracts
│   │   ├── redis.ts                        # client Redis (cache SKU, rate-limit)
│   │   ├── seo.ts                          # metadata + JSON-LD builder
│   │   ├── turnstile.ts                    # verify Cloudflare Turnstile
│   │   └── validation/                     # zod schema (re-export từ contracts)
│   ├── i18n/
│   │   ├── routing.ts                      # next-intl config
│   │   └── request.ts
│   ├── messages/                           # catalog next-intl
│   │   ├── vi.json
│   │   ├── en.json
│   │   └── ja.json
│   └── styles/
│       └── globals.css                     # DESIGN TOKEN (HSL) — nơi DUY NHẤT đổi token
├── public/
├── .env.example                            # mọi biến env có tài liệu
├── next.config.mjs
├── tailwind.config.ts                      # tiêu thụ token, darkMode: 'class'
├── tsconfig.json                           # paths: @/* , @ulink/contracts
├── package.json
└── .github/workflows/                      # CI (xem skill 09)
```

### Quy tắc thư mục frontend
- **Component KHÔNG import Directus SDK trực tiếp** → luôn qua `@/lib/directus` (AD-05 §3).
- **Chỉ 2 file trong `app/api/`** — không thêm route handler khác (ADR-0007).
- **Token chỉ ở `globals.css`**; component dùng `bg-primary`, không hard-code hex (skill 06 §9).
- **Chuỗi hiển thị ở `messages/*.json`**, không hard-code (skill 06 §7).
- Render đúng nhóm: `(marketing)` = ISR, `portal/` = SSR auth, `quick-order` = client + API (skill 06 §6.1).
- Server-only code (token, redis) KHÔNG để lọt vào client bundle (skill 07 §7).

---

## 3. `ulink-backend` — Directus stack

```
ulink-backend/
├── docker-compose.yml                  # directus + postgres + redis + caddy
├── Caddyfile                           # HTTPS Let's Encrypt, reverse proxy
├── .env.example
├── directus/
│   ├── SCHEMA.md                       # NGUỒN SỰ THẬT tên/kiểu cột (AD-04 §1)
│   ├── snapshots/
│   │   └── schema.yaml                 # directus schema snapshot (versioned)
│   ├── migrations/                     # thay đổi cộng thêm, có theo dõi (AD-04 §10)
│   ├── extensions/                     # hooks/endpoints/flows tùy biến (tối thiểu)
│   ├── flows/
│   │   ├── revalidate-isr.json         # Flow 1: webhook → Next.js revalidateTag
│   │   ├── warm-sku-cache.json         # Flow 2: ghi Redis sku:{code}
│   │   └── notify-rfq.json             # Flow 3: thông báo Sales
│   └── seed/
│       ├── content/                    # SP, hub, danh mục mẫu
│       └── portal/                     # orders/invoices/deliveries demo
├── erp/                                # ĐẶT SẴN (Tuần 6) — stub, không xây (ADR-0003)
│   ├── README.md
│   └── csv-schemas/                    # schema CSV cho orders|invoices|deliveries
└── .github/workflows/
```

### Quy tắc thư mục backend
- **`SCHEMA.md` là nguồn sự thật** cho tên/kiểu cột; tài liệu AD-04 là chuẩn cho quan hệ/ý đồ (AD-04 §1).
- Thay đổi schema **cộng thêm** + có migration; đổi tên/xóa phá vỡ cần migration **+ một ADR**.
- Schema snapshot được commit để CI sinh types cho `ulink-contracts` (skill 09 §4).
- Secrets chỉ trong `.env`; `.env*` git-ignore (skill 07 §7).

---

## 4. `ulink-contracts` — Gói hợp đồng dùng chung (khóa của multi-repo)

```
ulink-contracts/
├── src/
│   ├── types/
│   │   ├── collections.ts              # type cho mọi Directus collection (sinh từ snapshot)
│   │   └── enums.ts                     # status, paid_status, delivery status...
│   ├── schemas/                         # zod schema dùng chung FE + BFF
│   │   ├── rfq.ts                        # RfqSchema (POST /api/rfq)
│   │   └── erp-import.ts                # schema import ERP (tương lai)
│   ├── api/
│   │   └── openapi.yaml                 # đặc tả /api/sku, /api/rfq, /erp/import/*
│   ├── errors.ts                        # mã lỗi đồng nhất (AD-05 §4)
│   └── index.ts
├── package.json                         # name: @ulink/contracts, có version semver
└── tsup.config.ts                       # build ESM+CJS+d.ts
```

> `ulink-contracts` là **một nguồn sự thật** cho types/schemas/mã lỗi mà mọi repo khác tiêu thụ. Đây là cơ chế chính để các repo "pass qua nhau" an toàn (chi tiết ở skill 09).

---

## 5. `ulink-erp-bff` *(tương lai — NestJS, giai đoạn Tích hợp)*

```
ulink-erp-bff/
├── src/
│   ├── main.ts
│   ├── modules/
│   │   ├── orders/                     # import/đồng bộ orders theo erp_ref
│   │   ├── invoices/
│   │   └── deliveries/
│   ├── directus/                       # client gọi Directus (idempotent upsert)
│   └── contracts/                      # dùng @ulink/contracts
├── Dockerfile
└── .github/workflows/
```
> KHÔNG xây trong 8 tuần (ADR-0007). Repo đặt sẵn để tiêu thụ ERP interface (`POST /erp/import/{orders|invoices|deliveries}`, webhook, idempotency theo `erp_ref` — AD-04 §9, AD-05 §6).

## 6. Quy ước đặt tên & ranh giới chung
- **Tăng trưởng cộng thêm**: tính năng mới = thêm file/module, không sửa mã không liên quan (AD-03 §9).
- **Ranh giới có kiểu**: mọi giao tiếp liên-repo đi qua `@ulink/contracts`.
- **Cấu hình qua env có kiểu**, kiểm tra lúc khởi động; ghi mọi biến vào `.env.example`.
- **Một nguồn sự thật** cho mỗi thứ: schema cột → `SCHEMA.md`; types/contract → `ulink-contracts`; token UI → `globals.css`; chuỗi UI → `messages/*`.

## Checklist khi thêm code mới
- [ ] Đặt file đúng repo và đúng tầng (component vs `lib/directus` vs contracts)?
- [ ] Nếu là query Directus → nằm trong `@/lib/directus`, không ở component?
- [ ] Type/schema dùng chung → đặt trong `@ulink/contracts`, không copy-paste?
- [ ] Thay đổi schema backend → cập nhật `SCHEMA.md` + migration (+ ADR nếu phá vỡ)?
- [ ] Biến env mới → đã thêm vào `.env.example`?
- [ ] Không phá quy tắc "chỉ 2 route handler" (ADR-0007)?
