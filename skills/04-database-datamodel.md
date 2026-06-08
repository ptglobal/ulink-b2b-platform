# Skill 04 — Thiết kế CSDL & Từ điển Dữ liệu | Nguồn: ULINK-AD-04

> Mô hình dữ liệu hiện thực trên **Directus / PostgreSQL**. Đây là tham chiếu trường-theo-trường khi tạo collection, viết query, hoặc thiết kế form CMS.

> **Nguồn sự thật:** Khi danh sách trường ở đây khác `directus/SCHEMA.md`, thì **SCHEMA.md là chuẩn cho tên/kiểu cột**; tài liệu này là chuẩn cho **quan hệ, quy tắc truy cập, ý đồ thiết kế**.

## 1. Quy ước mô hình hóa (áp dụng mọi collection)

| Quy ước | Quy tắc |
|---|---|
| **Khóa chính** | Số tự tăng `id` (UUID cho `files` và `users` — mặc định Directus) |
| **Trạng thái publish** | enum `status`: `published \| draft \| archived` trên mọi collection nội dung |
| **Trạng thái nghiệp vụ** | Đơn/hóa đơn/giao hàng dùng enum status nghiệp vụ riêng (xem từng từ điển) |
| **i18n** | Directus Translations trên trường có văn bản (`vi` / `en` / `ja`) |
| **Dấu thời gian** | `date_created`, `date_updated` bật trên mọi collection |
| **Tiền tệ** | `decimal(15,2)` (hoặc số nguyên đơn vị nhỏ); KHÔNG floating point. Đơn vị: **VND** |
| **SEO** | `meta_title` / `meta_description` (i18n) mỗi collection nội dung; mặc định từ `site_settings` |
| **Toàn vẹn** | Khóa ngoại cho mọi quan hệ; danh sách luôn phân trang/`limit` |

## 2. Sơ đồ quan hệ (ERD) tóm tắt
- `product_categories` **tự tham chiếu** (`parent`) → cây phân cấp.
- `products` →(m2o)→ `product_categories`; có nhiều `product_skus`; m2m `industries`; m2o hero + m2m gallery `directus_files`; có nhiều `documents`.
- Thương mại: `customers` (gắn `directus_users`) có nhiều `orders` và `invoices`; `orders` có nhiều `order_items` (→ `product_skus`) và `deliveries`; `rfq_requests` có thể tạo ẩn danh.
- Nội dung độc lập: `blog_posts`, `case_studies`, `iso_certifications`, `pages`, `hero_banners`, `partners` (đều có status + SEO + bản dịch).

### Danh mục quan hệ
| Từ | Loại | Đến | Ghi chú |
|---|---|---|---|
| `product_categories` | tự m2o | `product_categories` | Phân cấp (Cleanroom → Găng tay …) |
| `products` | m2o | `product_categories` | SP thuộc một danh mục |
| `product_skus` | m2o | `products` | SKU thuộc một SP |
| `products` | m2m | `industries` | Gắn thẻ/lọc theo ngành |
| `products` | m2o + m2m | `directus_files` | Ảnh hero + thư viện |
| `documents` | m2o | `products` | TDS/MSDS/chứng nhận theo SP |
| `customers` | m2o | `directus_users` | Gắn định danh xác thực với người mua |
| `orders` | m2o | `customers`, `regional_hubs` | Chủ sở hữu + hub xử lý |
| `order_items` | m2o | `orders`, `product_skus` | Dòng hàng |
| `invoices` | m2o | `customers`, `orders` | Khoản phải thu / công nợ |
| `deliveries` | m2o | `orders`, `regional_hubs` | Lịch giao hàng |
| `rfq_requests` | m2o | `regional_hubs`, `directus_users` | Sales phụ trách; `line_items` JSON |

