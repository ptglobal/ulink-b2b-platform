# KẾ HOẠCH KIỂM THỬ DỰ ÁN ULINK B2B (8 TUẦN)
**Phạm vi:** 1 QA Engineer (Tester)
**Phiên bản:** v1.0
**Mục tiêu:** Đảm bảo Zero-critical bugs (không có lỗi nghiêm trọng) trên luồng kinh doanh cốt lõi khi Go-live, thực hiện song song việc test tự động hóa cơ bản, test API và test thủ công.

---

## 1. Chiến lược Kiểm thử (Testing Strategy)

Do nguồn lực cực kỳ giới hạn (1 Tester), dự án áp dụng chiến lược **Kiểm thử ưu tiên rủi ro (Risk-based Testing)** kết hợp kiểm thử lai (Hybrid Testing).

### 1.1. Phân bổ phương pháp Kiểm thử
- **Automation Testing (Playwright):** Dành cho các luồng cốt lõi tốn nhiều thời gian lặp đi lặp lại.
  - Xác thực người dùng (Login, Register).
  - Tìm kiếm SKU, Thêm vào giỏ Quick Order.
  - Gửi yêu cầu RFQ thành công.
- **API Testing (Postman/Insomnia):** Do Dev chỉ viết Unit Test, QA phải đảm bảo API hoạt động đúng trước khi tích hợp UI.
  - Tập trung vào các API tuỳ biến: `GET /api/sku/{code}` (đảm bảo phản hồi <50ms) và `POST /api/rfq` (đảm bảo chặn spam Turnstile/Rate-limit hoạt động).
  - Test các luồng CRUD của Directus API (đặc biệt là phân quyền dữ liệu RBAC).
- **Manual Testing:** UI/UX, giao diện đa ngôn ngữ, và các chức năng phân hệ CMS, Quản trị cổng B2B.

### 1.2. Trọng tâm Kiểm thử (Priorities)
- **P1 (Ưu tiên Cao nhất):** Mọi luồng liên quan đến RFQ, Khách hàng (Customer) trên cổng B2B, Bảo mật dữ liệu chéo (Khách A không xem được dữ liệu Khách B).
- **P2 (Ưu tiên Trung bình):** Trải nghiệm UI/UX đa ngôn ngữ, hiệu năng Core Web Vitals, Quản trị Nội dung (CMS) của Editor.

---

## 2. Lịch trình Kiểm thử Chi tiết (Timeline 8 Tuần)

> [!IMPORTANT]
> Lịch trình này đòi hỏi sự kỷ luật. Mọi tính năng Dev báo "Hoàn thành" (Done) phải đi kèm môi trường Staging đã deploy để QA test, tránh việc dồn việc vào cuối Sprint.

### Tuần 1 - Tuần 2: Chuẩn bị (Preparation Phase)
- Phân tích tài liệu `ULINK-AD-01` (SRS) và `ULINK-AD-02` (Use Cases).
- Viết **Test Cases (Kịch bản kiểm thử)** cho toàn bộ luồng chức năng ưu tiên P1.
- Dựng kịch bản API Test trên Postman cho Directus Collection và Custom API.
- Thiết lập project Playwright ban đầu để chuẩn bị viết kịch bản Automation.

### Tuần 3 - Tuần 4: Chạy API Test & Chuẩn bị P2
- Bắt đầu chạy **API Testing** ngay khi đội Dev đưa lên môi trường Dev/Staging các API của hệ thống (Auth, Users, Cổng B2B, Products).
- Viết Test Cases cho các FR mức P2 (CMS, Giới thiệu, Tài nguyên).
- Chuẩn bị Dữ liệu mẫu (Test Data): 
  - Tạo sẵn các User với Role (Admin, Sales, Editor, Customer A, Customer B).
  - Chuẩn bị SKU mẫu và File PDF (TDS/MSDS) để test upload.

### Tuần 5: Đợt Kiểm thử Lõi (QA P1 Phase)
- Bắt đầu test UI/UX cho luồng B2B: Trang chủ, Danh mục sản phẩm, Detail Sản phẩm.
- Viết và chạy script **Playwright** cho luồng: Đăng nhập -> Tìm SKU -> Điền Quick Order -> Submit RFQ.
- Chạy test Bảo mật Phân quyền (RBAC) trên cổng B2B (Test chéo tài khoản, đảm bảo dữ liệu khách hàng được cô lập hoàn toàn).
- Log lỗi P1 lên hệ thống.

### Tuần 6: NFRs & Chức năng Phụ (QA P2 & NFR Phase)
- **Manual Test:** CMS (Đăng bài, Dịch đa ngôn ngữ, Unpublish/Publish nội dung), các trang tĩnh (Cụm vùng, Giải pháp).
- **Non-Functional Testing (NFR):** 
  - Chạy công cụ Lighthouse CI để lấy điểm số Core Web Vitals (NFR-01).
  - Thực hiện diễn tập tải trang và test chống Spam Form (NFR-07).
- Chạy lại các script Playwright (Regression Test) sau khi Dev fix bug P1 ở tuần 5.

### Tuần 7 - Tuần 8: Hoàn thiện & Hỗ trợ UAT (Final Polish & UAT)
- Đồng hành cùng người dùng thực tế (User) trong quá trình UAT. Ghi nhận lỗi từ User, xác minh (verify) lỗi và báo Dev fix khẩn cấp.
- **Tiếp tục test vét:** Hoàn thiện test tất cả các case Manual chưa kịp chạy ở Tuần 6 (Đảm bảo sản phẩm hoàn thiện).
- Đóng băng mã nguồn (Code Freeze). Chạy đợt Regression Test cuối cùng toàn bộ hệ thống bằng Playwright và API Postman trước ngày Go-Live.

---

## 3. Quy trình Quản lý Lỗi (Defect Management)

Để đảm bảo hiệu suất cho 1 Tester, vòng đời sửa lỗi cần được Dev cam kết (SLA):

| Mức độ Lỗi (Severity) | Định nghĩa | SLA Yêu cầu Fix |
| :--- | :--- | :--- |
| **S1 - Blocker (Nghiêm trọng)** | Đứt luồng chính (Không thể gửi RFQ, Lỗi Đăng nhập, API sập, Lộ dữ liệu bảo mật). | **Trong vòng 4 giờ làm việc** |
| **S2 - Critical (Nặng)** | Tính năng quan trọng bị sai logic (Sai giá trị công nợ, SKU tìm không ra). | **Trong vòng 24 giờ** |
| **S3 - Major (Trung bình)** | Lỗi giao diện Responsive, Lỗi đa ngôn ngữ, Bug tính năng phụ (CMS). | Trong Sprint hiện tại |
| **S4 - Minor (Nhẹ)** | Sai lệch nhỏ về UI (khoảng cách, màu sắc), Lỗi font chữ. | Đưa vào Backlog sau Go-live |

## 4. Công cụ Khuyến nghị (Tools Stack)
- **Quản lý Test Case & Bugs:** Jira / Trello / Excel.
- **Automation (UI/E2E):** Playwright (Sử dụng Node.js).
- **API Testing:** Postman (Có thể cấu hình chạy tự động bằng Newman) hoặc Insomnia.
- **Performance & NFR:** Google Lighthouse (Trải nghiệm Web) & k6 (Đo độ trễ 50ms của API).
