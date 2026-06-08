# Skill 02 — Đặc tả Chức năng & Use Case | Nguồn: ULINK-AD-02

> Tài liệu này mô tả **hệ thống hành xử như thế nào** theo từng phân hệ. Mỗi FR (skill 01) được triển khai thành tác nhân, luồng, quy tắc nghiệp vụ (BR) và use case (UC). Khi code một luồng, ĐỌC use case tương ứng ở đây trước.

## 1. Tác nhân (Actors)

| Tác nhân | Loại | Mục tiêu |
|---|---|---|
| **Khách (Visitor)** | Công khai, ẩn danh | Khám phá SP, tải phiếu kỹ thuật, yêu cầu mẫu, gửi RFQ |
| **Khách hàng (Customer)** | Công khai, đã xác thực | Theo dõi đơn/giao hàng/công nợ của mình; đặt lại; gửi RFQ khi đăng nhập |
| **Biên tập (Editor)** | Nhân sự (Directus) | Tạo, dịch, publish nội dung |
| **Kinh doanh (Sales)** | Nhân sự (Directus) | Quản lý RFQ, đơn, hóa đơn, giao hàng, hồ sơ khách |
| **Quản trị (Admin)** | Nhân sự (Directus) | Quản trị users, roles, settings, SEO, publish; toàn quyền |

## 2. Bảng tổng quan 22 Use Case

| UC | Use case | Tác nhân chính | FR |
|---|---|---|---|
| UC-01 | Duyệt trang chủ và điều hướng | Visitor | FR-01 |
| UC-02 | Xem một Cụm vùng | Visitor | FR-02 |
| UC-03 | Duyệt danh mục sản phẩm | Visitor | FR-03 |
| **UC-04** | **Tìm SKU (có cache)** | Visitor | FR-04 |
| UC-05 | Xem chi tiết SP & tải TDS/MSDS | Visitor | FR-05 |
| UC-06 | Yêu cầu mẫu sản phẩm | Visitor | FR-05 |
| UC-07 | Lọc sản phẩm theo ngành | Visitor | FR-06 |
| UC-08 | Dùng Trung tâm Tài nguyên / Tải | Visitor | FR-07 |
| UC-09 | Thêm hàng bằng nhập SKU | Visitor / Customer | FR-08 |
| UC-10 | Tải số lượng SKU hàng loạt | Visitor / Customer | FR-08 |
| UC-11 | Xem lại giỏ RFQ | Visitor / Customer | FR-08 |
| **UC-12** | **Gửi RFQ** | Visitor / Customer | FR-09 |
| UC-13 | Quản lý RFQ theo vòng đời | Sales | FR-09 |
| **UC-14** | **Đăng ký / đăng nhập Cổng** | Customer | FR-10 |
| UC-15 | Xem dashboard Cổng | Customer | FR-11 |
| **UC-16** | **Xem lịch sử đơn & chi tiết** | Customer | FR-12 |
| UC-17 | Xem lịch giao hàng | Customer | FR-13 |
| UC-18 | Xem công nợ | Customer | FR-14 |
| **UC-19** | **Đặt lại từ đơn cũ** | Customer | FR-15 |
| **UC-20** | **Quản lý nội dung (CRUD + publish)** | Editor / Admin | FR-16, FR-18 |
| UC-21 | Quản lý dữ liệu cổng | Sales / Admin | FR-12–15 |
| UC-22 | Chuyển ngôn ngữ | Bất kỳ | FR-17 |

> **UC-12 / UC-13** (luồng đặt hàng) mang tiêu chuẩn tin cậy cao nhất: **NFR-10 — không lỗi Nghiêm trọng (S1)**.

## 3. Đặc tả theo phân hệ

### 3.1. Trang chủ (FR-01)
Các khối (CMS điều khiển, sắp xếp được): Hero banner + CTA, Giải pháp lõi, Giải pháp theo ngành, Đối tác, Case study, teaser Tài nguyên, CTA Quick-RFQ, tín hiệu tin cậy, hỗ trợ nhanh.
- **BR-01** chỉ render mục đã publish · **BR-02** thứ tự khối điều khiển trong CMS · **BR-03** CTA chính dẫn tới Quick Order.
- Nghiệm thu: render trong ngân sách hiệu năng (NFR-01); mọi khối được dịch; CTA tới được Quick Order.

### 3.2. Cụm vùng (FR-02)
Luồng: danh sách hub → chi tiết hub. Chi tiết: SLA giao hàng, năng lực kho, đội kỹ thuật, tổng quan cụm, vị trí/tọa độ, thư viện ảnh.
- Dữ liệu: `regional_hubs` — 5 hub: Đông Văn 4, Bắc Thăng Long, Bắc Ninh, Hưng Yên, Hải Phòng.

