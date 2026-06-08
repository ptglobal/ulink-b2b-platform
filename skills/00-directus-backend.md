# Skill: Directus Backend - ULink Industries

## Tổng quan

Backend của ULink được xây dựng hoàn toàn trên **Directus 11** chạy trên **PostgreSQL 16** với **Redis 7** làm cache layer. Đây là quyết định kiến trúc cốt lõi (ADR-0001, ADR-0007) nhằm loại bỏ ~70% công sức backend thông thường.

## Stack Backend

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| CMS / API | Directus 11 | Admin UI, REST + GraphQL, auth, RBAC, i18n, media |
| CSDL | PostgreSQL 16 | Nguồn dữ liệu chuẩn |
| Cache | Redis 7 | Cache tra cứu SKU (<50ms), cache phản hồi Directus |
| Hạ tầng | Docker Compose trên VPS | Directus + PostgreSQL + Redis sau Caddy/Nginx (HTTPS) |

## Directus cung cấp sẵn

Directus đảm nhận các tính năng sau mà KHÔNG cần code thêm:

1. **Admin UI** - Giao diện quản trị cho Editor/Sales/Admin
2. **REST API** - `/items/{collection}` tự động cho mọi collection
3. **GraphQL API** - `/graphql` cho đọc nội dung có quan hệ lồng
4. **Authentication** - JWT login/refresh/logout
5. **RBAC** - Phân quyền theo vai trò với bộ lọc theo dòng (row-level)
6. **i18n** - Directus Translations cho nội dung đa ngôn ngữ
7. **Media/Files** - Upload, transform, serve ảnh/PDF
8. **Activity Log** - Nhật ký hoạt động cho kiểm toán
9. **Flows** - Automation/webhook khi publish nội dung

## Cấu trúc Collection trong Directus

### Nhóm Nội dung (Content)
```
hero_banners          - Banner trang chủ
partners              - Logo đối tác
product_categories    - Danh mục SP (cây phân cấp)
products              - Sản phẩm
product_skus          - Biến thể SKU
documents             - TDS/MSDS/chứng nhận
regional_hubs         - 5 Cụm vùng (KCN)
industries            - Ngành (Điện tử, Dược, Mỹ phẩm, F&B)
blog_posts            - Bài viết
case_studies          - Case study
iso_certifications    - Chứng nhận ISO
pages                 - Trang tĩnh (Giới thiệu)
```

### Nhóm Singleton
```
site_settings         - Cấu hình site (meta, logo, liên hệ)
homepage              - Tham chiếu khối trang chủ theo thứ tự
```

### Nhóm Cổng / Thương mại (Portal)
```
customers             - Khách hàng B2B (gắn directus_users)
orders                - Đơn hàng
order_items           - Dòng hàng trong đơn
invoices              - Hóa đơn / Công nợ
deliveries            - Lịch giao hàng
rfq_requests          - Yêu cầu báo giá
```

### Directus System Collections
```
directus_users        - Người dùng hệ thống
directus_roles        - Vai trò
directus_files        - Media/tệp
directus_translations - Bản dịch
directus_activity     - Nhật ký
```

## Quy ước khi làm việc với Directus

### 1. Trạng thái Publish
Mọi collection nội dung có trường `status` với enum: `published | draft | archived`.
- Chỉ nội dung `status = published` mới hiển thị trên trang công khai
- Bản nháp/lưu trữ chỉ visible trong admin

### 2. Khóa chính
- Số tự tăng `id` cho collection tùy chỉnh
- UUID cho files và users (mặc định Directus)

### 3. Dấu thời gian
Bật `date_created` và `date_updated` trên mọi collection.

### 4. i18n (Đa ngôn ngữ)
- Sử dụng Directus Translations trên mọi trường có văn bản
- 3 locale: `vi`, `en`, `ja`
- Frontend request locale hiện hành qua `deep` parameter

### 5. SEO Metadata
Mọi collection nội dung có `meta_title` và `meta_description` (i18n), mặc định từ `site_settings`.

### 6. Tiền tệ
- Lưu `decimal(15,2)` - KHÔNG dùng floating point
- Đơn vị: VND

## Cấu hình RBAC trong Directus

### Vai trò và quyền

| Vai trò | Quyền tóm tắt |
|---|---|
| **Admin** | Toàn hệ thống: mọi collection, users, roles, settings |
| **Editor** | CRUD nội dung + publish/unpublish; KHÔNG quản trị users/roles |
| **Sales** | CRUD trên rfq_requests, orders, invoices, deliveries, customers; đọc nội dung |
| **Customer** | Đọc theo dòng: chỉ đơn/hóa đơn/giao hàng của chính mình |

