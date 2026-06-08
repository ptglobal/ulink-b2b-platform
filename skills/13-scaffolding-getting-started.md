# Skill 13 — Scaffolding & Getting Started (Khung khởi tạo) | Nguồn: tổng hợp skill 00/03/05/06/08

> Skill "capstone": tập hợp các tạo phẩm khởi tạo **copy-paste được** cho từng repo, theo đúng kiến trúc đã chốt. Mục tiêu: từ zero → môi trường dev chạy được, để bắt đầu code FR ngay. Mọi giá trị bám sát skill 00 (env), 06 (token), 05 (route handler), 08 (cấu trúc).

## 0. Thứ tự bootstrap
```
1. ulink-backend   → docker compose up → Directus chạy ở :8055 → tạo collections (skill 04)
2. ulink-contracts → publish @ulink/contracts (types từ schema)
3. ulink-web       → next dev → kết nối Directus → code FR
```

---

## 1. `ulink-backend` — Directus stack

### 1.1. `docker-compose.yml`
```yaml
services:
  directus:
    image: directus/directus:11
    ports:
      - "8055:8055"
    depends_on:
      - postgres
      - redis
    environment:
      KEY: ${KEY}
      SECRET: ${SECRET}
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: ${DB_DATABASE}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      CACHE_ENABLED: "true"
      CACHE_STORE: redis
      REDIS: redis://redis:6379
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      ACCESS_TOKEN_TTL: 15m
      REFRESH_TOKEN_TTL: 7d
      CORS_ENABLED: "true"
      CORS_ORIGIN: ${CORS_ORIGIN}
      PUBLIC_URL: ${PUBLIC_URL}
      STORAGE_LOCATIONS: local
      STORAGE_LOCAL_ROOT: /directus/uploads
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
      - ./snapshots:/directus/snapshots

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - directus
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddydata:/data
      - caddyconfig:/config

volumes:
  pgdata:
  redisdata:
  caddydata:
  caddyconfig:
```

### 1.2. `Caddyfile` (HTTPS tự động trên VPS)
```
{$PUBLIC_DOMAIN} {
    reverse_proxy directus:8055
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        X-Frame-Options "DENY"
    }
}
```
> Header bám AD-07 §5 (HSTS, X-Content-Type-Options, Referrer-Policy, chống nhúng frame). CSP cấu hình thêm cho phép self + origin CDN/media.

### 1.3. `.env.example` (backend)
```env
# Directus security
KEY=replace-with-random-uuid
SECRET=replace-with-random-secret
ADMIN_EMAIL=admin@ulink.vn
ADMIN_PASSWORD=replace-strong-password

# Database
DB_DATABASE=ulink
DB_USER=directus
DB_PASSWORD=replace-db-password

# URLs / CORS
PUBLIC_URL=http://localhost:8055
PUBLIC_DOMAIN=cms.ulink.vn
CORS_ORIGIN=http://localhost:3000

# (prod) Let's Encrypt qua Caddy tự động theo PUBLIC_DOMAIN
```
> `.env` thật phải git-ignore (AD-07 §7). Sinh `KEY`/`SECRET`: `openssl rand -base64 32`.

### 1.4. Lệnh khởi tạo
```bash
docker compose up -d
# Mở http://localhost:8055 → đăng nhập ADMIN_EMAIL/PASSWORD
# Tạo collections theo skill 04; hoặc apply snapshot:
# npx directus schema apply ./snapshots/schema.yaml
```

---

## 2. `ulink-web` — Next.js 14 frontend

