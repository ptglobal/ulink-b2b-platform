# 🧪 CHUẨN BỊ API CRUD TESTING — DIRECTUS B2B PORTAL

## 1. Cài đặt Công cụ

- [ ] **Postman** (hoặc Insomnia) — Tải và cài đặt
- [ ] Tạo **Collection** mới trong Postman tên: `ULink B2B - API CRUD Test`
- [ ] Tạo **Environment** trong Postman với các biến:

| Biến | Giá trị (ví dụ) | Ghi chú |
|:---|:---|:---|
| `BASE_URL` | `http://localhost:8055` | URL Directus Staging |
| `ADMIN_TOKEN` | *(lấy từ Dev)* | Token Admin tĩnh |
| `CUSTOMER_A_TOKEN` | *(sau khi login)* | JWT của Customer A |
| `CUSTOMER_B_TOKEN` | *(sau khi login)* | JWT của Customer B |
| `SALES_TOKEN` | *(sau khi login)* | JWT của Sales |
| `EDITOR_TOKEN` | *(sau khi login)* | JWT của Editor |

---

## 2. Yêu Cầu Từ Dev (Hỏi trước khi test)

> [!IMPORTANT]
> Bạn cần xin Dev cung cấp những thứ sau trước khi bắt đầu:

- [ ] **URL môi trường Staging** (Directus đã deploy)
- [ ] **Tài khoản Admin** (email + password) để đăng nhập Directus
- [ ] Xác nhận **database đã seed dữ liệu mẫu** (sản phẩm, SKU, hub...)
- [ ] Xác nhận **các Role** đã được tạo trong Directus (Admin, Editor, Sales, Customer)
- [ ] Xác nhận **RBAC permission** đã cấu hình xong

---

## 3. Tạo Tài Khoản Test (4 vai trò)

Sau khi có quyền Admin, tạo các tài khoản test này trong Directus:

| Tài khoản | Email | Role | Mục đích |
|:---|:---|:---|:---|
| **Admin** | `admin@test.vn` | Admin | Toàn quyền |
| **Editor** | `editor@test.vn` | Editor | CRUD nội dung + publish |
| **Sales** | `sales@test.vn` | Sales | CRUD đơn hàng, RFQ, khách |
| **Customer A** | `customerA@test.vn` | Customer | Xem dữ liệu của mình |
| **Customer B** | `customerB@test.vn` | Customer | Test chéo tài khoản (RBAC) |

> [!WARNING]
> **Bắt buộc phải có 2 tài khoản Customer** (A và B) để test phân quyền theo dòng (row-level security). Đây là yêu cầu P1!

---

## 4. Các API Cần Nắm

### 4.1. Xác thực (Auth)

```
POST {{BASE_URL}}/auth/login
Body: { "email": "xxx@test.vn", "password": "xxx" }
→ Trả về: { "data": { "access_token": "...", "refresh_token": "..." } }

POST {{BASE_URL}}/auth/refresh
Body: { "refresh_token": "..." }

POST {{BASE_URL}}/auth/logout
Body: { "refresh_token": "..." }
```

### 4.2. Directus REST CRUD Pattern

Mọi collection đều theo pattern:

```
GET    {{BASE_URL}}/items/{collection}              → Danh sách (có filter, sort, limit)
GET    {{BASE_URL}}/items/{collection}/{id}          → Chi tiết 1 bản ghi
POST   {{BASE_URL}}/items/{collection}               → Tạo mới
PATCH  {{BASE_URL}}/items/{collection}/{id}           → Cập nhật
DELETE {{BASE_URL}}/items/{collection}/{id}           → Xóa
```

Header chung:
```
Authorization: Bearer {{TOKEN}}
Content-Type: application/json
```

### 4.3. Custom API (Next.js)

```
GET  /api/sku/{code}     → Tra cứu SKU (cache < 50ms)
POST /api/rfq            → Gửi RFQ (đã test ở phần trước)
```

---

## 5. Danh Sách Collection Cần Test CRUD

### Nhóm Cổng/Thương mại (P1 — Test trước)

| # | Collection | Mô tả | Các trường chính |
|:---|:---|:---|:---|
| 1 | `customers` | Khách hàng | company_name, tax_code, contact_name, email, phone, status |
| 2 | `orders` | Đơn hàng | code, customer, order_date, status, hub, subtotal, tax, total |
| 3 | `order_items` | Dòng hàng | order, sku, qty, unit_price, line_total |
| 4 | `invoices` | Hóa đơn/Công nợ | code, customer, order, issue_date, due_date, amount, paid_amount, balance, paid_status |
| 5 | `deliveries` | Lịch giao hàng | order, hub, scheduled_date, delivered_date, status, tracking_ref |
| 6 | `rfq_requests` | Yêu cầu báo giá | company, contact_name, email, line_items, status, assigned_sales |

### Nhóm Nội dung (P2 — Test sau)

| # | Collection | Mô tả |
|:---|:---|:---|
| 7 | `products` | Sản phẩm |
| 8 | `product_skus` | Mã SKU |
| 9 | `product_categories` | Danh mục SP |
| 10 | `regional_hubs` | Cụm vùng |
| 11 | `blog_posts` | Bài viết |
| 12 | `documents` | TDS/MSDS |

---

## 6. Kịch Bản Test CRUD Cho Mỗi Collection

### Template test cho 1 collection (ví dụ: `orders`)

#### ✅ CREATE (Tạo mới)
```
POST {{BASE_URL}}/items/orders
Authorization: Bearer {{SALES_TOKEN}}

{
  "code": "ORD-TEST-001",
  "customer": 1,
  "order_date": "2026-06-15",
  "status": "pending",
  "subtotal": 5000000,
  "tax": 500000,
  "total": 5500000
}

→ Expected: 200 OK, trả về bản ghi với id
```

