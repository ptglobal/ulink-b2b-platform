# Skill 05 — Đặc tả Thiết kế API | Nguồn: ULINK-AD-05

> Hệ thống có **2 bề mặt API**: (1) API Directus (REST + GraphQL sinh tự động + auth/RBAC/i18n) và (2) **2 route handler Next.js tùy biến** cho hai đường nhạy về độ trễ và lạm dụng. KHÔNG thêm endpoint backend nào khác (ADR-0007).

## 1. Quy ước chung

| Khía cạnh | Quy ước |
|---|---|
| Truyền tải | Chỉ HTTPS; thân yêu cầu/phản hồi JSON |
| Base Directus | `${DIRECTUS_URL}` (vd `http://localhost:8055` ở dev) |
| Xác thực | JWT khách (đăng nhập) HOẶC `DIRECTUS_TOKEN` tĩnh phía máy chủ; role public cho nội dung đã publish |
| Đọc công khai | Chỉ đọc đã publish: `filter[status][_eq]=published` |
| Phân trang | Mọi danh sách dùng `limit` (và `page`/`offset`); KHÔNG truy vấn không chặn |
| i18n | Yêu cầu bản dịch qua `deep` / `translations` theo locale hiện hành |
| Lỗi | JSON `{ "error": "<code>" }`; mã HTTP đúng; KHÔNG lộ stack trace |

## 2. API Directus

> Tầng truy cập dữ liệu frontend (`@/lib/directus`) là **nơi duy nhất** giao tiếp với Directus. React component KHÔNG gọi trực tiếp.

### 2.1. REST
- `/items/{collection}` với `filter`, `fields`, `sort`, `limit`, `deep`.
- `/auth/login`, `/auth/refresh`, `/auth/logout` cho phiên khách.
- `/files` cho media (TDS/MSDS, ảnh).

**Ví dụ — sản phẩm đã publish trong một danh mục, chỉ lấy vài trường:**
```http
GET /items/products
  ?filter[status][_eq]=published
  &filter[category][_eq]=12
  &fields=id,name,slug,hero,short_description
  &sort=name&limit=24&page=1
```

**Ví dụ — đọc kèm bản dịch (i18n):**
```http
GET /items/products/7
  ?fields=*,translations.*
  &deep[translations][_filter][languages_code][_eq]=vi
```

### 2.2. GraphQL
- `/graphql` cho đọc nội dung; `/graphql/system` cho collection hệ thống.
- Dùng khi cần một round-trip lấy quan hệ lồng nhau (vd `product` + `skus` + `documents`).

## 3. Endpoint tùy biến (route handler Next.js)

### 3.1. `GET /api/sku/{code}` — tra cứu SKU có cache
- **Mục đích**: phân giải SKU **< 50 ms** cho Quick Order và tìm SKU (NFR-02).
- **Cache**: khóa Redis `sku:{code-viết-thường}`, TTL 1 giờ, làm nóng khi publish qua Directus Flow webhook.
- **Cache miss**: handler đọc Directus **một lần** và nạp cache.

| Phản hồi | Ý nghĩa |
|---|---|
| `200` | JSON của SKU; header `x-cache: HIT\|MISS` |
| `404` | `{ "error": "not_found" }` — mã không tồn tại |
| `429` | `{ "error": "rate_limited" }` — bảo vệ lạm dụng (tùy chọn cho đọc) |

```http
GET /api/sku/CR-GLV-001
200 OK   x-cache: HIT
{
  "id": 42, "sku_code": "CR-GLV-001", "product": 7,
  "unit": "box", "pack_size": "100", "status": "published"
}
```

> **Phạm vi NFR-02**: Cam kết <50 ms **chỉ** áp dụng cho lần đọc một SKU đã cache. Tải trang đầy đủ và gửi RFQ (mạng + ghi CSDL + chống spam) nằm NGOÀI ngân sách này.

### 3.2. `POST /api/rfq` — gửi RFQ
- **Mục đích**: kiểm tra, lưu và định tuyến RFQ tới Sales.
- **Chống spam**: trường honeypot `website`, token Cloudflare Turnstile, rate-limit theo IP bằng Redis.
- **Kiểm tra phía máy chủ dùng `zod`** trước mọi thao tác ghi.

**Body yêu cầu:**
```json
POST /api/rfq
{
  "company":  "ACME Manufacturing",
  "contact":  "Nguyen Van A",
  "email":    "a@acme.vn",
  "phone":    "+84 ...",
  "industry": "electronics",
  "hub":      "dong-van-4",
  "items":    [ { "sku": "CR-GLV-001", "qty": 50 } ],
  "message":  "Can bao gia cho Q3.",
  "website":  ""            // honeypot: phải rỗng
}
```