### 2.1. `.env.example` (web)
```env
# Server-only (KHÔNG NEXT_PUBLIC_)
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=replace-static-server-token        # chỉ phía server (AD-07)
REDIS_URL=redis://localhost:6379
TURNSTILE_SECRET_KEY=replace-turnstile-secret

# Client-safe (lộ ra browser)
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055     # cho asset/ảnh public
NEXT_PUBLIC_TURNSTILE_SITE_KEY=replace-turnstile-site-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2.2. `package.json` (deps cốt lõi)
```json
{
  "name": "ulink-web",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@directus/sdk": "^17.0.0",
    "next-intl": "^3.0.0",
    "ioredis": "^5.4.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0"
  }
}
```
> Shadcn/UI cài qua `npx shadcn@latest init` rồi `add` từng primitive (skill 06 §3).

### 2.3. `tailwind.config.ts` (tiêu thụ token)
```ts
import type { Config } from "tailwindcss";
export default {
  darkMode: "class",                       // giữ chỗ, ngoài phạm vi go-live
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
    },
  },
} satisfies Config;
```

### 2.4. `src/styles/globals.css` (DESIGN TOKEN — nơi DUY NHẤT đổi token)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 40 30% 98%;
    --foreground: 220 18% 12%;
    --primary: 222 38% 22%;
    --primary-foreground: 0 0% 100%;
    --accent: 8 72% 52%;
    --accent-foreground: 0 0% 100%;
    --muted: 40 16% 94%;
    --muted-foreground: 220 10% 40%;
    --card: 0 0% 100%;
    --card-foreground: 220 18% 12%;
    --border: 220 14% 88%;
    --input: 220 14% 88%;
    --ring: 222 38% 22%;
    --radius: 0.25rem;
  }
}
```
> Giá trị HSL khớp skill 06 §3.1. Component KHÔNG hard-code hex — chỉ dùng `bg-primary`, `text-muted-foreground`...

### 2.5. i18n — `src/i18n/routing.ts`
```ts
import { defineRouting } from "next-intl/routing";
export const routing = defineRouting({
  locales: ["vi", "en", "ja"],
  defaultLocale: "vi",
  localePrefix: "always",
});
```

### 2.6. Tầng truy cập dữ liệu — `src/lib/directus/client.ts`
```ts
import { createDirectus, rest, staticToken } from "@directus/sdk";
import type { Schema } from "@ulink/contracts";

// Client phía SERVER (có token — KHÔNG import vào client component)
export const directusServer = createDirectus<Schema>(process.env.DIRECTUS_URL!)
  .with(staticToken(process.env.DIRECTUS_TOKEN!))
  .with(rest());

// Client công khai (chỉ đọc nội dung đã publish, không token)
export const directusPublic = createDirectus<Schema>(process.env.DIRECTUS_URL!).with(rest());
```

### 2.7. `src/lib/directus/products.ts` (ví dụ query — luôn limit + published)
```ts
import { readItems } from "@directus/sdk";
import { directusPublic } from "./client";

export async function getPublishedProducts(locale: string, categoryId?: number) {
  return directusPublic.request(
    readItems("products", {
      filter: { status: { _eq: "published" }, ...(categoryId ? { category: { _eq: categoryId } } : {}) },
      fields: ["id", "slug", "hero", "short_description", { translations: ["*"] }],
      deep: { translations: { _filter: { languages_code: { _eq: locale } } } },
      sort: ["name"],
      limit: 24,                          // BẮT BUỘC có limit (AD-05 §2)
    })
  );
}
```

### 2.8. Route handler 1 — `src/app/api/sku/[code]/route.ts`
```ts
import { NextResponse } from "next/server";
import Redis from "ioredis";
import { readItems } from "@directus/sdk";
import { directusServer } from "@/lib/directus/client";

const redis = new Redis(process.env.REDIS_URL!);

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const code = params.code.toLowerCase();
  const key = `sku:${code}`;

  const cached = await redis.get(key);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), { headers: { "x-cache": "HIT" } });
  }

  const rows = await directusServer.request(
    readItems("product_skus", {
      filter: { sku_code: { _eq: code }, status: { _eq: "published" } },
      fields: ["id", "sku_code", "product", "unit", "pack_size", "status"],
      limit: 1,
    })
  );
  const sku = rows[0];
  if (!sku) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await redis.set(key, JSON.stringify(sku), "EX", 3600);   // TTL 1h (AD-04 §8)
  return NextResponse.json(sku, { headers: { "x-cache": "MISS" } });
}
```