## 3. Danh mục collection
| Nhóm | Collection |
|---|---|
| **Nội dung** | `hero_banners`, `partners`, `product_categories`, `products`, `product_skus`, `documents`, `regional_hubs`, `industries`, `blog_posts`, `case_studies`, `iso_certifications`, `pages` |
| **Singleton** | `site_settings`, `homepage` |
| **Cổng / thương mại** | `customers`, `orders`, `order_items`, `invoices`, `deliveries`, `rfq_requests` |
| **Sẵn có (Directus)** | `directus_users`, `directus_roles`, `directus_files`, `directus_translations`, `directus_activity` |

---

## 4. Từ điển dữ liệu — Nhóm nội dung

### 4.1. `product_categories`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh tự tăng |
| `name` | string (i18n) | Có | Tên danh mục |
| `slug` | string (unique) | Có | Slug URL, viết thường |
| `parent` | m2o → `product_categories` | Không | Tự tham chiếu cho phân cấp |
| `description` | text (i18n) | Không | Nội dung trang danh mục |
| `hero_image` | m2o → `directus_files` | Không | Banner danh mục |
| `sort` | integer | Không | Sắp xếp thủ công |
| `status` | enum | Có | `published \| draft \| archived` |
| `meta_title` / `meta_description` | string (i18n) | Không | Ghi đè SEO |

### 4.2. `products`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `name` | string (i18n) | Có | Tên sản phẩm |
| `slug` | string (unique) | Có | Slug URL |
| `category` | m2o → `product_categories` | Có | Danh mục sở hữu |
| `short_description` | text (i18n) | Không | Mô tả tóm tắt/listing |
| `specifications` | json (nhãn i18n) | Không | Cặp khóa/giá trị thông số kỹ thuật |
| `hero` | m2o → `directus_files` | Không | Ảnh chính |
| `gallery` | m2m → `directus_files` | Không | Ảnh bổ sung |
| `industries` | m2m → `industries` | Không | Thẻ ngành để lọc |
| `status` | enum | Có | Trạng thái publish |
| `meta_title` / `meta_description` | string (i18n) | Không | Ghi đè SEO |

### 4.3. `product_skus`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `sku_code` | string (unique) | Có | Mã SKU; **Redis lập chỉ mục cho tra cứu <50 ms** |
| `product` | m2o → `products` | Có | Sản phẩm cha |
| `unit` | string | Không | Đơn vị bán (hộp, cuộn, gói…) |
| `pack_size` | string | Không | Số lượng mỗi gói |
| `attributes` | json | Không | Thuộc tính biến thể (kích thước, cấp, màu…) |
| `status` | enum | Có | Trạng thái publish (chặn tìm kiếm/đặt lại — BR-04) |

### 4.4. `documents` (TDS / MSDS / chứng nhận / brochure)
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `title` | string (i18n) | Có | Tiêu đề tài liệu |
| `doc_type` | enum | Có | `tds \| msds \| certificate \| brochure` |
| `product` | m2o → `products` | Không | SP liên quan (tải ở trang chi tiết) |
| `file` | m2o → `directus_files` | Có | Tệp PDF tải về |
| `language` | string | Không | Ngôn ngữ tài liệu (vi/en/ja) |
| `status` | enum | Có | Chặn tải (BR-05) |

### 4.5. `regional_hubs`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `name` | string (i18n) | Có | Tên hub (vd Đông Văn 4) |
| `slug` | string (unique) | Có | Slug URL |
| `delivery_sla` | text (i18n) | Không | Mô tả SLA giao hàng |
| `warehouse_capacity` | string | Không | Tóm tắt năng lực kho |
| `technical_team` | text (i18n) | Không | Đội kỹ thuật / phạm vi phục vụ |
| `cluster_overview` | text (i18n) | Không | Tổng quan cụm công nghiệp |
| `location` / `coordinates` | string / geo | Không | Địa chỉ và điểm bản đồ |
| `gallery` | m2m → `directus_files` | Không | Ảnh hub |
| `status` | enum | Có | Trạng thái publish |

