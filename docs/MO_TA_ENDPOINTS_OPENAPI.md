# Mô tả chi tiết ý nghĩa các Endpoint trong OpenAPI (open.json)

**Nguồn:** File `open.json` được export từ Directus (dynamic OpenAPI spec).  
**Mục đích tài liệu:** Giúp developer, tester và BA hiểu rõ **ý nghĩa nghiệp vụ** và **cách sử dụng** của từng nhóm endpoint thay vì chỉ đọc spec máy móc.

> **Lưu ý quan trọng:**  
> File `open.json` này chỉ chứa **Directus core + collection endpoints** (`/items/*`).  
> Các endpoint custom mở rộng (`/customer-onboarding/register`, `/commercial-import/*`, `/media-policy/*`) **không có** trong file này.  
> Để có spec đầy đủ (kèm custom), dùng: `http://localhost:8055/docs/openapi.json` hoặc chạy `cd directus && npm run openapi:export`.

---

## 1. Authentication & User Management

### `/auth/login` (POST)
**Ý nghĩa:** Xác thực người dùng, trả về access token (JWT) và refresh token.  
**Sử dụng:** Tất cả tester và client phải gọi endpoint này trước khi gọi API cần quyền.  
**Lưu ý:** Dùng email/password của các role (Admin, Sales, Customer, Editor).

### `/auth/logout` (POST)
**Ý nghĩa:** Hủy session hiện tại (invalidate refresh token).

### `/auth/refresh` (POST)
**Ý nghĩa:** Làm mới access token khi hết hạn mà không cần đăng nhập lại.

### `/auth/password/request` (POST)
**Ý nghĩa:** Gửi email reset password (sử dụng trong flow quên mật khẩu).

### `/auth/password/reset` (POST)
**Ý nghĩa:** Thực hiện reset password với token từ email.

### `/users/register` (POST)
**Ý nghĩa:** Đăng ký user mới (thường dùng cho public registration hoặc admin tạo user).

### `/users/me` (GET/PATCH)
**Ý nghĩa:** Lấy/cập nhật thông tin user hiện tại đang đăng nhập (profile).

### `/users/invite` + `/users/invite/accept`
**Ý nghĩa:** Sales/Admin mời user mới (gửi email mời) và user chấp nhận lời mời để set password lần đầu.

### `/users/me/tfa/*`
**Ý nghĩa:** Bật/tắt Two-Factor Authentication cho user.

---

## 2. System & Admin Endpoints (Dành cho Admin/Dev)

Các endpoint này dùng để quản trị Directus (thường chỉ Admin role mới có quyền đầy đủ):

- `/collections`, `/fields`, `/relations` → Quản lý cấu trúc data model.
- `/roles`, `/permissions` → Quản lý role và quyền chi tiết (row-level security).
- `/presets`, `/settings` → Cấu hình UI và setting toàn hệ thống.
- `/flows`, `/operations` → Quản lý Directus Flows (webhook automation như RFQ notify, SKU cache sync, ERP outbox).
- `/extensions` → Liệt kê các extension đã cài (bao gồm custom endpoint của chúng ta).

**Lưu ý cho tester:** Thường không cần test sâu các endpoint này trừ khi test RBAC hoặc Flow.

---

## 3. Content & Marketing Collections (`/items/*`)

Đây là các collection dùng cho website công khai (marketing site).

### Sản phẩm & Danh mục
- `/items/product_categories` & `/items/product_categories/{id}`
  **Ý nghĩa:** Quản lý cây danh mục sản phẩm (có parent để tạo hierarchy). Dùng cho menu lọc sản phẩm.

- `/items/products` & `/items/products/{id}`
  **Ý nghĩa:** Thông tin sản phẩm chính (hero, gallery, specifications, industries liên kết). Đây là core content của catalog.

- `/items/product_skus` & `/items/product_skus/{id}`
  **Ý nghĩa:** SKU cụ thể (mã sản phẩm, đơn vị, pack size, attributes). Đây là layer quan trọng nhất cho Quick Order và cache Redis.

- `/items/documents`
  **Ý nghĩa:** Tài liệu kỹ thuật đính kèm sản phẩm (TDS, MSDS, Certificate, Brochure).

### Nội dung Marketing
- `/items/hero_banners`
  **Ý nghĩa:** Banner chính trang chủ (có CTA).

- `/items/partners`
  **Ý nghĩa:** Đối tác chiến lược (logo + link).

- `/items/industries`
  **Ý nghĩa:** Ngành nghề khách hàng nhắm đến (electronics, pharmaceutical...).

- `/items/regional_hubs`
  **Ý nghĩa:** Thông tin kho vùng (delivery SLA, technical team, location). Dùng cho trang hub và RFQ.

- `/items/blog_posts`, `/items/case_studies`, `/items/iso_certifications`, `/items/pages`
  **Ý nghĩa:** Nội dung marketing (blog, case study, chứng chỉ ISO, trang tĩnh).