### 3.3. Giải pháp / Sản phẩm (FR-03, FR-04, FR-05)
Luồng:
- **Duyệt danh mục** — Cleanroom (Găng tay, Khăn lau, Băng keo, Chống tĩnh điện) và Packaging (Túi PE/OPP, Màng co, Cách nhiệt, Phụ trợ).
- **Tìm SKU** — gợi ý/từ khóa; phân giải qua `/api/sku` (<50 ms khi hit).
- **Chi tiết SP** — Thông số kỹ thuật, Tải TDS/MSDS, Yêu cầu mẫu, Thêm vào giỏ RFQ.
- **BR-04** ẩn SP chưa publish · **BR-05** tải TDS/MSDS bị chặn theo status · **BR-06** "Thêm vào giỏ" = giỏ RFQ, KHÔNG checkout.

### 3.4. Giải pháp theo Ngành (FR-06)
Lọc theo Điện tử, Dược, Mỹ phẩm, F&B. Trang ngành liên kết chéo tới SP liên quan (**m2m `products ↔ industries`**).

### 3.5. Trung tâm Tài nguyên (FR-07)
Tài liệu Kỹ thuật, Chứng nhận ISO, Case study, Blog & Tin, Trung tâm Tải — lọc theo loại và ngôn ngữ; CMS quản lý + được dịch.

### 3.6. Quick Order / RFQ (FR-08, FR-09)
Luồng: Nhập SKU (qua `/api/sku`) → Tải hàng loạt (dán/CSV dạng `sku,qty`) → Giỏ RFQ → Gửi (liên hệ + công ty + dòng hàng → `rfq_requests` status `new`, có chống spam, hiển thị xác nhận).
- **BR-07** gửi định tuyến tới Sales · **BR-08** bắt buộc chống spam (honeypot + Turnstile + rate-limit) · **BR-09** không lỗi Nghiêm trọng (NFR-10).

### 3.7. Cổng B2B (FR-10–15)
Nguồn dữ liệu: CMS quản lý (ADR-0003); đồng bộ ERP tương lai.

| Tính năng | Hành vi | Dữ liệu |
|---|---|---|
| Đăng nhập/Đăng ký | Xác thực Directus; gắn `customers` | `directus_users`, `customers` |
| Dashboard | Tổng hợp đơn, công nợ, giao hàng sắp tới | tổng hợp |
| Lịch sử đơn | Danh sách + chi tiết của chính khách (theo dòng) | `orders`, `order_items` |
| Lịch giao hàng | Đợt sắp tới/trễ của đơn của mình | `deliveries` |
| Công nợ | Hóa đơn, số dư, hạn thanh toán | `invoices` |
| Đặt lại | Sao chép dòng hàng đơn cũ vào giỏ RFQ | dẫn xuất |

- **BR-10** khách chỉ thấy bản ghi của mình qua bộ lọc `customer.user = $CURRENT_USER` · **BR-11** Sales/Admin quản lý mọi bản ghi qua CMS.

### 3.8. Quản trị CMS — 17 phân hệ (FR-16, FR-18, FR-19)
CRUD cho: Hero Banner, Đối tác, Danh mục SP, SKU, Chi tiết SP, Tải TDS/MSDS, Cụm vùng, Blog & Tin, Chứng nhận ISO, Trung tâm Tải, SEO Metadata, Thư viện Media, Người dùng & Quyền, RFQ, Đa ngôn ngữ VI/EN/JP, Publish/Unpublish, Vai trò người dùng. Phần lớn là tính năng sẵn có của Directus.

### 3.9. Giới thiệu ULink (FR-20)
Trang: Tổng quan Công ty, Năng lực Lõi, Phát triển Bền vững, Tuyển dụng, Liên hệ (form chống spam → ghi `contact_messages`/lead).

## 4. Use case chi tiết (luồng then chốt)

### UC-04 — Tìm SKU (có cache)
- **Tác nhân**: Visitor / Customer. **Tiền điều kiện**: SKU đã publish; Redis sẵn sàng.
- **Luồng chính**: 1) Nhập mã. 2) FE gọi `GET /api/sku/{code}`. 3) Cache hit → <50 ms. 4) Hiển thị SKU/SP khớp + action "Thêm vào RFQ".
- **Luồng thay thế**: 3a. Cache miss → handler đọc Directus 1 lần, nạp Redis, trả về.
- **Ngoại lệ**: 4a. Mã không tồn tại → 404 `not_found`; UI hiển thị "không tìm thấy" thân thiện.
- **Hậu điều kiện**: thêm SKU vào giỏ RFQ. **Quy tắc**: BR-04, BR-05; NFR-02.

### UC-12 — Gửi RFQ
- **Tác nhân**: Visitor / Customer. **Tiền điều kiện**: ≥1 dòng hàng hợp lệ trong giỏ.
- **Luồng chính**: 1) Xem lại dòng hàng. 2) Nhập công ty + liên hệ. 3) Vượt chống spam (honeypot + Turnstile). 4) FE `POST /api/rfq`. 5) Hệ thống kiểm tra + lưu `rfq_requests` status `new`. 6) Thông báo Sales; hiển thị xác nhận.
- **Luồng thay thế**: 2a. Customer đã xác thực → điền sẵn từ `customers`.
- **Ngoại lệ**: 4a. Kiểm tra thất bại → 422 `missing_fields`. 5a. Lưu thất bại → 502 `submit_failed` (giữ nguyên giỏ). 3a. Vượt rate limit → 429 `rate_limited`.
- **Hậu điều kiện**: tồn tại RFQ cho Sales; KHÔNG thanh toán (ADR-0008). **Quy tắc**: BR-06–09; NFR-07, NFR-10.

