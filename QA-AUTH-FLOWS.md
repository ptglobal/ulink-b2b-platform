# QA — Luồng Authentication ULINK B2B

> **Ngày cập nhật:** 2026-06-18  
> **URL Frontend:** http://192.168.1.36:3000  
> **URL Directus:** http://192.168.1.36:8055  
> **Mailpit (xem email):** http://192.168.1.36:8025  

---

## Tài khoản test

| Email | Password | Role |
|-------|----------|------|
| admin@ulink.com | (hỏi dev) | Admin |
| customer@ulink.com | (hỏi dev) | Customer |

---

## 1. Đăng nhập (Login)

**URL:** `/vi/login` hoặc `/en/login`

### Flow:
1. Nhập email + password → Nhấn "Đăng nhập"
2. Thành công → redirect về trang chủ `/`
3. Thất bại → hiện thông báo lỗi **màu đỏ**

### Test cases:

| # | Hành động | Kết quả mong đợi |
|---|-----------|------------------|
| 1.1 | Nhập đúng email + password | Redirect về `/` |
| 1.2 | Nhập sai password | Hiện lỗi "Email hoặc mật khẩu không đúng" (màu đỏ) |
| 1.3 | Nhập email không tồn tại | Hiện lỗi "Email hoặc mật khẩu không đúng" (màu đỏ) |
| 1.4 | Để trống email | Hiện validation "Vui lòng nhập email" |
| 1.5 | Để trống password | Hiện validation "Vui lòng nhập mật khẩu" |
| 1.6 | Nhập email sai format (abc@) | Hiện validation "Email không hợp lệ" |
| 1.7 | Nhấn icon mắt | Toggle hiện/ẩn password |
| 1.8 | Nhấn "Quên mật khẩu?" | Navigate đến `/forgot-password` |
| 1.9 | Nhấn "Đăng ký ngay" | Navigate đến `/register` |

---

## 2. Đăng ký (Register) — OTP

**URL:** `/vi/register` hoặc `/en/register`

### Flow:
1. Nhập email → Nhấn "Gửi mã OTP"
2. Hệ thống gửi OTP 6 số về email (kiểm tra Mailpit)
3. Nhập OTP → Xác thực thành công
4. Điền thông tin (password, tên, v.v.) → Hoàn tất đăng ký

### Test cases:

| # | Hành động | Kết quả mong đợi |
|---|-----------|------------------|
| 2.1 | Nhập email mới + nhận OTP | Email OTP gửi thành công (check Mailpit) |
| 2.2 | Nhập đúng OTP 6 số | Chuyển sang bước tiếp theo |
| 2.3 | Nhập sai OTP | Hiện lỗi "Mã OTP không đúng" (màu đỏ) |
| 2.4 | Nhập OTP hết hạn (>10 phút) | Hiện lỗi "Mã OTP đã hết hạn" |
| 2.5 | Nhấn "Gửi lại mã" trước 60s | Nút bị disable, hiện countdown |
| 2.6 | Nhấn "Gửi lại mã" sau 60s | Gửi OTP mới thành công |
| 2.7 | Nhập OTP sai 5 lần | Bị khóa, phải chờ hoặc request OTP mới |
| 2.8 | Đăng ký email đã tồn tại | Hiện lỗi phù hợp |

---

## 3. Quên mật khẩu (Forgot Password) — Link qua email

**URL:** `/vi/forgot-password` hoặc `/en/forgot-password`

### Flow:
1. Nhập email → Nhấn "Gửi link đặt lại mật khẩu"
2. Hệ thống gửi email chứa link reset (kiểm tra Mailpit)
3. Hiện thông báo "Kiểm tra email của bạn"
4. User click link trong email → mở `/reset-password?token=XXX`

### Test cases:

| # | Hành động | Kết quả mong đợi |
|---|-----------|------------------|
| 3.1 | Nhập email có tài khoản | Hiện thông báo thành công + email gửi (check Mailpit) |
| 3.2 | Nhập email không tồn tại | Vẫn hiện thông báo thành công (chống enumeration) — KHÔNG báo "email không tồn tại" |
| 3.3 | Để trống email | Validation "Vui lòng nhập email" |
| 3.4 | Kiểm tra email trong Mailpit | Email có link, template đẹp, branded ULink |
| 3.5 | Click link trong email | Mở trang `/reset-password?token=...` |
| 3.6 | Nhấn "Quay lại đăng nhập" | Navigate về `/login` |

---

## 4. Đặt lại mật khẩu (Reset Password) — Token từ email

**URL:** `/vi/reset-password?token=XXX`

### Flow:
1. User đến trang này từ link trong email (có `?token=`)
2. Nhập mật khẩu mới + xác nhận → Nhấn "Đặt lại mật khẩu"
3. Thành công → hiện thông báo + link về login

### Test cases:

| # | Hành động | Kết quả mong đợi |
|---|-----------|------------------|
| 4.1 | Truy cập với token hợp lệ + đặt password mới | Thành công, hiện thông báo |
| 4.2 | Truy cập KHÔNG có `?token` | Hiện thông báo "Link không hợp lệ" + link đến `/forgot-password` |
| 4.3 | Dùng token đã hết hạn (>15 phút) | Hiện lỗi "Link đã hết hạn" |
| 4.4 | Dùng token đã sử dụng (lần 2) | Hiện lỗi "Link đã được sử dụng" |
| 4.5 | Password < 8 ký tự | Validation lỗi |
| 4.6 | Password không có chữ hoa | Validation lỗi |
| 4.7 | Password không có số | Validation lỗi |
| 4.8 | Confirm password không khớp | Validation "Mật khẩu không khớp" |
| 4.9 | Đặt password thành công → login bằng password mới | Đăng nhập OK |
| 4.10 | Sau đổi password, session cũ bị clear | Các phiên khác bị đăng xuất (AC04) |

---

## 5. Đổi mật khẩu (Change Password) — Link qua email

**URL:** `/vi/change-password` hoặc `/en/change-password`

### Flow:
1. Nhập email → Nhấn "Gửi link đổi mật khẩu"
2. Hệ thống gửi email chứa link (giống forgot password)
3. Hiện thông báo "Kiểm tra email của bạn"
4. User click link → mở `/reset-password?token=XXX` → đặt password mới

### Test cases:

| # | Hành động | Kết quả mong đợi |
|---|-----------|------------------|
| 5.1 | Nhập email có tài khoản | Thông báo thành công + email gửi |
| 5.2 | Nhập email không tồn tại | Vẫn hiện thông báo thành công (chống enumeration) |
| 5.3 | Click link trong email | Mở `/reset-password?token=...` |
| 5.4 | Đặt password mới thành công | Login bằng password mới OK |
| 5.5 | Token hết hạn | Lỗi "Link đã hết hạn" |
| 5.6 | Token đã dùng | Lỗi "Link đã được sử dụng" |

---

## 6. Google SSO (nếu đã cấu hình)

**URL:** Nút "Đăng nhập bằng Google" trên trang login/register

### Flow:
1. Nhấn nút Google → redirect sang Google OAuth
2. Chọn tài khoản Google → đồng ý
3. Redirect về `/auth/callback` → tự đăng nhập → redirect về `/`

### Test cases:

| # | Hành động | Kết quả mong đợi |
|---|-----------|------------------|
| 6.1 | Đăng nhập Google lần đầu | Tạo tài khoản mới + đăng nhập |
| 6.2 | Đăng nhập Google (đã có tài khoản) | Đăng nhập bình thường |
| 6.3 | Cancel ở màn hình Google | Quay lại login, không lỗi |

---

## 7. Kiểm tra chung (Cross-cutting)

| # | Hành động | Kết quả mong đợi |
|---|-----------|------------------|
| 7.1 | Chuyển ngôn ngữ VI ↔ EN | Tất cả text + error messages đổi ngôn ngữ |
| 7.2 | Responsive — mobile | Form hiển thị đúng, hero panel ẩn |
| 7.3 | Error messages | Tất cả đều **màu đỏ** (không phải xanh) |
| 7.4 | Auth hero panel (desktop) | Có layer #969BA2 ở dưới cùng, features nằm trên đó |
| 7.5 | Truy cập trang protected khi chưa login | Redirect về `/login` |
| 7.6 | Rate limiting | Gửi quá 50 request/phút → bị chặn |

---

## Email Templates — Kiểm tra trong Mailpit

**Mailpit URL:** http://192.168.1.36:8025

| Flow | Subject email | Nội dung cần kiểm tra |
|------|--------------|----------------------|
| Register OTP | Mã xác thực ULink | Có mã 6 số, branded, hết hạn 10 phút |
| Forgot Password | Đặt lại mật khẩu | Có link reset, branded ULink, hết hạn 15 phút |
| Change Password | Đổi mật khẩu | Có link reset, branded ULink, hết hạn 15 phút |

### Checklist email template:
- [ ] Logo ULink hiển thị
- [ ] Màu sắc đúng brand (xanh #1769E2, navy #1A2D49)
- [ ] Link hoạt động, trỏ đúng URL frontend
- [ ] Footer có thông tin công ty
- [ ] Không bị vào spam (nếu test với mail thật)

---

## Ghi chú cho tester

1. **Mailpit** là mail server local — tất cả email gửi ra đều nằm ở đây, không gửi ra internet
2. **Token hết hạn sau 15 phút** — test expired token bằng cách chờ 15 phút hoặc nhờ dev chỉnh TTL
3. **Chống enumeration**: forgot-password và change-password luôn trả "thành công" dù email có tồn tại hay không (kiểm tra bằng cách xem Mailpit có nhận email không)
4. **LAN access**: tester trên cùng WiFi truy cập bằng IP `192.168.1.36:3000`
5. **OTP chỉ còn dùng cho Register** — forgot/change password đã chuyển sang link