**Lưu ý chung cho content endpoints:**
- Thường dùng `?filter[status][_eq]=published` khi lấy dữ liệu public.
- Hỗ trợ `deep` để lấy translations (vi, en, ja).
- Có `meta_title`, `meta_description` cho SEO.

---

## 4. B2B Portal & Commerce Data (Quan trọng nhất)

### Khách hàng & Commerce
- `/items/customers`
  **Ý nghĩa:** Tài khoản khách hàng B2B (liên kết với directus_users). Chứa erp_ref, tax_code, sales_owner. Đây là "nguồn sự thật" cho tất cả đơn hàng/hóa đơn.

- `/items/orders` + `/items/order_items`
  **Ý nghĩa:** Lịch sử đơn hàng và chi tiết line items. Dùng cho portal xem lịch sử mua hàng và re-order.

- `/items/invoices`
  **Ý nghĩa:** Hóa đơn công nợ (accounts receivable). Kết nối với order.

- `/items/deliveries`
  **Ý nghĩa:** Lịch giao hàng và trạng thái thực tế (scheduled → delivered).

### RFQ (Request for Quote) – Quy trình bán hàng chính
- `/items/rfq_requests`
  **Ý nghĩa:** Yêu cầu báo giá từ khách (web hoặc portal). Chứa line_items (JSON), assigned_sales, status (new → quoted → won/lost).

- `/items/rfq_assignment_rules`
  **Ý nghĩa:** Quy tắc routing tự động RFQ theo hub + industry → sales person. Dùng cho internal notifier flow.

### ERP Integration
- `/items/integration_events`
  **Ý nghĩa:** Outbox pattern để đồng bộ thay đổi (create/update orders, invoices, deliveries) sang ERP. Chứa payload, status, attempts, idempotency_key.

**Lưu ý quan trọng cho tester:**
- Customer role chỉ thấy data của chính mình (row level security).
- Sales role thấy toàn bộ commerce data.
- `erp_ref` là trường then chốt để matching với hệ thống ERP.

---

## 5. Media & Governance

- `/files` & `/files/{id}`
  **Ý nghĩa:** Quản lý file upload (ảnh, PDF, SVG...). Directus tự động xử lý storage và thumbnail.

- `/items/media_retention`
  **Ý nghĩa:** Hàng đợi xóa mềm (soft delete). File sẽ bị xóa thật sau 7 ngày (theo media policy).

- `/items/media_audit_events`
  **Ý nghĩa:** Audit log chi tiết mọi hành động upload/delete file (ai làm, khi nào, lý do, IP...).

**Lưu ý:** Custom endpoint `/media-policy/*` (không có trong open.json này) dùng để thực thi soft/hard delete an toàn.

---

## 6. System Utilities & Internal

- `/utils/*` (export, import, hash, sort, cache/clear...)
  **Ý nghĩa:** Các tiện ích hỗ trợ admin (export collection ra CSV, clear cache, sort items...).

- `/server/info`, `/server/ping`
  **Ý nghĩa:** Health check và thông tin server (dùng cho monitoring).

- `/schema/*`
  **Ý nghĩa:** Snapshot/diff/apply schema (dùng trong CI/CD hoặc migration).

- `/activity`, `/revisions`, `/versions`, `/comments`, `/presets`
  **Ý nghĩa:** Theo dõi hoạt động, version control nội dung, comment trong Admin UI.

---

## Tóm tắt nhóm Endpoint theo nghiệp vụ ULink

| Nhóm | Endpoint chính | Ý nghĩa nghiệp vụ chính |
|------|----------------|-------------------------|
| Public Marketing | `/items/products*`, `/items/regional_hubs*`, `/items/hero_banners*`... | Hiển thị catalog, hub, nội dung website |
| B2B Commerce | `/items/customers`, `/items/orders`, `/items/invoices`, `/items/deliveries` | Lịch sử giao dịch & công nợ khách hàng |
| Bán hàng (RFQ) | `/items/rfq_requests`, `/items/rfq_assignment_rules` | Tiếp nhận & phân công yêu cầu báo giá |
| ERP Sync | `/items/integration_events` | Đồng bộ thay đổi đơn hàng/hóa đơn sang hệ thống ERP |
| Media Governance | `/files`, `/items/media_retention`, `/items/media_audit_events` | Quản lý file an toàn, xóa mềm, audit |
| Authentication | `/auth/*`, `/users/*` | Quản lý đăng nhập, user, role, invite |

---

**Hướng dẫn sử dụng tài liệu này khi test:**

1. Mở Swagger: http://localhost:8055/docs
2. Authorize bằng token phù hợp với role (Admin/Sales/Customer)
3. Tìm endpoint theo tag hoặc search
4. Dùng tài liệu này để hiểu "tại sao endpoint này tồn tại" và "kết quả mong đợi là gì"
5. Kết hợp với file `directus/HUONG_DAN_TEST_API.md` để có flow test chi tiết.

Nếu cần phiên bản đầy đủ hơn (kèm custom endpoints), hãy dùng spec từ `/docs/openapi.json`.

Cập nhật tài liệu này khi thêm collection mới hoặc thay đổi business logic.