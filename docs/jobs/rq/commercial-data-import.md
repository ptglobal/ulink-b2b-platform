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
* **Lựa chọn:** **Tận dụng Directus UI mặc định** ở Phase 1. 
* **Lý do:** Directus đã có sẵn tính năng import dữ liệu cực mạnh từ file CSV cho từng collection, hỗ trợ ánh xạ cột (column mapping), giúp giảm thiểu thời gian code.
* **Mở rộng tương lai:** Nếu cần các nghiệp vụ xác thực nghiệp vụ siêu phức tạp (ví dụ: tự động trừ kho, tính toán chiết khấu tự động khi import), hệ thống sẽ xây dựng endpoint custom chuyên dụng (`POST /api/import`).

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
* **Lựa chọn:** **Rollback toàn bộ (All-or-Nothing)**.
* **Lý do:** Dữ liệu thương mại và tài chính B2B yêu cầu tính nhất quán tuyệt đối. Nếu cho phép partial success (thành công một nửa), hệ thống rất dễ bị lệch dữ liệu (ví dụ: import đơn hàng thành công nhưng các dòng sản phẩm chi tiết đi kèm bị lỗi $\rightarrow$ đơn hàng bị trống ruột). Do đó, nếu có bất kỳ dòng nào lỗi, hệ thống phải hủy bỏ (reject) toàn bộ file và yêu cầu sửa lại.

### 9. Có preview trước import không?
* **Có**. Giao diện Directus UI mặc định sẽ hiển thị màn hình đối chiếu các cột trong file CSV với các trường trong database, hiển thị trước dữ liệu mẫu để người dùng kiểm tra trước khi bấm nút xác nhận import.

### 10. Có log số dòng created / updated / skipped / failed không?
* **Có**. Directus UI mặc định sẽ thông báo popup kết quả chi tiết sau khi import xong: tổng số bản ghi được tạo mới, số bản ghi được cập nhật và danh sách các dòng bị lỗi (nếu có).