### 4.6. Các collection nội dung khác (trường chính)
| Collection | Trường chính |
|---|---|
| `industries` | `name` (i18n), `slug`, `description` (i18n), `icon`, `status` |
| `blog_posts` | `title` (i18n), `slug`, `body` (i18n), `cover`, `author`, `published_at`, `status`, `meta_*` |
| `case_studies` | `title` (i18n), `slug`, `summary`, `body`, `industry` (m2o), `cover`, `status` |
| `iso_certifications` | `name`, `number`, `issuer`, `valid_until`, `file`, `status` |
| `partners` | `name`, `logo`, `url`, `sort`, `status` |
| `hero_banners` | `title` (i18n), `subtitle`, `image`, `cta_label`, `cta_url`, `sort`, `status` |
| `pages` | `title` (i18n), `slug`, `body` (i18n), `status`, `meta_*` — trang Giới thiệu |
| `site_settings` (singleton) | meta mặc định, logo, liên hệ, mạng xã hội |
| `homepage` (singleton) | tham chiếu khối theo thứ tự |

---

## 5. Từ điển dữ liệu — Nhóm cổng / thương mại

### 5.1. `customers`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `user` | m2o → `directus_users` | Có | **Định danh xác thực gắn kèm (quyết định truy cập theo dòng)** |
| `company_name` | string | Có | Tổ chức người mua |
| `tax_code` | string | Không | Mã số thuế (MST) |
| `contact_name` | string | Không | Người liên hệ chính |
| `email` / `phone` | string | Không | Thông tin liên hệ |
| `address` | text | Không | Địa chỉ thanh toán/giao hàng |
| `sales_owner` | m2o → `directus_users` | Không | Nhân viên Sales phụ trách |
| `status` | enum | Có | `active \| inactive` |

### 5.2. `orders`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `code` | string (unique) | Có | Số đơn dễ đọc |
| `customer` | m2o → `customers` | Có | Chủ sở hữu (phạm vi theo dòng) |
| `order_date` | date | Có | Ngày đặt |
| `status` | enum | Có | `pending \| confirmed \| processing \| shipped \| completed \| cancelled` |
| `hub` | m2o → `regional_hubs` | Không | Hub xử lý |
| `subtotal` / `tax` / `total` | decimal(15,2) | Có | Số tiền (VND) |
| `notes` | text | Không | Ghi chú nội bộ/khách |
| `erp_ref` | string (unique, null) | Không | Khóa ERP ngoài cho đồng bộ idempotent tương lai |

### 5.3. `order_items`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `order` | m2o → `orders` | Có | Đơn cha |
| `sku` | m2o → `product_skus` | Có | SKU đặt mua |
| `description` | string | Không | Mô tả chụp tại thời điểm đặt |
| `qty` | integer | Có | Số lượng |
| `unit_price` | decimal(15,2) | Có | Đơn giá (VND) |
| `line_total` | decimal(15,2) | Có | `qty × unit_price` |

### 5.4. `invoices` (công nợ)
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `code` | string (unique) | Có | Số hóa đơn |
| `customer` | m2o → `customers` | Có | Chủ sở hữu (phạm vi theo dòng) |
| `order` | m2o → `orders` | Không | Đơn nguồn |
| `issue_date` / `due_date` | date | Có | Ngày phát hành và hạn |
| `amount` | decimal(15,2) | Có | Số tiền hóa đơn |
| `paid_amount` | decimal(15,2) | Không | Số đã trả |
| `balance` | decimal(15,2) | Có | Số dư còn lại (công nợ) |
| `paid_status` | enum | Có | `unpaid \| partial \| paid \| overdue` |
| `erp_ref` | string (unique, null) | Không | Khóa ERP ngoài |

### 5.5. `deliveries`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `order` | m2o → `orders` | Có | Đơn nguồn (theo dòng qua `order→customer`) |
| `hub` | m2o → `regional_hubs` | Không | Hub xuất hàng |
| `scheduled_date` | date | Có | Ngày giao dự kiến |
| `delivered_date` | date | Không | Ngày giao thực tế |
| `status` | enum | Có | `scheduled \| in_transit \| delivered \| late \| cancelled` |
| `tracking_ref` | string | Không | Mã vận đơn/theo dõi |
| `erp_ref` | string (unique, null) | Không | Khóa ERP ngoài |

