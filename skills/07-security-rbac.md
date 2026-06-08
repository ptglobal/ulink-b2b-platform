# Skill 07 — Thiết kế Bảo mật & Phân quyền (RBAC) | Nguồn: ULINK-AD-07

> Kiểm soát bảo mật là **ràng buộc luôn bật**, không phải tính năng tùy chọn. Mọi route/collection/form phải tuân thủ skill này.

## 1. Mục tiêu và nguyên tắc bảo mật
- **Bảo mật**: khách KHÔNG BAO GIỜ đọc được đơn/hóa đơn/giao hàng của khách khác.
- **Đặc quyền tối thiểu**: mỗi vai trò chỉ giữ quyền cần thiết; rà soát trước go-live.
- **Phòng thủ nhiều lớp**: kiểm tra đầu vào + RBAC + lọc theo dòng + gia cố truyền tải + rate-limit xếp lớp.
- **Không lộ bí mật**: token quản trị và secret máy chủ KHÔNG BAO GIỜ tới trình duyệt.
- **Khả kiểm toán**: hành động đặc quyền được ghi log (nhật ký hoạt động Directus).

## 2. Xác thực (Authentication)
- Khách hàng xác thực qua Directus (JWT); phiên/refresh theo mặc định Directus.
- Admin / Editor / Sales xác thực vào app quản trị Directus.
- Ghi phía máy chủ (route handler) dùng `DIRECTUS_TOKEN` giới hạn; KHÔNG BAO GIỜ gửi ra client.
- Đăng nhập thất bại trả **lỗi chung**; KHÔNG lộ tồn tại tài khoản.

## 3. Phân quyền (RBAC) — 4 vai trò

| Vai trò | Năng lực tóm tắt |
|---|---|
| **Admin** | Toàn hệ thống: mọi collection, users, roles, settings, SEO, publish |
| **Editor** | CRUD nội dung + publish/unpublish; KHÔNG quản trị users/roles |
| **Sales** | CRUD `rfq_requests`, `orders`, `invoices`, `deliveries`, `customers`; đọc nội dung |
| **Customer** | Truy cập app đã xác thực; đọc theo dòng đơn/hóa đơn/giao hàng của chính mình |

### 3.1. Phân quyền theo dòng (row-level)
```json
// orders / invoices / deliveries (deliveries qua order -> customer)
{ "customer": { "user": { "_eq": "$CURRENT_USER" } } }

// customers: khách chỉ đọc/sửa bản ghi của chính mình
{ "user": { "_eq": "$CURRENT_USER" } }
```
> Admin và Sales quản lý mọi bản ghi qua bản quản trị Directus sinh tự động; KHÔNG xây hậu trường riêng (BR-11).

## 4. Phân loại dữ liệu và truy cập

| Lớp | Ví dụ | Quy tắc truy cập |
|---|---|---|
| **Công khai** | Sản phẩm, hub, blog, chứng nhận đã publish | Role public, chỉ đọc, chỉ đã publish |
| **Nội bộ** | Bản nháp, cấu hình SEO, thư viện media | Editor/Admin |
| **Mật — của khách** | `orders`, `invoices` (công nợ), `deliveries` | Theo dòng: chủ sở hữu + Sales/Admin |
| **Bí mật** | Token, thông tin CSDL, API key | Chỉ env phía máy chủ; KHÔNG vào client/VCS |

## 5. Truyền tải và HTTP headers
- **HTTPS toàn bộ** — Let's Encrypt trên VPS, TLS trên Vercel; bật **HSTS**.
- **Security header**:
  - `Content-Security-Policy` (cho phép self + origin CDN/media)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - Chống nhúng frame (`X-Frame-Options` / `frame-ancestors`)
- **CORS** giới hạn theo origin của site ở production.

## 6. Kiểm tra đầu vào và chống spam
- **Kiểm tra mọi đầu vào ngoài bằng `zod`, phía máy chủ, trước khi dùng.**
- Thao tác ghi công khai (RFQ, liên hệ): **honeypot + Cloudflare Turnstile + rate-limit theo IP bằng Redis (cửa sổ trượt)** (BR-08).
- Chỉ truy vấn **tham số hóa/SDK** — KHÔNG SQL chuỗi thô; Directus xử lý escaping.
- Phong bì lỗi đồng nhất; KHÔNG lộ chi tiết nội bộ hay stack trace.