| Phản hồi | Ý nghĩa |
|---|---|
| `200` | `{ "ok": true, "id": 123 }` — RFQ đã lưu (status `new`) |
| `422` | `{ "error": "missing_fields" }` — kiểm tra thất bại |
| `429` | `{ "error": "rate_limited" }` — quá nhiều lần gửi từ một IP |
| `502` | `{ "error": "submit_failed" }` — lỗi lưu; giữ nguyên giỏ |

## 4. Mô hình lỗi đồng nhất

> Mọi endpoint trả phong bì lỗi JSON đồng nhất với mã HTTP phù hợp; KHÔNG lộ stack trace.

| `error` code | HTTP | Khi nào |
|---|---|---|
| `invalid_json` | 400 | Body không phải JSON hợp lệ |
| `missing_fields` | 422 | Thiếu hoặc sai trường bắt buộc |
| `not_found` | 404 | Tài nguyên (vd SKU) không tồn tại |
| `rate_limited` | 429 | Vượt hạn ngạch IP/cửa sổ |
| `submit_failed` | 502 | Lỗi lưu phía hạ nguồn |

## 5. Giới hạn tần suất và bảo mật API
- Thao tác ghi công khai (`/api/rfq`, liên hệ) bị **rate-limit theo IP** bằng Redis (cửa sổ trượt).
- Ghi phía máy chủ dùng `DIRECTUS_TOKEN`; **token quản trị KHÔNG BAO GIỜ lộ ra trình duyệt**.
- **CORS** giới hạn theo origin của site ở production.
- Áp dụng HTTP security header (CSP, X-Content-Type-Options, Referrer-Policy, chống nhúng frame — xem skill 07).

## 6. Giao diện sẵn sàng ERP (giai đoạn Tích hợp tương lai)

> KHÔNG xây trong 8 tuần; chỉ đặt sẵn `erp_ref` + endpoint stub (Tuần 6).

| Cơ chế | Hợp đồng |
|---|---|
| Import (REST) | `POST /erp/import/{orders\|invoices\|deliveries}` — bản ghi theo lô |
| Import (CSV) | Schema CSV tài liệu hóa cho mỗi collection để nạp hàng loạt |
| Webhook | Phát ra khi tạo/cập nhật các collection này (Directus Flow) |
| Idempotency | Bản ghi ngoài mang `erp_ref`; trình import upsert theo `erp_ref` |

```json
POST /erp/import/orders
{
  "records": [
    { "erp_ref": "SO-2026-0001", "customer_ref": "CUST-009",
      "order_date": "2026-06-01", "status": "confirmed",
      "items": [ { "sku": "CR-GLV-001", "qty": 50, "unit_price": 120000 } ] }
  ]
}
200 { "imported": 1, "updated": 0 }
```

## 7. Phiên bản và quản lý thay đổi
- Endpoint tùy biến mang tính cộng thêm; thay đổi phá vỡ được đánh phiên bản + thông báo.
- Schema Directus tiến hóa cộng thêm với migration; thay đổi phá vỡ cần một ADR.
- Tầng truy cập dữ liệu cô lập bên gọi → thay đổi backend không lan vào component.

## 8. Mẫu hiện thực gợi ý (Next.js route handler)

```ts
// app/api/sku/[code]/route.ts  — PSEUDO
export async function GET(req, { params }) {
  const code = params.code.toLowerCase();
  const cached = await redis.get(`sku:${code}`);
  if (cached) return json(cached, { headers: { "x-cache": "HIT" } });

  const sku = await directusServer.readSku(code);   // 1 lần đọc
  if (!sku) return json({ error: "not_found" }, 404);

  await redis.set(`sku:${code}`, sku, { EX: 3600 }); // TTL 1h
  return json(sku, { headers: { "x-cache": "MISS" } });
}
```

```ts
// app/api/rfq/route.ts  — PSEUDO
const RfqSchema = z.object({ company: z.string().min(1), /* ... */ website: z.string().max(0) });
export async function POST(req) {
  if (await overRateLimit(ip)) return json({ error: "rate_limited" }, 429);
  const body = await safeJson(req);            // invalid_json → 400
  const parsed = RfqSchema.safeParse(body);
  if (!parsed.success) return json({ error: "missing_fields" }, 422);
  if (!(await verifyTurnstile(body.token)))    return json({ error: "missing_fields" }, 422);
  try {
    const id = await directusServer.createRfq({ ...parsed.data, status: "new", source });
    return json({ ok: true, id });
  } catch { return json({ error: "submit_failed" }, 502); }
}
```

## Checklist khi viết API
- [ ] Mọi danh sách có `limit`?
- [ ] Đọc công khai chỉ lấy `status = published`?
- [ ] Ghi công khai có honeypot + Turnstile + rate-limit (BR-08)?
- [ ] Dùng `zod` kiểm tra phía server trước khi ghi?
- [ ] Lỗi trả đúng `error` code + HTTP code (bảng §4)?
- [ ] `DIRECTUS_TOKEN` chỉ dùng phía server, không lộ client?
- [ ] Component gọi qua `@/lib/directus`, không gọi Directus trực tiếp?
