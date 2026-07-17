# 🧪 AUTH & ONBOARDING API TEST CASES — CHI TIẾT TỪNG TRƯỜNG HỢP (v3 — Chuẩn hóa theo Code & Dev Spec)

> ✅ Đối chiếu với [open.json](file:///c:/Work/PathTech/ULink/open.json) (Directus Core Spec)
> ✅ Đối chiếu với [MO_TA_ENDPOINTS_OPENAPI.md](file:///c:/Work/PathTech/ULink/MO_TA_ENDPOINTS_OPENAPI.md) (Tài liệu mô tả từ Dev)
> ✅ Dữ liệu thực tế từ [rbac_seed.mjs](file:///c:/Work/PathTech/ULink/ulink-b2b-platform/directus/rbac_seed.mjs) & Custom Extension [customer-onboarding-endpoint](file:///c:/Work/PathTech/ULink/ulink-b2b-platform/directus/extensions/customer-onboarding-endpoint/src/service.js)

> [!IMPORTANT]
> **LƯU Ý CỦA DEV VỀ FLOW REGISTER (ĐĂNG KÝ):**
> 1. **`/customer-onboarding/register` (Custom Endpoint — Bắt buộc dùng cho Portal B2B):**
>    - Đây là API tự đăng ký dành cho Khách hàng mới (Customer Self-Register) của dự án.
>    - Nhận đầy đủ thông tin: `company_name`, `contact_name`, `email`, `phone`, `password`, `confirm_password`.
>    - Tạo đồng thời `directus_users` (active) và bản ghi liên kết `customers` (inactive), đồng thời tự động gửi email chào mừng vào Mailpit.
>    - Trả về status: **`201 Created`**.
> 2. **`/users/register` (Directus Core Endpoint):**
>    - Đây là API đăng ký mặc định của Directus (chỉ nhận `email` & `password` để tạo user thô, không tạo bản ghi `customers` tương ứng và không gửi mail chào mừng custom).
>    - Trả về status: **`200 OK`**.

---

## Tổng Quan Các Nhóm API Auth & Register

| Nhóm | Endpoint | Method | Số TC | Yêu cầu nguồn / Chức năng |
|:---|:---|:---|:---|:---|
| **A. Login** | `/auth/login` | POST | 10 | Đăng nhập hệ thống (FR-10, UC-14) |
| **B. B2B Customer Onboarding** | `/customer-onboarding/register` | POST | 7 | Tự đăng ký doanh nghiệp B2B (Custom) |
| **B2. Core Directus Register** | `/users/register` | POST | 6 | Đăng ký user hệ thống mặc định (Core) |
| **C. Token Refresh** | `/auth/refresh` | POST | 4 | Làm mới access token (AD-05 §3.1) |
| **D. Logout** | `/auth/logout` | POST | 4 | Đăng xuất (AD-05 §3.1) |
| **E. Password Reset** | `/auth/password/request` + `/auth/password/reset` | POST | 5 | Quên & Khôi phục mật khẩu |

---

# A. LOGIN — `POST {{baseUrl}}/auth/login`

> **Spec:** [open.json dòng 153-232](file:///c:/Work/PathTech/ULink/open.json#L153-L232)
> **Yêu cầu bảo mật:** AD-07 §3 — "Đăng nhập thất bại trả lỗi chung; không lộ tồn tại tài khoản"

### Request Schema:

| Field | Type | Required | Mô tả |
|:---|:---|:---|:---|
| `email` | string | ✅ Có | Email đăng nhập |
| `password` | string | ✅ Có | Mật khẩu |
| `mode` | string | Không | `"json"` (mặc định) / `"cookie"` / `"session"` |
| `otp` | string | Không | Mã OTP (nếu bật MFA) |

---

## TC-01: Login Admin — Thành công
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@ulink.com",
  "password": "<từ file .env>"
}
```
**Expected:** `200 OK`
```json
{
  "data": {
    "access_token": "eyJhbGciOiJI...",
    "expires": 900,
    "refresh_token": "yuOJkjdPXMd..."
  }
}
```
**Checklist:**
- [ ] Status = `200`
- [ ] `data.access_token` — chuỗi JWT hợp lệ
- [ ] `data.expires` = `900` (giây = 15 phút)
- [ ] `data.refresh_token` — chuỗi không rỗng
- [ ] Dùng token → `GET /users/me` → trả về role Admin

---

## TC-02: Login Editor — Thành công
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "editor-rbac@example.com",
  "password": "editor-password-123"
}
```
**Expected:** `200 OK`
**Checklist:**
- [ ] `GET /users/me` → `role` = `e11b0e50-1010-410c-9999-000000000001` (Editor)

---

## TC-03: Login Sales — Thành công
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "sales-rbac@example.com",
  "password": "sales-password-123"
}
```
**Expected:** `200 OK`
**Checklist:**
- [ ] `GET /users/me` → `role` = `e11b0e50-2020-410c-9999-000000000002` (Sales)

---

## TC-04: Login Customer A — Thành công
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "customer-a-rbac@example.com",
  "password": "customer-a-password-123"
}
```
**Expected:** `200 OK`
**Checklist:**
- [ ] `GET /users/me` → `role` = `e11b0e50-3030-410c-9999-000000000003` (Customer)
- [ ] `GET /items/customers` → Chỉ thấy bản ghi Customer A (Row-Level Security)

---

## TC-05: Login Customer B — Thành công
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "customer-b-rbac@example.com",
  "password": "customer-b-password-123"
}
```
**Expected:** `200 OK`
**Checklist:**
- [ ] `role` = `e11b0e50-3030-410c-9999-000000000003` (Customer B)

---

## TC-06: Login — Sai Password
> **Bảo mật:** Đăng nhập thất bại trả lỗi **CHUNG** để chống rò rỉ thông tin
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "customer-a-rbac@example.com",
  "password": "wrong-password-123"
}
```
**Expected:** `401 Unauthorized`
```json
{
  "errors": [
    {
      "message": "Invalid user credentials.",
      "extensions": { "code": "INVALID_CREDENTIALS" }
    }
  ]
}
```
**Checklist:**
- [ ] Status = `401`
- [ ] Extension code = `"INVALID_CREDENTIALS"`
- [ ] Message chung chung — không báo "sai mật khẩu"
- [ ] KHÔNG có stack trace, KHÔNG có token

---

## TC-07: Login — Email Không Tồn Tại
> **Bảo mật:** Phải trả lỗi giống hệt trường hợp sai password để tránh Email Enumeration
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "khong-ton-tai@example.com",
  "password": "any-password"
}
```
**Expected:** `401 Unauthorized` (Response body giống hệt TC-06)
> [!CAUTION]
> Response phải **GIỐNG HỆT TC-06**! Nếu khác (ví dụ: trả về 404 hoặc báo "User not found") → lỗ hổng bảo mật mức **S1 Blocker**!

---

## TC-08: Login — Thiếu Email
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "password": "some-password"
}
```
**Expected:** `400 Bad Request` (extensions code: `INVALID_PAYLOAD`)