## 7. Quản lý bí mật (secrets)
- Mọi bí mật nằm trong biến môi trường (`.env`, secret của Vercel/host); `.env*` bị git ignore.
- Biến **chỉ-máy-chủ** ở lại phía máy chủ; chỉ `NEXT_PUBLIC_*` lộ ra trình duyệt.
- Xoay vòng `DIRECTUS_KEY`/`DIRECTUS_SECRET`, mật khẩu CSDL/admin, token khi bàn giao và khi nghi rò rỉ.

## 8. Bảo mật tệp và tải lên
- PDF TDS/MSDS và ảnh do Directus Files xử lý; **kiểm tra loại và kích thước** khi tải lên.
- Phục vụ media từ origin media; **tải tài liệu bị chặn tôn trọng `status`** (BR-05).

## 9. Kiểm toán và đặc quyền tối thiểu
- Mỗi vai trò nhận tối thiểu quyền cần thiết; rà soát quyền trước go-live.
- Nhật ký hoạt động Directus lưu vết các thay đổi đặc quyền.
- Khách A KHÔNG đọc được dữ liệu của khách B — kiểm chứng tường minh (§11).

## 10. Mô hình mối đe dọa và biện pháp

| Mối đe dọa | Biện pháp |
|---|---|
| Hỏng kiểm soát truy cập | RBAC + lọc theo dòng; rà soát quyền trước go-live; kiểm thử chéo tài khoản |
| Tiêm (Injection) | Kiểm tra `zod`; chỉ truy vấn tham số hóa/SDK; không SQL thô |
| XSS | Mã hóa output React; làm sạch rich text; CSP nghiêm ngặt |
| Lộ bí mật | Biến chỉ-máy-chủ; token quản trị không ở client; `.env` git ignore |
| Spam / lạm dụng / DoS nhẹ | Honeypot + Turnstile + rate-limit Redis trên ghi công khai |
| Chặn bắt truyền tải | HTTPS toàn bộ + HSTS; cookie an toàn |
| Leo thang đặc quyền | Đặc quyền tối thiểu; rà soát định kỳ; nhật ký hoạt động |

## 11. Kế hoạch kiểm thử bảo mật (chạy trước go-live)
- **Diễn tập vai trò** — mỗi vai trò chỉ thấy phần được phép; Editor không quản trị users; Sales không đổi vai trò.
- **Kiểm thử chéo tài khoản** — Khách A xác thực và KHÔNG đọc được đơn/hóa đơn/giao hàng của Khách B.
- **Quét truyền tải** — kiểm chứng HTTPS + HSTS + security header (SSL Labs / quét header).
- **Kiểm thử flood chống spam** — honeypot, Turnstile, rate-limit chặn flood RFQ tự động.
- **Kiểm tra bí mật** — không bí mật nào lộ trong bundle client, log hay repository.

> **Cổng kiểm soát**: Kiểm chứng bảo mật là một phần của Định nghĩa Hoàn thành operator-green, lặp lại trước go-live; kết quả ghi trong bộ chứng cứ UAT.

## Checklist bảo mật khi code
- [ ] Collection cổng có row-level filter `$CURRENT_USER` (NFR-06, BR-10)?
- [ ] Đầu vào ngoài được `zod` kiểm tra phía server?
- [ ] Ghi công khai có honeypot + Turnstile + rate-limit (BR-08)?
- [ ] `DIRECTUS_TOKEN` và secrets chỉ ở server, không vào bundle client?
- [ ] Tải tài liệu tôn trọng `status` (BR-05)?
- [ ] Lỗi không lộ stack trace / không tiết lộ tồn tại tài khoản?
- [ ] Security header + CORS + HSTS đã cấu hình?
- [ ] Mỗi vai trò chỉ có đặc quyền tối thiểu?