### 2.9. Route handler 2 — `src/app/api/rfq/route.ts`
```ts
import { NextResponse } from "next/server";
import Redis from "ioredis";
import { createItem } from "@directus/sdk";
import { directusServer } from "@/lib/directus/client";
import { RfqSchema } from "@ulink/contracts/schemas/rfq";

const redis = new Redis(process.env.REDIS_URL!);
const WINDOW = 60, MAX = 5;     // 5 lần / 60s / IP (cửa sổ trượt đơn giản)

async function overLimit(ip: string) {
  const k = `rl:rfq:${ip}`;
  const n = await redis.incr(k);
  if (n === 1) await redis.expire(k, WINDOW);
  return n > MAX;
}

async function verifyTurnstile(token: string, ip: string) {
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token, remoteip: ip }),
  });
  return (await r.json()).success === true;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (await overLimit(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  const parsed = RfqSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "missing_fields" }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ error: "missing_fields" }, { status: 422 }); // honeypot
  if (!(await verifyTurnstile(parsed.data.token, ip))) return NextResponse.json({ error: "missing_fields" }, { status: 422 });

  try {
    const { website, token, ...data } = parsed.data;
    const created = await directusServer.request(
      createItem("rfq_requests", { ...data, status: "new", source: "web" })
    );
    return NextResponse.json({ ok: true, id: (created as any).id });
  } catch {
    return NextResponse.json({ error: "submit_failed" }, { status: 502 });
  }
}
```
> Mã lỗi/HTTP khớp đúng bảng AD-05 §4. Chống spam = honeypot + Turnstile + rate-limit (BR-08, AD-07 §6).

---

## 3. `ulink-contracts` — gói hợp đồng

### 3.1. `src/schemas/rfq.ts`
```ts
import { z } from "zod";
export const RfqSchema = z.object({
  company: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  industry: z.string().optional(),
  hub: z.string().optional(),
  items: z.array(z.object({ sku: z.string().min(1), qty: z.number().int().positive() })).min(1),
  message: z.string().optional(),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot: phải rỗng
  token: z.string().min(1),                                 // Turnstile
});
export type RfqInput = z.infer<typeof RfqSchema>;
```

### 3.2. `package.json`
```json
{
  "name": "@ulink/contracts",
  "version": "0.1.0",
  "type": "module",
  "exports": { ".": "./dist/index.js", "./schemas/rfq": "./dist/schemas/rfq.js" },
  "scripts": { "build": "tsup src/index.ts src/schemas/*.ts --format esm,cjs --dts" }
}
```

---

## 4. Sinh types từ schema Directus (cho contracts)
```bash
# Trong ulink-backend, xuất snapshot:
npx directus schema snapshot ./snapshots/schema.yaml --yes
# Dùng SDK typed hoặc công cụ sinh type → ulink-contracts/src/types/collections.ts
```
> Quy trình "pass qua nhau" chi tiết ở skill 09 §4. `SCHEMA.md` là nguồn sự thật tên/kiểu cột.

## 5. Smoke test sau scaffolding
- [ ] `docker compose up` → Directus :8055 mở được, login admin OK.
- [ ] Tạo 1 `product_skus` publish (vd `CR-GLV-001`) → `GET /api/sku/CR-GLV-001` trả 200, `x-cache: MISS` rồi `HIT`.
- [ ] `GET /api/sku/khong-ton-tai` → 404 `not_found`.
- [ ] `POST /api/rfq` thiếu field → 422 `missing_fields`; gửi >5 lần/60s → 429 `rate_limited`.
- [ ] `next dev` → `/vi`, `/en`, `/ja` render; chuyển ngôn ngữ giữ trang.
- [ ] `/sitemap.xml` loại trừ `/portal/*` và nội dung chưa publish.
- [ ] Không có `DIRECTUS_TOKEN` trong bundle client (secret scan).

## Checklist hoàn tất scaffolding
- [ ] 3 repo khởi tạo đúng cấu trúc (skill 08)?
- [ ] `.env.example` đầy đủ + `.env` thật git-ignore?
- [ ] Token chỉ phía server; client chỉ `NEXT_PUBLIC_*`?
- [ ] Token Tailwind khớp skill 06; không hard-code hex?
- [ ] 2 route handler trả đúng mã lỗi (AD-05 §4)?
- [ ] Cache SKU TTL 1h + làm nóng khi publish (Directus Flow)?
- [ ] Smoke test §5 xanh?