---

## TC-09: Login — Thiếu Password
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "customer-a-rbac@example.com"
}
```
**Expected:** `400 Bad Request`

---

## TC-10: Login — Body Rỗng
```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{}
```
**Expected:** `400 Bad Request` (KHÔNG được crash server / không trả lỗi 500)

---

# B. B2B CUSTOMER ONBOARDING — `POST {{baseUrl}}/customer-onboarding/register`

> **Ý nghĩa:** Đây là API custom nghiệp vụ cho phép khách tự đăng ký doanh nghiệp B2B.
> **Quy trình:** Tạo user (active) + tạo Customer record (inactive) + gửi welcome email.

### Request Schema:

| Field | Type | Required | Mô tả |
|:---|:---|:---|:---|
| `company_name` | string | ✅ Có | Tên doanh nghiệp/công ty khách hàng |
| `contact_name` | string | ✅ Có | Họ & tên người liên hệ đại diện |
| `email` | string | ✅ Có | Email đăng ký (dùng làm email đăng nhập) |
| `phone` | string | ✅ Có | Số điện thoại liên hệ |
| `password` | string | ✅ Có | Mật khẩu tài khoản |
| `confirm_password`| string | ✅ Có | Xác nhận mật khẩu |

---

## TC-11: Đăng ký B2B — Thành công (Đầy đủ thông tin)
```http
POST {{baseUrl}}/customer-onboarding/register
Content-Type: application/json