### Bộ lọc theo dòng (Row-Level Filter)

Áp dụng cho vai trò Customer trên các collection cổng:

```json
// orders, invoices, deliveries
{ "customer": { "user": { "_eq": "$CURRENT_USER" } } }

// customers - chỉ đọc/sửa bản ghi của mình
{ "user": { "_eq": "$CURRENT_USER" } }
```

### Role Public (Anonymous)
- Đọc nội dung đã publish: `filter[status][_eq]=published`
- Chỉ đọc, không ghi

## Directus REST API - Cách sử dụng

### Đọc nội dung công khai
```
GET /items/products
  ?filter[status][_eq]=published
  &filter[category][_eq]=12
  &fields=id,name,slug,hero,short_description
  &sort=name
  &limit=24
  &page=1
```

### Đọc với bản dịch (i18n)
```
GET /items/products/7
  ?fields=*,translations.*
  &deep[translations][_filter][languages_code][_eq]=vi
```

### Authentication
```
POST /auth/login        { "email": "...", "password": "..." }
POST /auth/refresh      { "refresh_token": "..." }
POST /auth/logout       { "refresh_token": "..." }
```

### Files/Media
```
GET /files/{id}         - Metadata
GET /assets/{id}        - Serve file (có transform cho ảnh)
```

## Directus Flows (Automation)

### Flow 1: Revalidate ISR khi Publish
- **Trigger**: item.update trên các collection nội dung khi `status` chuyển sang `published`
- **Action**: Gửi webhook tới Next.js revalidateTag
- **Kết quả**: Trang ISR liên quan được làm mới

### Flow 2: Làm nóng Cache SKU
- **Trigger**: item.create/update trên `product_skus`
- **Action**: Ghi/cập nhật khóa Redis `sku:{code}`
- **Kết quả**: Cache SKU luôn ấm sau publish

### Flow 3: Thông báo RFQ mới
- **Trigger**: item.create trên `rfq_requests`
- **Action**: Gửi thông báo tới Sales (email/notification)

## Tầng truy cập dữ liệu (Data Access Layer)

Frontend KHÔNG gọi Directus trực tiếp từ component. Tất cả đi qua `@/lib/directus`:

```
src/lib/directus/
├── client.ts           - Khởi tạo Directus SDK client
├── products.ts         - Queries cho sản phẩm/SKU
├── content.ts          - Queries cho nội dung (blog, hub, pages)
├── portal.ts           - Queries cho cổng (orders, invoices, deliveries)
├── auth.ts             - Login/refresh/logout
└── types.ts            - TypeScript types cho collections
```

Quy tắc:
- React component KHÔNG import trực tiếp từ Directus SDK
- Mọi query đi qua tầng `@/lib/directus`
- Tầng này cô lập backend khỏi UI — thay đổi API không lan vào component

## Biến môi trường Directus

```env
# Server
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=<static-server-token>    # Chỉ phía server, KHÔNG lộ client

# Database
DB_CLIENT=pg
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=ulink
DB_USER=directus
DB_PASSWORD=<secret>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
KEY=<random-uuid>
SECRET=<random-secret>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# CORS
CORS_ENABLED=true
CORS_ORIGIN=https://ulink.vn

# Files
STORAGE_LOCATIONS=local
STORAGE_LOCAL_ROOT=./uploads
```

## Docker Compose Setup

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
      # ... env vars above
    volumes:
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: ulink
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: <secret>
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile

volumes:
  pgdata:
```

## Giao diện sẵn sàng ERP (Tương lai)

Không xây trong phạm vi 8 tuần, nhưng đặt sẵn:

1. **Trường `erp_ref`** trên orders, invoices, deliveries (unique, nullable)
2. **Endpoint stub**: `POST /erp/import/{orders|invoices|deliveries}`
3. **Webhook**: Directus Flow phát ra khi tạo/cập nhật các collection thương mại
4. **Idempotency**: Import upsert theo `erp_ref`

## Lưu ý quan trọng khi code

1. **KHÔNG xây backend riêng** - Directus là backend duy nhất (ADR-0007)
2. **Chỉ 2 route handler tùy biến** trong Next.js: `/api/sku` và `/api/rfq`
3. **Token quản trị KHÔNG BAO GIỜ lộ ra client** - chỉ dùng phía server
4. **Mọi danh sách phải có `limit`** - không truy vấn không chặn
5. **Schema thay đổi cộng thêm** - đổi tên/xóa cần migration và ADR
6. **NestJS hoãn sang giai đoạn Tích hợp** - không cần trong 8 tuần này
