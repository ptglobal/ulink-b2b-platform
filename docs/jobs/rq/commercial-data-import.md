# Commercial Data Import Specification

Tài liệu này định nghĩa chi tiết các phương án thiết kế và câu trả lời nghiệp vụ cho phần **Import / process dữ liệu thương mại** qua file CSV để đồng bộ dữ liệu khách hàng, đơn hàng, hóa đơn và phiếu giao hàng.

---

### 1. CSV import áp dụng cho collection nào?
* **Các bảng áp dụng:** `customers`, `orders`, `invoices`, và `deliveries`.
* **Đối với `order_items` (Mặt hàng chi tiết của đơn hàng):** 
  * Không nên cho phép import riêng lẻ độc lập vì dễ gây lỗi dữ liệu mồ côi (Order Items không thuộc về đơn hàng nào).
  * **Giải pháp:** Khi import `orders`, cấu hình Directus UI / API để nhận file CSV có định dạng lồng (nested data) hoặc cho phép import `order_items` riêng nhưng bắt buộc phải đi kèm trường khóa ngoại liên kết tới đơn hàng đã tồn tại.

### 2. Ai được quyền import dữ liệu?
* **Quyền hạn:** Chỉ có **Admin** và **Sales Ops** (nhân viên điều phối dữ liệu) mới được cấp quyền import.
* **Hạn chế:** Nhân viên Sales thông thường và Customer tuyệt đối không được phép import để tránh rủi ro ghi đè làm sai lệch dữ liệu công nợ, hóa đơn của doanh nghiệp.

### 3. Import qua Directus UI hay endpoint riêng?
* **⚠ CORRECTION (Custom Importer Engine):** 
  * Đối với các bảng dữ liệu thương mại phức tạp như `orders` (kèm `order_items`), `invoices`, `deliveries`: **Bắt buộc sử dụng API endpoint tự phát triển (`POST /api/import`)** thay vì tính năng import mặc định của Directus UI. Lý do là công cụ mặc định của Directus không hỗ trợ cơ chế upsert theo trường `erp_ref` lồng nhau và không thể đảm bảo tính nhất quán (rollback) khi gặp lỗi.
  * Đối với bảng `customers` (Khách hàng đơn giản): Cho phép sử dụng công cụ import mặc định của Directus UI.

### 4. Validation rule tối thiểu là gì cho từng file?
* **`customers` (Khách hàng):**
  * `company_name`: Bắt buộc, không trống.
  * `tax_code` (Mã số thuế) hoặc `email`: Bắt buộc, là duy nhất (unique), không được trùng lặp trong hệ thống.
* **`orders` (Đơn hàng):**
  * `erp_ref` (Mã tham chiếu ERP): Bắt buộc và duy nhất.
  * `customer` (Khách hàng): Phải khớp với một khách hàng đang tồn tại trong hệ thống.
  * `total` và `subtotal`: Phải là số dương (>= 0).
* **`invoices` (Hóa đơn):**
  * `code` hoặc `erp_ref`: Bắt buộc và duy nhất.
  * `customer` và `order`: Bắt buộc khớp với bản ghi đang tồn tại.
  * `amount` (Số tiền hóa đơn): Phải >= 0.
* **`deliveries` (Phiếu giao hàng):**
  * `order`: Bắt buộc khớp với đơn hàng đã có.
  * `status`: Phải nằm trong danh sách enum hợp lệ (`scheduled`, `in_transit`, `delivered`, `late`, `cancelled`).

### 5. `erp_ref` bắt buộc hay optional?
* **Bắt buộc** đối với tất cả dữ liệu thương mại được import từ bên ngoài (ERP). 
* **Ngoại lệ:** Chỉ trường hợp Khách hàng tự đăng ký tài khoản mới trực tuyến qua cổng Portal thì `erp_ref` ban đầu sẽ để trống (null) và sẽ được ERP điền sau khi đồng bộ.

### 6. Dùng `erp_ref` làm upsert key hay code?
* **Lựa chọn:** Sử dụng **`erp_ref`** làm khóa đối khớp (upsert key) chính.
* *Đối với khách hàng (`customers`):* Nếu chưa có `erp_ref`, có thể sử dụng `tax_code` để làm khóa đối khớp dữ liệu.

### 7. Nếu record trùng thì update hay reject?
* **Lựa chọn:** **Update (Upsert - Cập nhật đè)**.
* **Lý do:** Khi dữ liệu bên ERP thay đổi (ví dụ: hóa đơn được thanh toán một phần từ `unpaid` sang `partial`, hoặc đơn hàng đổi từ `processing` sang `shipped`), việc import file mới sẽ ghi đè dữ liệu mới nhất vào bản ghi cũ để đồng bộ trạng thái, tránh tạo ra bản ghi trùng lặp.

### 8. Nếu file có lỗi 1 dòng, rollback toàn bộ hay partial success?
* **⚠ CORRECTION (Pre-commit Validation & Atomic Aggregate):**
  * **Cơ chế mặc định:** Toàn bộ file sẽ bị từ chối nếu phát hiện lỗi ở bất kỳ dòng nào (Block-on-any-error). Hệ thống thực hiện việc này thông qua bước **Pre-commit Dry-run Validation** (chạy thử kiểm tra toàn bộ file và báo cáo lỗi theo từng dòng trước khi lưu).
  * **Mức độ giao dịch (Transaction Level):** Giao dịch cam kết dữ liệu được thực thi **Atomic per aggregate** (nghĩa là một đơn hàng và toàn bộ `order_items` đi kèm sẽ thành công hoặc thất bại cùng nhau), tránh tạo ra các bản ghi mồ côi bị lệch dữ liệu.
  * **Tùy chọn nâng cao:** Cung cấp thêm tùy chọn cho Admin "Cho phép import một phần" (Allow partial success) đối với các file vận hành quy mô lớn, khi đó hệ thống sẽ ghi nhận các cụm giao dịch hợp lệ và bỏ qua/lập báo cáo tải xuống cho các dòng bị lỗi.

### 9. Có preview trước import không?
* **Có (Bắt buộc)**. Phía giao diện quản trị (Next.js custom import page hoặc custom panel trong Directus) phải cung cấp bước xem trước (Preview):
  * Hiển thị ánh xạ cột (column mapping) và mẫu dữ liệu (sample data).
  * Chạy thử dry-run và hiển thị thống kê dự kiến: số dòng sẽ được Tạo mới (Created), Cập nhật (Updated), Bỏ qua (Skipped) hoặc Lỗi (Failed) trước khi Admin bấm nút xác nhận ghi vào database.

### 10. Có log số dòng created / updated / skipped / failed không?
* **Có**. Hệ thống sẽ xuất ra báo cáo kết quả chi tiết sau khi quá trình import thực tế (hoặc chạy thử) hoàn tất:
  * Thống kê số lượng bản ghi: Created, Updated, Skipped, Failed.
  * Cung cấp liên kết tải xuống danh sách các dòng dữ liệu bị lỗi (downloadable error rows) kèm mô tả chi tiết lỗi tương ứng để người dùng dễ dàng chỉnh sửa lại file gốc.