{
  "company_name": "ACME Vietnam Ltd",
  "contact_name": "Nguyen Van B2B",
  "email": "acme-onboarding-test@example.com",
  "phone": "0987654321",
  "password": "securepassword123",
  "confirm_password": "securepassword123"
}
```
**Expected:** `201 Created`
```json
{
  "data": {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "customer_id": 42,
    "status": "inactive"
  }
}
```
**Checklist:**
- [ ] Status = `201`
- [ ] Trả về `user_id` (UUID), `customer_id` (Integer), và `status` = `"inactive"`.
- [ ] Kiểm tra DB: User mới có role = Customer (`e11b0e50-3030-410c-9999-000000000003`) và `status` = `"active"`.
- [ ] Kiểm tra Mailpit: Có email gửi tới `acme-onboarding-test@example.com` với tiêu đề `[ULINK] Tài khoản đã được tạo`.
- [ ] Đăng nhập thử với email + password mới tạo → Login thành công (`200 OK`).

---

## TC-12: Đăng ký B2B — Thiếu trường bắt buộc (Ví dụ: `company_name`)
```http
POST {{baseUrl}}/customer-onboarding/register
Content-Type: application/json

{
  "contact_name": "Nguyen Van B2B",
  "email": "missing-company@example.com",
  "phone": "0987654321",
  "password": "securepassword123",
  "confirm_password": "securepassword123"
}
```
**Expected:** `422 Unprocessable Entity`
```json
{
  "error": "company_name is required."
}
```

---

## TC-13: Đăng ký B2B — Mật khẩu không khớp
```http
POST {{baseUrl}}/customer-onboarding/register
Content-Type: application/json

{
  "company_name": "ACME Vietnam Ltd",
  "contact_name": "Nguyen Van B2B",
  "email": "mismatch-pass@example.com",
  "phone": "0987654321",
  "password": "securepassword123",
  "confirm_password": "differentpassword123"
}
```
**Expected:** `422 Unprocessable Entity`
```json
{
  "error": "Passwords do not match."
}
```

---

## TC-14: Đăng ký B2B — Email đã tồn tại trong bảng `customers`
```http
POST {{baseUrl}}/customer-onboarding/register
Content-Type: application/json

{
  "company_name": "Duplicate Company",
  "contact_name": "Dup Customer",
  "email": "customer-a-rbac@example.com",
  "phone": "0900000001",
  "password": "password123",
  "confirm_password": "password123"
}
```
**Expected:** `409 Conflict`
```json
{
  "error": "Customer account already exists for customer-a-rbac@example.com."
}
```

---

## TC-15: Đăng ký B2B — Email đã tồn tại trong bảng `directus_users` nhưng không có trong `customers`
```http
POST {{baseUrl}}/customer-onboarding/register
Content-Type: application/json

{
  "company_name": "Duplicate User Co",
  "contact_name": "Dup User",
  "email": "admin@ulink.com",
  "phone": "0900000001",
  "password": "password123",
  "confirm_password": "password123"
}
```
**Expected:** `409 Conflict`
```json
{
  "error": "User account already exists for admin@ulink.com."
}
```

---

## TC-16: Đăng ký B2B — Thiếu email hoặc số điện thoại
```http
POST {{baseUrl}}/customer-onboarding/register
Content-Type: application/json

{
  "company_name": "Test Company",
  "contact_name": "Test Contact",
  "phone": "0123456789",
  "password": "password123",
  "confirm_password": "password123"
}
```
**Expected:** `422 Unprocessable Entity` (báo lỗi trường tương ứng)

---

## TC-17: Sau đăng ký B2B — Phân quyền của Customer vừa đăng ký
- Login bằng account mới tạo (`acme-onboarding-test@example.com`).
- Gọi `GET {{baseUrl}}/items/customers`:
  - **Expected:** Chỉ thấy đúng 1 dòng thông tin của chính mình (`customer_id` trùng khớp).
- Gọi `GET {{baseUrl}}/items/orders` (hoặc invoices):
  - **Expected:** Không có đơn hàng nào (mảng trống `[]`), không thể đọc đơn hàng của khách hàng khác.

---

# B2. CORE DIRECTUS REGISTER — `POST {{baseUrl}}/users/register`

> **Ý nghĩa:** Đây là API mặc định của Directus Core. Chỉ tạo bản ghi thô trong `directus_users` (Không tự động tạo liên kết sang `customers`).

### Request Schema:

| Field | Type | Required | Mô tả |
|:---|:---|:---|:---|
| `email` | string | ✅ Có | Email đăng ký |
| `password` | string | ✅ Có | Mật khẩu |
| `first_name` | string | Không | Tên |
| `last_name` | string | Không | Họ |
| `phone` | string | Không | Số điện thoại |

---

## TC-11b: Đăng ký Core — Thành công
```http
POST {{baseUrl}}/users/register
Content-Type: application/json