### 5.6. `rfq_requests`
| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `id` | integer (PK) | Có | Định danh |
| `company` | string | Có | Công ty yêu cầu |
| `contact_name` / `email` / `phone` | string | Có | Liên hệ người yêu cầu |
| `industry` | string | Không | Bối cảnh ngành |
| `hub` | m2o → `regional_hubs` | Không | Hub ưu tiên |
| `line_items` | json | Có | Mảng `{ sku, qty }` chụp lúc gửi |
| `message` | text | Không | Ghi chú tự do |
| `status` | enum | Có | `new \| quoted \| won \| lost` |
| `assigned_sales` | m2o → `directus_users` | Không | Sales phụ trách |
| `source` | enum | Không | `web \| portal` |

## 6. Mô hình phân quyền theo dòng (row-level)

Bộ lọc Directus đảm bảo khách chỉ thấy bản ghi của mình:
```json
// orders / invoices / deliveries (deliveries qua order -> customer)
{ "customer": { "user": { "_eq": "$CURRENT_USER" } } }

// customers: khách chỉ đọc/sửa bản ghi của chính mình
{ "user": { "_eq": "$CURRENT_USER" } }
```

| Collection | Customer | Sales | Editor | Admin |
|---|---|---|---|---|
| Nội dung (SP, hub, blog…) | đọc (đã publish) | đọc | CRUD | CRUD |
| `orders` / `order_items` | đọc của mình | CRUD | — | CRUD |
| `invoices` | đọc của mình | CRUD | — | CRUD |
| `deliveries` | đọc của mình | CRUD | — | CRUD |
| `rfq_requests` | tạo + đọc của mình | CRUD | — | CRUD |
| `customers` | đọc/sửa của mình | CRUD | — | CRUD |

## 7. Chỉ mục và cache
- **Chỉ mục duy nhất**: `product_skus.sku_code`, `*.slug`, `orders.code`, `invoices.code`, các cột `erp_ref` (unique cho phép null).
- **Chỉ mục tra cứu**: khóa ngoại (`product`, `category`, `customer`, `order`, `hub`); `status`; `order_date` / `due_date` / `scheduled_date` cho truy vấn cổng.
- **Chỉ mục SKU Redis**: khóa `sku:{code-viết-thường}`, TTL 1 giờ, làm nóng khi publish; phục vụ `/api/sku` <50 ms.

## 8. Giao diện sẵn sàng ERP (tương lai — đặt sẵn ở Tuần 6)
- **Import**: `POST /erp/import/{orders|invoices|deliveries}` + schema CSV tài liệu hóa cho mỗi collection.
- **Webhook**: phát ra khi tạo/cập nhật các collection này (Directus Flow).
- **Idempotency**: bản ghi ngoài mang `erp_ref`; trình import upsert theo `erp_ref`.
- KHÔNG xây trong 8 tuần — chỉ đặt trường `erp_ref` + endpoint stub.

## 9. Seed và migration
- **Migration**: thay đổi schema mang tính **cộng thêm** và có theo dõi; đổi tên/xóa phá vỡ cần migration + ADR.
- **Seed**: nội dung mẫu seed được (SP, hub, đơn/hóa đơn/giao hàng mẫu) hỗ trợ chiến lược xây-một-lần và giúp màn hình cổng demo được.
- **Import**: Sales/Admin nạp dữ liệu cổng hàng loạt qua CSV trong CMS khi chưa có ERP.

## Checklist khi tạo/sửa collection
- [ ] Có `status` enum (nếu là collection nội dung)?
- [ ] Trường văn bản đã bật i18n (Translations)?
- [ ] Có `date_created` / `date_updated`?
- [ ] Tiền tệ dùng `decimal(15,2)` (KHÔNG float)?
- [ ] Slug/code có unique index?
- [ ] Quan hệ có khóa ngoại đầy đủ?
- [ ] Collection cổng có row-level filter đúng (BR-10)?
- [ ] Thay đổi phá vỡ → đã có migration + ADR?