### UC-14 — Đăng ký / đăng nhập Cổng
- **Tác nhân**: Customer. **Tiền điều kiện**: tồn tại `customers` hoặc cho phép tự đăng ký.
- **Luồng chính**: 1) Mở `/portal`. 2) Gửi thông tin đăng nhập. 3) Directus xác thực + cấp JWT. 4) Phiên gắn `customers`. 5) Tải dashboard.
- **Ngoại lệ**: 3a. Sai thông tin → lỗi chung; không tạo phiên. 2a. Email chưa xác minh → nhắc xác minh.
- **Quy tắc**: BR-10; NFR-06 (truy cập theo dòng).

### UC-16 — Xem lịch sử đơn & chi tiết
- **Luồng chính**: 1) Mở Lịch sử đơn. 2) Liệt kê đơn của chính khách (phân trang). 3) Mở đơn. 4) Hiển thị dòng hàng, hub, trạng thái, tổng tiền.
- **Ngoại lệ**: 2a. Không có đơn → trạng thái rỗng được thiết kế.
- **Quy tắc**: BR-10; mọi truy vấn danh sách đều phân trang.

### UC-19 — Đặt lại từ đơn cũ
- **Luồng chính**: 1) Từ một đơn, chọn Đặt lại. 2) Sao chép dòng hàng vào giỏ RFQ mới. 3) Khách điều chỉnh số lượng. 4) Gửi RFQ (UC-12).
- **Ngoại lệ**: 2a. SKU không còn publish → đánh dấu và bỏ qua kèm thông báo.
- **Quy tắc**: BR-04 (chỉ publish); dùng lại quy tắc UC-12.

### UC-20 — Quản lý nội dung (CRUD + publish)
- **Luồng chính**: 1) Nhân sự sửa mục trong Directus. 2) Cung cấp bản dịch VI/EN/JP. 3) Đặt `status = published`. 4) Directus Flow bắn webhook. 5) Next.js revalidate ISR + làm nóng cache SKU Redis.
- **Ngoại lệ**: 3a. Lỗi kiểm tra chặn publish; 4a. webhook lỗi → thử lại + ghi log.
- **Hậu điều kiện**: trang công khai phản ánh thay đổi KHÔNG cần redeploy. **Quy tắc**: BR-01; FR-18; i18n.

## 5. Quy tắc xuyên suốt (cross-cutting)
- **i18n**: mọi trang công khai có VI/EN/JP; locale là phân đoạn URL đầu tiên; hreflang cho mọi locale + x-default.
- **Publish**: chỉ nội dung đã publish mới công khai; nháp/lưu trữ bị ẩn.
- **SEO**: mỗi trang có metadata CMS điều khiển + JSON-LD.
- **Lỗi & rỗng**: trạng thái rỗng/lỗi thân thiện ở mọi nơi; KHÔNG lộ stack trace.
- **Phân trang**: mọi truy vấn danh sách đều có `limit`.

## 6. Danh mục Quy tắc Nghiệp vụ (BR) — bắt buộc hiện thực

| BR | Quy tắc |
|---|---|
| **BR-01** | Chỉ mục `status = published` mới hiển thị công khai |
| **BR-02** | Thứ tự khối trang chủ do CMS điều khiển |
| **BR-03** | CTA chính trang chủ dẫn tới Quick Order |
| **BR-04** | SP/SKU chưa publish bị ẩn khỏi duyệt, tìm kiếm và đặt lại |
| **BR-05** | Tải TDS/MSDS bị chặn theo status của tài liệu |
| **BR-06** | "Thêm vào giỏ" luôn là giỏ RFQ; KHÔNG checkout/thanh toán |
| **BR-07** | RFQ đã gửi định tuyến tới Sales; vòng đời new → quoted → won/lost |
| **BR-08** | Thao tác ghi công khai cần honeypot + Turnstile + rate-limit theo IP |
| **BR-09** | KHÔNG lỗi Nghiêm trọng (S1) trên luồng RFQ/Đơn khi phát hành (NFR-10) |
| **BR-10** | Khách chỉ đọc đơn/hóa đơn/giao hàng của chính mình (theo dòng) |
| **BR-11** | Sales/Admin quản lý mọi dữ liệu cổng qua bản quản trị Directus |

## Checklist khi code một use case
- [ ] Đã map đúng tác nhân và FR?
- [ ] Đã hiện thực luồng chính + luồng thay thế + ngoại lệ (mã lỗi đúng)?
- [ ] Đã áp dụng mọi BR liên quan?
- [ ] Trạng thái rỗng/lỗi được thiết kế?
- [ ] Luồng RFQ/Đơn (UC-12/13/16): đảm bảo zero-critical (NFR-10)?