{
  "email": "new-core-user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```
**Expected:** `200 OK`
```json
{
  "data": {
    "id": "e8a719d3-d922-4876-b638-e6b77ad9f086",
    "email": "new-core-user@example.com"
  }
}
```

---

## TC-12b: Đăng ký Core — Tối thiểu (Chỉ gửi email & password)
```http
POST {{baseUrl}}/users/register
Content-Type: application/json

{
  "email": "minimal-core-user@example.com",
  "password": "password123"
}
```
**Expected:** `200 OK`

---

## TC-13b: Đăng ký Core — Email trùng lặp
```http
POST {{baseUrl}}/users/register
Content-Type: application/json

{
  "email": "admin@ulink.com",
  "password": "password123"
}
```
**Expected:** `400 Bad Request` hoặc `409 Conflict` (extensions code: `RECORD_NOT_UNIQUE`)

---

## TC-14b: Đăng ký Core — Thiếu Email
```http
POST {{baseUrl}}/users/register
Content-Type: application/json

{
  "password": "password123"
}
```
**Expected:** `400 Bad Request`

---

## TC-15b: Đăng ký Core — Thiếu Mật khẩu
```http
POST {{baseUrl}}/users/register
Content-Type: application/json

{
  "email": "no-pass-user@example.com"
}
```
**Expected:** `400 Bad Request`

---

## TC-16b: Đăng ký Core — Sai định dạng Email
```http
POST {{baseUrl}}/users/register
Content-Type: application/json

{
  "email": "not-an-email-format",
  "password": "password123"
}
```
**Expected:** `400 Bad Request`

---

# C. TOKEN REFRESH — `POST {{baseUrl}}/auth/refresh`

> **Spec:** [open.json dòng 234-302](file:///c:/Work/PathTech/ULink/open.json#L234-L302)

### Request Schema:

| Field | Type | Required | Mô tả |
|:---|:---|:---|:---|
| `refresh_token` | string | Không* | Refresh token từ login (*bắt buộc khi mode=json) |
| `mode` | string | Không | `"json"` (mặc định) / `"cookie"` / `"session"` |

---

## TC-18: Refresh Token — Thành công
```http
POST {{baseUrl}}/auth/refresh
Content-Type: application/json

{
  "refresh_token": "{{REFRESH_TOKEN}}",
  "mode": "json"
}
```
**Expected:** `200 OK`
```json
{
  "data": {
    "access_token": "eyJhbGciOiJI... <JWT MỚI>",
    "expires": 900,
    "refresh_token": "Gy-caJMpmGTA... <MỚI>"
  }
}
```
**Checklist:**
- [ ] Status = `200`
- [ ] `data.access_token` mới khác hoàn toàn token cũ
- [ ] `data.refresh_token` mới khác token cũ (được xoay vòng - Token Rotation)
- [ ] `data.expires` = `900`
- [ ] Dùng `access_token` mới truy cập `GET /users/me` thành công.

---

## TC-19: Refresh Token — Token sai
```http
POST {{baseUrl}}/auth/refresh
Content-Type: application/json

{
  "refresh_token": "fake-token-12345",
  "mode": "json"
}
```
**Expected:** `401 Unauthorized` (extensions code: `INVALID_TOKEN`)

---

## TC-20: Refresh Token — Token rỗng
```http
POST {{baseUrl}}/auth/refresh
Content-Type: application/json

{
  "refresh_token": "",
  "mode": "json"
}
```
**Expected:** `400 Bad Request` hoặc `401 Unauthorized`

---

## TC-21: Refresh Token — Dùng token cũ đã bị xoay (rotated)
> Sau TC-18, cố tình gửi lại `REFRESH_TOKEN` ban đầu.
```http
POST {{baseUrl}}/auth/refresh
Content-Type: application/json

{
  "refresh_token": "{{REFRESH_TOKEN_CU_DA_ROTATED}}",
  "mode": "json"
}
```
**Expected:** `401 Unauthorized`
**Checklist:**
- [ ] Hệ thống từ chối cấp token mới, đảm bảo cơ chế an toàn xoay vòng hoạt động đúng.

---

# D. LOGOUT — `POST {{baseUrl}}/auth/logout`

> **Spec:** [open.json dòng 304-342](file:///c:/Work/PathTech/ULink/open.json#L304-L342)

### Request Schema:

| Field | Type | Required | Mô tả |
|:---|:---|:---|:---|
| `refresh_token` | string | Không* | Refresh token cần vô hiệu (*bắt buộc khi mode=json) |
| `mode` | string | Không | `"json"` / `"cookie"` / `"session"` |

---

## TC-22: Logout — Thành công
```http
POST {{baseUrl}}/auth/logout
Content-Type: application/json

{
  "refresh_token": "{{REFRESH_TOKEN}}"
}
```
**Expected:** `204 No Content`
**Checklist:**
- [ ] Status = `204`

---

## TC-23: Sau Logout — Refresh Token bị vô hiệu hóa
```http
POST {{baseUrl}}/auth/refresh
Content-Type: application/json

{
  "refresh_token": "{{REFRESH_TOKEN_DA_LOGOUT}}",
  "mode": "json"
}
```
**Expected:** `401 Unauthorized`
**Checklist:**
- [ ] Không thể lấy token mới bằng refresh token đã logout.

---

## TC-24: Sau Logout — Access Token (JWT) cũ hoạt động thế nào?
> Đây là hành vi JWT stateless bình thường: vẫn hoạt động cho đến khi hết hạn (900s).
```http
GET {{baseUrl}}/users/me
Authorization: Bearer {{ACCESS_TOKEN_TRUOC_LOGOUT}}
```
**Expected:**
- Nếu gọi ngay lập tức → `200 OK` (chấp nhận được vì JWT stateless chưa expire).
- Nếu gọi sau 15 phút → `401 Unauthorized` (đã expire).

---

## TC-25: Logout — Token sai
```http
POST {{baseUrl}}/auth/logout
Content-Type: application/json

{
  "refresh_token": "invalid-token"
}
```
**Expected:** `204 No Content` hoặc `401 Unauthorized` (Tuyệt đối KHÔNG crash / không trả về 500).

---

# E. PASSWORD RESET

> **Spec:** [open.json dòng 344-417](file:///c:/Work/PathTech/ULink/open.json#L344-L417)

## E1: Request Reset — `POST {{baseUrl}}/auth/password/request`

### Request Schema:

| Field | Type | Required | Mô tả |
|:---|:---|:---|:---|
| `email` | string | ✅ Có | Email cần reset password |

---

## TC-26: Yêu cầu Reset — Thành công
```http
POST {{baseUrl}}/auth/password/request
Content-Type: application/json

{
  "email": "customer-a-rbac@example.com"
}
```
**Expected:** `204 No Content` (Body trống)
**Checklist:**
- [ ] Status = `204`
- [ ] Mailpit nhận được email khôi phục mật khẩu chứa đường link và token JWT sử dụng 1 lần.

---

## TC-27: Yêu cầu Reset — Email không tồn tại
> **Bảo mật:** Phải trả lỗi tương tự email tồn tại để tránh Email Enumeration (Dò quét email)
```http
POST {{baseUrl}}/auth/password/request
Content-Type: application/json

{
  "email": "khong-ton-tai@example.com"
}
```
**Expected:** `204 No Content` (Response body rỗng và status giống hệt TC-26)
> [!CAUTION]
> Response phải **GIỐNG HỆT TC-26**! Nếu hệ thống báo lỗi 404 hoặc "Email không tồn tại" → log lỗi bảo mật mức **S1 Blocker**!

---

## E2: Confirm Reset — `POST {{baseUrl}}/auth/password/reset`

### Request Schema:

| Field | Type | Required | Mô tả |
|:---|:---|:---|:---|
| `token` | string | ✅ Có | JWT token sử dụng 1 lần lấy từ email khôi phục |
| `password` | string | ✅ Có | Mật khẩu mới |

---

## TC-28: Xác nhận Reset — Thành công
```http
POST {{baseUrl}}/auth/password/reset
Content-Type: application/json

{
  "token": "<token_tu_email_Mailpit>",
  "password": "new-secure-password-456"
}
```
**Expected:** `204 No Content`
**Checklist:**
- [ ] Status = `204`
- [ ] Login bằng mật khẩu MỚI thành công (`200 OK`).
- [ ] Login bằng mật khẩu CŨ thất bại (`401 Unauthorized`).

---

## TC-29: Xác nhận Reset — Token sai/hết hạn
```http
POST {{baseUrl}}/auth/password/reset
Content-Type: application/json

{
  "token": "invalid-or-expired-token",
  "password": "new-password-123"
}
```
**Expected:** `401 Unauthorized`
**Checklist:**
- [ ] Mật khẩu cũ của tài khoản KHÔNG bị thay đổi.

---

## TC-30: Xác nhận Reset — Dùng lại token đã sử dụng
```http
POST {{baseUrl}}/auth/password/reset
Content-Type: application/json

{
  "token": "<token_da_dung_o_TC-28>",
  "password": "another-password-789"
}
```
**Expected:** `401 Unauthorized` (Token 1 lần dùng không được phép tái sử dụng).

---

# BẢNG TỔNG HỢP KẾT QUẢ KHI CHẠY TEST

| TC | Nhóm | Mô tả | Endpoint | Method | Status mong muốn | Kết quả |
|:---|:---|:---|:---|:---|:---|:---|
| 01 | Login | Admin OK | `/auth/login` | POST | `200` | ☐ |
| 02 | Login | Editor OK | `/auth/login` | POST | `200` | ☐ |
| 03 | Login | Sales OK | `/auth/login` | POST | `200` | ☐ |
| 04 | Login | Customer A OK | `/auth/login` | POST | `200` | ☐ |
| 05 | Login | Customer B OK | `/auth/login` | POST | `200` | ☐ |
| 06 | Login | Sai password | `/auth/login` | POST | `401` | ☐ |
| 07 | Login | Email không tồn tại | `/auth/login` | POST | `401` | ☐ |
| 08 | Login | Thiếu email | `/auth/login` | POST | `400` | ☐ |
| 09 | Login | Thiếu password | `/auth/login` | POST | `400` | ☐ |
| 10 | Login | Body rỗng | `/auth/login` | POST | `400` | ☐ |
| 11 | Register B2B | Đầy đủ thông tin | `/customer-onboarding/register` | POST | `201` | ☐ |
| 12 | Register B2B | Thiếu `company_name` | `/customer-onboarding/register` | POST | `422` | ☐ |
| 13 | Register B2B | Mật khẩu không khớp | `/customer-onboarding/register` | POST | `422` | ☐ |
| 14 | Register B2B | Email khách đã tồn tại | `/customer-onboarding/register` | POST | `409` | ☐ |
| 15 | Register B2B | Email user đã tồn tại | `/customer-onboarding/register` | POST | `409` | ☐ |
| 16 | Register B2B | Thiếu trường bắt buộc khác| `/customer-onboarding/register` | POST | `422` | ☐ |
| 17 | Register B2B | Phân quyền sau đăng ký | `/items/customers` | GET | `200` | ☐ |
| 11b| Register Core| Đầy đủ thông tin | `/users/register` | POST | `200` | ☐ |
| 12b| Register Core| Chỉ gửi email/password | `/users/register` | POST | `200` | ☐ |
| 13b| Register Core| Trùng lặp email | `/users/register` | POST | `400/409` | ☐ |
| 14b| Register Core| Thiếu email | `/users/register` | POST | `400` | ☐ |
| 15b| Register Core| Thiếu mật khẩu | `/users/register` | POST | `400` | ☐ |
| 16b| Register Core| Sai định dạng email | `/users/register` | POST | `400` | ☐ |
| 18 | Refresh | Token OK | `/auth/refresh` | POST | `200` | ☐ |
| 19 | Refresh | Token sai | `/auth/refresh` | POST | `401` | ☐ |
| 20 | Refresh | Token rỗng | `/auth/refresh` | POST | `400/401` | ☐ |
| 21 | Refresh | Token đã rotated | `/auth/refresh` | POST | `401` | ☐ |
| 22 | Logout | Thành công | `/auth/logout` | POST | `204` | ☐ |
| 23 | Logout | Refresh sau logout | `/auth/refresh` | POST | `401` | ☐ |
| 24 | Logout | Access token sau logout | `/users/me` | GET | `200*` | ☐ |
| 25 | Logout | Token sai | `/auth/logout` | POST | `204/401` | ☐ |
| 26 | Reset | Yêu cầu reset OK | `/auth/password/request` | POST | `204` | ☐ |
| 27 | Reset | Reset email không tồn tại | `/auth/password/request` | POST | `204` | ☐ |
| 28 | Reset | Xác nhận reset OK | `/auth/password/reset` | POST | `204` | ☐ |
| 29 | Reset | Reset token sai | `/auth/password/reset` | POST | `401` | ☐ |
| 30 | Reset | Reset token đã dùng | `/auth/password/reset` | POST | `401` | ☐ |