#### ✅ READ (Đọc)
```
# Danh sách (có phân trang)
GET {{BASE_URL}}/items/orders?limit=10&page=1&sort=-date_created

# Chi tiết
GET {{BASE_URL}}/items/orders/1?fields=*,customer.*,order_items.*

# Lọc theo status
GET {{BASE_URL}}/items/orders?filter[status][_eq]=pending

→ Expected: 200 OK, trả về dữ liệu đúng
```

#### ✅ UPDATE (Cập nhật)
```
PATCH {{BASE_URL}}/items/orders/1
Authorization: Bearer {{SALES_TOKEN}}

{
  "status": "confirmed",
  "notes": "Đã xác nhận đơn hàng"
}

→ Expected: 200 OK, dữ liệu cập nhật
```

#### ✅ DELETE (Xóa)
```
DELETE {{BASE_URL}}/items/orders/1
Authorization: Bearer {{SALES_TOKEN}}

→ Expected: 204 No Content (hoặc 200)
```

---

## 7. Kịch Bản Test RBAC (Phân Quyền) — P1 Quan Trọng Nhất!

> [!CAUTION]
> Đây là phần test **quan trọng nhất** (P1). Phải đảm bảo khách A KHÔNG xem được dữ liệu khách B!

### 7.1. Test Phân Quyền Theo Dòng (Row-Level Security)

| # | Kịch bản | Token dùng | Expected |
|:---|:---|:---|:---|
| 1 | Customer A xem đơn hàng của mình | `CUSTOMER_A_TOKEN` | ✅ Chỉ thấy đơn của A |
| 2 | Customer A xem đơn hàng của B | `CUSTOMER_A_TOKEN` | ❌ Không thấy / 403 |
| 3 | Customer A truy cập trực tiếp `/items/orders/{id_cua_B}` | `CUSTOMER_A_TOKEN` | ❌ 403 Forbidden |
| 4 | Customer A xem invoices của mình | `CUSTOMER_A_TOKEN` | ✅ Chỉ thấy invoice của A |
| 5 | Customer A xem invoices của B | `CUSTOMER_A_TOKEN` | ❌ Không thấy |
| 6 | Customer A xem deliveries của mình | `CUSTOMER_A_TOKEN` | ✅ Chỉ thấy delivery của A |
| 7 | Customer A xem deliveries của B | `CUSTOMER_A_TOKEN` | ❌ Không thấy |
| 8 | Customer A sửa profile của mình | `CUSTOMER_A_TOKEN` | ✅ Được phép |
| 9 | Customer A sửa profile của B | `CUSTOMER_A_TOKEN` | ❌ 403 Forbidden |

### 7.2. Test Phân Quyền Theo Vai Trò (Role-Based)

| # | Kịch bản | Token dùng | Expected |
|:---|:---|:---|:---|
| 1 | Editor tạo sản phẩm mới | `EDITOR_TOKEN` | ✅ Được phép |
| 2 | Editor publish nội dung | `EDITOR_TOKEN` | ✅ Được phép |
| 3 | Editor tạo/sửa đơn hàng | `EDITOR_TOKEN` | ❌ 403 |
| 4 | Editor quản trị người dùng | `EDITOR_TOKEN` | ❌ 403 |
| 5 | Sales tạo đơn hàng | `SALES_TOKEN` | ✅ Được phép |
| 6 | Sales đổi trạng thái RFQ | `SALES_TOKEN` | ✅ Được phép |
| 7 | Sales publish bài blog | `SALES_TOKEN` | ❌ 403 (chỉ đọc nội dung) |
| 8 | Sales quản trị vai trò | `SALES_TOKEN` | ❌ 403 |
| 9 | Customer tạo đơn hàng | `CUSTOMER_A_TOKEN` | ❌ 403 (chỉ đọc) |
| 10 | Customer tạo RFQ | `CUSTOMER_A_TOKEN` | ✅ Được phép (tạo + đọc của mình) |
| 11 | Không có token, đọc SP published | *(không token)* | ✅ Được phép (public) |
| 12 | Không có token, đọc SP draft | *(không token)* | ❌ Không thấy |

---

## 8. Enum Status Cần Nhớ

| Collection | Các giá trị status |
|:---|:---|
| Nội dung (products, blog...) | `published` \| `draft` \| `archived` |
| `orders` | `pending` \| `confirmed` \| `processing` \| `shipped` \| `completed` \| `cancelled` |
| `invoices` (paid_status) | `unpaid` \| `partial` \| `paid` \| `overdue` |
| `deliveries` | `scheduled` \| `in_transit` \| `delivered` \| `late` \| `cancelled` |
| `rfq_requests` | `new` \| `quoted` \| `won` \| `lost` |
| `customers` | `active` \| `inactive` |

---

## 9. Checklist Hoàn Thành

- [ ] Postman đã cài + Environment đã setup
- [ ] Đã nhận URL Staging + tài khoản Admin từ Dev
- [ ] Đã tạo 5 tài khoản test (Admin, Editor, Sales, Customer A, Customer B)
- [ ] Đã tạo dữ liệu mẫu (đơn hàng, invoice, delivery cho cả Customer A và B)
- [ ] Đã test Auth (login/refresh/logout) cho cả 4 vai trò
- [ ] Đã test CRUD cho 6 collection thương mại
- [ ] Đã test RBAC Row-Level (9 kịch bản chéo tài khoản)
- [ ] Đã test RBAC Role-Based (12 kịch bản phân quyền)
- [ ] Đã log bug lên Jira/Trello nếu có
