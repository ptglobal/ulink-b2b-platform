# Hướng dẫn Test API Directus - ULink B2B

Tài liệu này dành cho tester, giúp test nhanh các API (đặc biệt là các endpoint custom).

## 1. Truy cập nhanh

| Công cụ                  | Đường dẫn                              | Mục đích                              |
|--------------------------|----------------------------------------|---------------------------------------|
| Swagger UI (khuyến nghị) | http://localhost:8055/docs            | Test tương tác, xem tất cả API        |
| OpenAPI JSON             | http://localhost:8055/docs/openapi.json | Import vào Postman / Insomnia         |
| Export file tĩnh         | `cd directus && npm run openapi:export` | Tạo file `openapi.json` trong thư mục |

**Lưu ý**: Nên đăng nhập Admin UI trước (http://localhost:8055) để lấy token, sau đó dùng nút **Authorize** ở Swagger.

## 2. Xác thực & Role

- **Lấy token**: Đăng nhập Admin UI → F12 → Network → copy header `Authorization: Bearer ...`
- Các role chính dùng để test:

| Role          | Quyền chính                              | Dùng test gì?                     |
|---------------|------------------------------------------|-----------------------------------|
| Administrator | Toàn quyền                               | Tất cả API (khuyến nghị)          |
| Sales         | Import + Media soft-delete + Commerce    | Commercial import, media policy   |
| Editor        | Quản lý nội dung + Media soft-delete     | Media policy                      |

## 3. Các API Custom (Endpoints mở rộng)

Các endpoint này được phát triển riêng để hỗ trợ các luồng nghiệp vụ thực tế của ULink (onboarding khách hàng, import dữ liệu từ ERP, quản lý media an toàn). Chúng không nằm trong API tự động của Directus.

### 3.1 Đăng ký khách hàng (Public)

**POST** `/customer-onboarding/register`

**Ý nghĩa / Mục đích**:
- Cho phép khách hàng B2B tự đăng ký tài khoản trên cổng thông tin (self-registration).
- Triển khai luồng onboarding 2 bước theo thiết kế:
  - Khách tự đăng ký → tạo `directus_users` (active, role Customer) + `customers` (inactive).
  - Sales sau đó duyệt/kích hoạt hoặc tạo sẵn customer record rồi gửi link mời.
- Hook tự động liên kết user với customer record nếu email đã tồn tại (do Sales tạo trước). Giúp trải nghiệm mượt mà.

**Auth**: Không cần (public)

**Body**:
```json
{
  "company_name": "Công ty ABC",
  "contact_name": "Nguyễn Văn A",
  "email": "a@abc.com",
  "phone": "0987654321",
  "password": "Abc123456!",
  "confirm_password": "Abc123456!"
}
```

**Response thành công (201)**:
```json
{
  "data": {
    "user_id": "...",
    "customer_id": 123,
    "status": "inactive"
  }
}
```

**Curl**:
```bash
curl -X POST http://localhost:8055/customer-onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Co",
    "contact_name": "Tester",
    "email": "test@ulink.vn",
    "phone": "0912345678",
    "password": "Test123456!",
    "confirm_password": "Test123456!"
  }'
```

**Lưu ý test**:
- Email trùng → 409
- Password không khớp → 422
- Sau khi đăng ký thành công, user có thể login ngay.
- Kiểm tra email welcome tại Mailpit: http://localhost:8025

---

### 3.2 Import dữ liệu thương mại (Admin/Sales)

**POST** `/commercial-import/preview` (xem trước, an toàn)  
**POST** `/commercial-import/commit` (thực thi)

**Ý nghĩa / Mục đích**:
- Cho phép Sales/Admin import hàng loạt dữ liệu từ ERP hoặc file CSV (khách hàng, đơn hàng, hóa đơn, giao hàng) mà không cần nhập thủ công từng record.
- Preview giúp kiểm tra và phát hiện lỗi trước khi ghi thật vào database.
- Commit thực hiện insert/update thực sự, hỗ trợ partial success và matching linh hoạt theo erp_ref, tax_code hoặc email.

**Auth**: Admin hoặc Sales

**Body**:
```json
{
  "collection": "customers",     // customers | orders | invoices | deliveries
  "csvText": "erp_ref,company_name,email\nERP001,ACME,a@acme.vn",
  "allowPartial": false
}
```

**Curl (Preview)**:
```bash
curl -X POST http://localhost:8055/commercial-import/preview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "customers",
    "csvText": "erp_ref,company_name\nERP-001,ACME",
    "allowPartial": false
  }'
```

**Response mẫu**:
- Preview: `{ "data": { "parsed": 10, "valid": 8, "errors": [...] } }`
- Commit: `{ "data": { "created": 5, "updated": 2, "errors": [] } }`

**Lưu ý test**:
- Dùng `preview` trước khi `commit`
- Test CSV sai format, dữ liệu trùng, thiếu cột
- `allowPartial: true` cho phép import một phần

---

### 3.3 Quản lý Media (Xóa file)

**POST** `/media-policy/soft-delete`  
**POST** `/media-policy/hard-delete`

**Ý nghĩa / Mục đích**:
- Thực thi chính sách quản lý media an toàn (media policy).
- Soft-delete: Đưa file vào hàng đợi xóa (retention queue), sau 7 ngày mới bị xóa thật (cho phép khôi phục).
- Hard-delete: Xóa vĩnh viễn ngay, chỉ dành cho Admin và yêu cầu xác nhận kép để tránh xóa nhầm.
- Tất cả hành động đều được ghi audit log (media_audit_events) và theo dõi qua bảng media_retention.

**Auth**:
- soft-delete: Admin / Editor / Sales
- hard-delete: Chỉ Admin + phải xác nhận

**Body soft-delete**:
```json
{
  "fileId": "uuid-file",
  "reason": "File không còn dùng"
}
```

**Body hard-delete** (bắt buộc):
```json
{
  "fileId": "uuid-file",
  "confirmHardDelete": true,
  "confirmFileId": "uuid-file",
  "reason": "Test xóa vĩnh viễn"
}
```

**Curl**:
```bash
curl -X POST http://localhost:8055/media-policy/soft-delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileId": "abc-123", "reason": "Test"}'
```

**Lưu ý test**:
- Hard-delete yêu cầu `confirmHardDelete: true` và `confirmFileId` giống hệt (bảo vệ chống xóa nhầm).
- Sau soft-delete nên kiểm tra bảng `media_retention` (trạng thái và thời gian purge) và `media_audit_events`.
- Chạy `npm run media:cleanup` (trong thư mục directus) để mô phỏng job xóa hàng ngày.

## 4. API Directus thông thường (dùng cho tester)

**Base**: `http://localhost:8055`

**Một số pattern hay dùng**:

- Lấy dữ liệu published:
  ```
  GET /items/products?filter[status][_eq]=published&limit=20&fields=id,name,slug
  ```

- Lấy kèm translation:
  ```
  GET /items/products?deep[translations][_filter][languages_code][_eq]=vi
  ```

- Tạo / Sửa / Xóa: Dùng `POST /items/{collection}`, `PATCH`, `DELETE`

**Lưu ý**: 
- Customer role chỉ xem được dữ liệu của chính mình (row-level security).
- Nên test với nhiều role khác nhau.

## 5. Các luồng test chi tiết trên Swagger UI

Tài liệu này được viết để test **trực tiếp trên Swagger** (http://localhost:8055/docs).  
Mỗi flow được viết như một kịch bản tester có thể làm theo ngay trên giao diện.

### 5.1 Flow Test: Đăng ký Khách hàng (Customer Onboarding)

**Mục tiêu**: Test endpoint public `/customer-onboarding/register` và kiểm tra luồng onboarding.

**Bước chi tiết trên Swagger**:

1. Scroll đến tag **customer-onboarding**.
2. Click vào operation **POST /customer-onboarding/register**.
3. Nhấn **Try it out**.
4. Trong phần Request body, xóa nội dung mặc định và dán:
   ```json
   {
     "company_name": "Công ty Test Swagger",
     "contact_name": "Tester Swagger",
     "email": "tester01@ulink.vn",
     "phone": "0981122334",
     "password": "SwaggerTest123!",
     "confirm_password": "SwaggerTest123!"
   }
   ```
5. Nhấn **Execute**.
6. Kiểm tra phần **Response**:
   - Status phải là **201 Created**.
   - Body phải có `data.user_id` và `data.customer_id`.
   - `data.status` phải là `"inactive"`.

**Kiểm tra kết quả ngoài Swagger**:
- Vào Directus Admin → **directus_users** → tìm email `tester01@ulink.vn` → status = **active**, role = **Customer**.
- Vào **customers** → tìm công ty vừa tạo → status = **inactive**.
- Mở Mailpit (http://localhost:8025) → kiểm tra có email mới gửi đến địa chỉ vừa dùng.

**Các case test nên thử thêm** (cùng 1 operation):
- Dùng lại email vừa đăng ký → Execute → mong đợi **409**.
- Đổi `confirm_password` thành giá trị sai → mong đợi **422**.

---

### 5.2 Flow Test: Import Dữ liệu Thương mại (Commercial Import)

**Mục tiêu**: Test Preview trước khi Commit.

**Bước 1 – Test Preview**
1. Tìm tag **commercial-import**.
2. Mở **POST /commercial-import/preview**.
3. Đảm bảo đã Authorize bằng token **Admin** hoặc **Sales**.
4. Nhấn **Try it out**.
5. Dán body sau:
   ```json
   {
     "collection": "customers",
     "csvText": "erp_ref,company_name,email\nERP-SWAG-001,Công ty Swagger Import,import@ulink.vn",
     "allowPartial": false
   }
   ```
6. Nhấn **Execute**.
7. Xem Response: phải có các trường `parsed`, `valid`, `errors`, `previewRows`.

**Bước 2 – Test Commit**
1. Mở operation **POST /commercial-import/commit** (cùng tag).
2. Dán **chính xác** cùng body như Preview.
3. Execute.
4. Kiểm tra Response có `created`, `updated`, `errors`.

**Kiểm tra kết quả**:
- Vào Directus Admin → **customers** → tìm công ty "Công ty Swagger Import" hoặc erp_ref "ERP-SWAG-001".
- Thử chạy Commit lại lần nữa → xem nó update hay tạo mới.

**Test case lỗi**:
- Đổi `collection` thành "abcxyz" → Execute → mong đợi lỗi 400.
- Dùng token Customer → mong đợi **403** "Not allowed to run commercial imports."

---

### 5.3 Flow Test: Quản lý Media (Media Policy)

**Bước chuẩn bị**:
- Vào Directus Admin → **Files** → Upload 1 file bất kỳ.
- Chọn file vừa upload → copy giá trị **ID** (đây là `fileId`).

**Test Soft Delete**:
1. Trên Swagger, tìm tag **media-policy**.
2. Mở **POST /media-policy/soft-delete**.
3. Authorize bằng token Sales/Editor/Admin.
4. Try it out → điền body:
   ```json
   {
     "fileId": "dán-file-id-vừa-upload",
     "reason": "Test soft delete từ Swagger"
   }
   ```
5. Execute → mong đợi status **200**.

**Verify sau Soft Delete**:
- Vào collection **media_retention** → tìm fileId → `state` = `soft_deleted`.
- Vào **media_audit_events** → có log mới với `action` chứa "soft".

**Test Hard Delete** (chỉ dùng token Admin):
1. Mở **POST /media-policy/hard-delete**.
2. Try it out → điền body (phải đúng 100%):
   ```json
   {
     "fileId": "dán-file-id-vừa-upload",
     "reason": "Test hard delete",
     "confirmHardDelete": true,
     "confirmFileId": "dán-file-id-vừa-upload"
   }
   ```
3. Execute.

**Các case quan trọng cần test**:
- Hard delete thiếu `confirmHardDelete: true` hoặc `confirmFileId` sai → status **400**.
- Dùng token Sales gọi hard-delete → status **403**.

---

### 5.4 Flow Test Kiểm tra Quyền (RBAC)

1. Authorize bằng token **Customer**.
2. Tìm các operation liên quan đến `customers`, `orders`, `rfq_requests` → Execute → chỉ được xem data của user đó.
3. Đổi sang token **Sales** → thử các operation `commercial-import` và CRUD commerce → phải thành công.
4. Không Authorize (bỏ token) → chỉ thử các GET content có `filter[status][_eq]=published`.
5. Dùng token **Administrator** → tất cả operation đều cho phép.

**Mẹo**: Sau khi thay token, nhấn lại **Execute** để xem quyền thay đổi ngay trên Swagger.

---

**Quy trình test nhanh hàng ngày (Swagger-focused)**:
1. `docker compose up -d`
2. Đăng nhập Admin UI (http://localhost:8055) → lấy Bearer token.
3. Mở http://localhost:8055/docs → Authorize với token.
4. Chạy theo thứ tự sau (tùy nhu cầu):
   - 5.1 Onboarding (public, không cần token)
   - 5.2 Commercial Import (cần Sales/Admin token)
   - 5.3 Media Policy
   - 5.4 RBAC (thử nhiều token khác nhau)
5. Sau mỗi Execute: 
   - Kiểm tra Response body + status.
   - Vào Directus Admin UI kiểm tra side-effect (bảng tương ứng).
   - Kiểm tra Mailpit nếu có email.
6. Dọn dẹp dữ liệu test (xóa record vừa tạo nếu cần).

---

## 6. Các flow nghiệp vụ bổ sung (nên test thêm)

### 6.1 End-to-End RFQ Flow (từ Directus perspective)
**Mục tiêu**: Kiểm tra RFQ được tạo + rule routing + notify.

**Các bước trên Swagger + Admin**:
1. Authorize bằng token Sales hoặc Admin.
2. Tạo rule routing trước: POST /items/rfq_assignment_rules (hoặc dùng Admin UI).
   - Ví dụ: hub + industry → assigned_sales cụ thể.
3. Gọi POST /items/rfq_requests (hoặc qua frontend /api/rfq rồi kiểm tra Directus).
4. Kiểm tra:
   - rfq_requests có assigned_sales đúng theo rule.
   - status = "new".
5. (Nếu có Flow) Kiểm tra internal webhook đã trigger (xem activity hoặc notification trong Admin).

**Verify**:
- Vào Admin → rfq_requests → xem assigned_sales.
- Vào Mailpit xem email notify (nếu flow chạy).
- Kiểm tra directus_users (sales) có notification mới.

### 6.2 Content Publish + Cache Invalidation Flow
**Mục tiêu**: Kiểm tra publish content → revalidate.

**Các bước**:
1. Sửa 1 item content (ví dụ products hoặc blog_posts) → set status = "published".
2. Save.
3. Kiểm tra trong Next.js app (hoặc gọi /api/revalidate nếu có quyền) xem cache đã bị invalid.
4. Hoặc kiểm tra activity log.

**Lưu ý**: Phần revalidate chủ yếu ở frontend, nhưng tester có thể verify qua Directus publish action.

### 6.3 ERP Outbox Flow (integration_events)
**Mục tiêu**: Kiểm tra thay đổi commerce data được ghi vào outbox.

**Các bước**:
1. Tạo/sửa 1 order, invoice hoặc delivery (dùng Swagger /items/orders hoặc Admin UI).
2. Kiểm tra ngay bảng **integration_events**:
   - Có record mới với entity đúng, op = "create" hoặc "update".
   - payload chứa full snapshot.
   - status = "pending".
3. (Nếu có worker) Chạy flow hoặc endpoint internal để drain outbox.

---

### 6.4 Full Customer Onboarding Flow (Self-register + Sales Activation/Invite)

**Mục tiêu**: Kiểm tra toàn bộ vòng đời onboarding khách hàng (self-register → sales duyệt/kích hoạt).

**Các bước trên Swagger**:

**Bước 1: Self-register (Public)**
1. Không Authorize (hoặc dùng token Visitor nếu cần).
2. Mở **POST /customer-onboarding/register**.
3. Try it out, điền body khách mới (dùng email chưa tồn tại).
4. Execute → lấy `user_id` và `customer_id` từ response.
5. Kiểm tra:
   - directus_users: active + role Customer.
   - customers: inactive.

**Bước 2: Sales Activation (dùng token Sales/Admin)**
1. Authorize bằng token Sales hoặc Admin.
2. Mở **PATCH /items/customers/{customer_id}** (hoặc dùng Admin UI).
3. Cập nhật:
   ```json
   {
     "status": "active",
     "erp_ref": "ERP-CUST-TEST-001",
     "tax_code": "0123456789",
     "sales_owner": "<id của user Sales>"
   }
   ```
4. Execute.

**Verify**:
- customers.status = "active".
- Kiểm tra user có thể login với role Customer.
- (Nếu có email) Kiểm tra Mailpit có email thông báo active.

**Case test**:
- Sales tạo sẵn customer (inactive, không có user) → khách tự register với cùng email → hook tự động liên kết và active customer.

---

### 6.5 RFQ Notification & Sales Assignment Flow

**Mục tiêu**: Kiểm tra RFQ được tạo → rule matching → assigned_sales + notification.

**Các bước**:

1. (Chuẩn bị) Authorize bằng Sales/Admin.
2. Tạo hoặc sửa **rfq_assignment_rules** (POST/PATCH /items/rfq_assignment_rules):
   - Thiết lập rule cho hub + industry → một sales cụ thể.
   - Có thể tạo 1 rule default (is_default = true).
3. Tạo RFQ: POST /items/rfq_requests (hoặc qua frontend).
   - Điền line_items, hub, industry phù hợp rule.
4. Sau khi tạo, kiểm tra ngay:
   - rfq_requests.assigned_sales = đúng sales theo rule.
   - rfq_requests.status = "new".
5. Kiểm tra notification:
   - Vào Admin → Notifications (hoặc directus_users notifications).
   - Kiểm tra Mailpit có email notify cho sales được assign.

**Lưu ý**: Phần notify thực tế thường do Directus Flow gọi internal endpoint, nên tester có thể simulate bằng cách gọi trực tiếp endpoint internal nếu biết (xem verify_rfq_notification_flow.mjs).

---

### 6.6 Password Reset Flow

**Mục tiêu**: Kiểm tra quên mật khẩu + reset.

**Các bước trên Swagger**:

1. (Không cần token) Mở **POST /auth/password/request**.
2. Gửi body với email của user đã tồn tại (ví dụ customer hoặc sales).
3. Kiểm tra Mailpit: có email reset với link chứa token.

4. (Hoặc dùng token từ email) Mở **POST /auth/password/reset**.
5. Điền:
   ```json
   {
     "token": "<token từ email>",
     "password": "NewPassword123!",
     "confirm_password": "NewPassword123!"
   }
   ```
6. Execute → status 200.

**Verify**:
- User có thể login với mật khẩu mới.
- Token reset chỉ dùng 1 lần (test lại lần 2 → lỗi).

---

### 6.7 SKU Cache Sync Flow (khi product_skus thay đổi)

**Mục tiêu**: Kiểm tra khi SKU thay đổi (create/update/delete) thì cache được sync.

**Các bước**:

1. Authorize bằng Admin/Sales.
2. Tạo hoặc sửa một **product_skus** (POST/PATCH /items/product_skus).
3. Kiểm tra:
   - Record có trong bảng product_skus.
4. (Nếu có Flow) Flow sku-cache-sync sẽ gọi internal endpoint.
5. Verify:
   - Gọi frontend `/api/sku/{sku_code}` (hoặc kiểm tra Redis nếu có quyền).
   - Dữ liệu phải match với record vừa thay đổi.
6. Test xóa SKU → kiểm tra cache bị invalidate.

**Lưu ý**: Phần sync chủ yếu qua Directus Flow + internal endpoint. Tester có thể trigger bằng cách thay đổi SKU rồi gọi verify script hoặc kiểm tra frontend.

---

### 6.8 Media Daily Cleanup Simulation

**Mục tiêu**: Mô phỏng job xóa file sau soft-delete.

**Các bước**:

1. Thực hiện soft-delete 1 file (flow 5.3).
2. Chạy lệnh trong terminal (thư mục directus):
   ```bash
   npm run media:cleanup
   ```
3. Kiểm tra:
   - File bị xóa khỏi disk và directus_files.
   - Record trong media_retention chuyển sang state = "purged", hard_deleted_at được set.
   - Có log mới trong media_audit_events (action = hard_delete).

**Lưu ý**: Job này chạy theo cron (12:00 hàng ngày theo MEDIA_POLICY).

---

### 6.9 SKU Cache Sync Flow (khi thay đổi product_skus)

**Mục tiêu**: Xác nhận khi SKU được tạo/sửa/xóa, cache Redis được cập nhật qua Directus Flow + internal endpoint.

**Các bước trên Swagger**:
1. Authorize bằng Admin hoặc Sales.
2. Tạo mới một product_skus (POST /items/product_skus) với sku_code chưa tồn tại, liên kết product.
3. Kiểm tra response thành công.
4. (Flow sku-cache-sync sẽ tự trigger) Kiểm tra side-effect:
   - Gọi frontend `GET /api/sku/{sku_code}` (hoặc dùng Postman) → phải trả đúng data mới.
5. Sửa sku_code của record vừa tạo.
6. Kiểm tra lại /api/sku với sku mới → data cập nhật, sku cũ bị invalidate.
7. Xóa record → kiểm tra sku không còn tồn tại ở cache/frontend.

**Verify**:
- Kiểm tra bảng product_skus.
- Nếu có quyền Redis, kiểm tra key `sku:{normalized_code}`.
- Chạy verify script nếu cần: `npm run verify:sku-cache-hook`

**Lưu ý**: Phần sync chủ yếu do Directus Flow gọi internal. Tester chủ yếu verify qua frontend API và data consistency.

---

### 6.10 Full Commerce Lifecycle (Order → Invoice → Delivery → ERP Outbox)

**Mục tiêu**: Test toàn bộ vòng đời giao dịch B2B và ERP sync.

**Các bước** (dùng Swagger với token Sales/Admin):

1. Tạo customer nếu chưa có (POST /items/customers).
2. Tạo order: POST /items/orders
   - Liên kết customer, hub, subtotal, total.
   - Tạo order_items tương ứng (POST /items/order_items).
3. Kiểm tra integration_events: có record cho orders (create).
4. Tạo invoice: POST /items/invoices (liên kết order + customer).
5. Kiểm tra integration_events thêm record invoices.
6. Tạo delivery: POST /items/deliveries (liên kết order + hub).
7. Kiểm tra integration_events cho deliveries.
8. Cập nhật status order → "completed", invoice → "paid", delivery → "delivered".
9. Kiểm tra thêm records integration_events (update).
10. (Nếu có worker) Gọi internal erp-outbox endpoint hoặc trigger Flow để drain.

**Verify**:
- Tất cả record commerce có erp_ref (nếu test ERP matching).
- Bảng integration_events có đầy đủ payload.
- Kiểm tra status nhất quán giữa các bảng.

---

### 6.11 Authentication & Session Flow (Login, Refresh, Me, Reset)

**Mục tiêu**: Test đầy đủ auth mechanisms của Directus.

**Các bước trên Swagger**:

**Login**:
1. Không Authorize.
2. Mở **POST /auth/login**.
3. Điền email + password của user (ví dụ Sales hoặc Customer).
4. Execute → lấy access_token và refresh_token.

**Refresh**:
1. Dùng refresh_token vừa lấy, gọi **POST /auth/refresh**.
2. Nhận access_token mới.

**Me**:
1. Authorize bằng access_token.
2. Gọi **GET /users/me** → xem thông tin user hiện tại.
3. PATCH /users/me để cập nhật (ví dụ phone).

**Password Reset** (kết hợp flow 6.6):
- Request reset → nhận email → reset → login lại với mật khẩu mới.

**Verify**:
- Token hết hạn → thử call /users/me → 401.
- Refresh token chỉ dùng 1 lần (test refresh lần 2 → lỗi).

**Lưu ý**: Đây là nền tảng cho tất cả flow khác. Tester nên chạy flow này trước khi test các flow có auth.

---

**Quy trình test nhanh hàng ngày (Swagger-focused)**:
1. `docker compose up -d`
2. Đăng nhập Admin UI (http://localhost:8055) → lấy Bearer token.
3. Mở http://localhost:8055/docs → Authorize với token.
4. Chạy theo thứ tự sau (tùy nhu cầu):
   - 5.1 Onboarding (public, không cần token)
   - 5.2 Commercial Import (cần Sales/Admin token)
   - 5.3 Media Policy
   - 5.4 RBAC (thử nhiều token khác nhau)
   - 6.1 → 6.11 các flow nghiệp vụ
5. Sau mỗi Execute: 
   - Kiểm tra Response body + status.
   - Vào Directus Admin UI kiểm tra side-effect (bảng tương ứng).
   - Kiểm tra Mailpit nếu có email.
6. Dọn dẹp dữ liệu test (xóa record vừa tạo nếu cần).

---

**Tài liệu liên quan**:
- `directus/overview.md` (tổng quan setup)
- `directus/SCHEMA.md` (chi tiết collections, relations, RBAC)
- `docs/specs/SPEC-04-api-spec.md` (toàn bộ API spec, gồm Next.js endpoints)
- Verify scripts: `directus/verify_*.mjs` (có thể chạy để check contract)
- Live Swagger: http://localhost:8055/docs (luôn cập nhật theo openapi.json merged)

Cập nhật tài liệu này khi thêm hoặc thay đổi endpoint/flow.