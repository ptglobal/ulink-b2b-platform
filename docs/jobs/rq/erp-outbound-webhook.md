# ERP Outbound Webhook Specification

Tài liệu này định nghĩa chi tiết các phương án thiết kế và câu trả lời nghiệp vụ cho luồng **order / invoice / delivery create-update -> outbound webhook future ERP** để chuẩn bị sẵn sàng cho việc tích hợp hệ thống ERP trong tương lai.

---

### 1. Push outbound ngay hay event log để ERP pull sau?
* **Phương án:** **Cung cấp cả hai (Hybrid)**.
  * **Realtime Push:** Directus Flow sẽ tự động bắn webhook (HTTP POST) ngay lập tức khi chứng từ được tạo mới hoặc thay đổi trạng thái quan trọng để ERP xử lý tức thời.
  * **Event Pull:** Hệ thống vẫn duy trì các API REST (`GET /items/orders`, `/items/invoices`, `/items/deliveries`) có bộ lọc theo thời gian (`updated_at` hoặc trạng thái đồng bộ) để ERP chủ động kéo dữ liệu (pull) về trong trường hợp ERP bị downtime dài ngày và cần đối soát lại.

### 2. Một webhook chung hay nhiều webhook riêng?
* **Lựa chọn:** **1 Webhook chung** (ví dụ: `POST /erp/webhook`).
* **Lý do:** ERP chỉ cần mở và duy trì một cổng endpoint duy nhất. Phân biệt các loại chứng từ bằng trường `"collection"` (có giá trị là `"orders"`, `"invoices"`, hoặc `"deliveries"`) bên trong JSON payload.

### 3. Trigger nào bắn và có bắn khi field không liên quan đổi không?
* **Trigger kích hoạt:** Sự kiện `create` (tạo mới) và `update` (cập nhật).
* **Bộ lọc điều kiện:** **Không bắn khi đổi các trường phụ**. Chỉ bắn webhook khi có sự thay đổi tại các trường nghiệp vụ cốt lõi hoặc trạng thái:
  * Trạng thái (`status`, `paid_status`).
  * Tổng tiền, giá trị thuế (`total`, `subtotal`, `tax`, `amount`, `paid_amount`).
  * Thông tin giao nhận (`hub`, `scheduled_date`, `delivered_date`, `tracking_ref`).
  * Danh sách mặt hàng (`order_items`).

### 4. Payload là full record hay delta patch?
* **Lựa chọn:** **Full record (Bản ghi đầy đủ)**.
* **Lý do:** ERP cần nhận đầy đủ cấu trúc dữ liệu hiện tại của chứng từ để tự kiểm tra chéo và cập nhật đồng bộ toàn bộ trường thông tin, giảm thiểu rủi ro lệch dữ liệu so với việc ghép từng mảnh thay đổi (delta patch).

### 5. Có include `erp_ref` trong payload không?
* **Có**. 
* **Quy trình:**
  * Với chứng từ được tạo từ ERP đẩy sang Directus: `erp_ref` luôn có giá trị.
  * Với đơn hàng do khách hàng tự tạo trên Portal: `erp_ref` ban đầu sẽ là `null`. Khi bắn sang ERP, ERP nhận đơn và cấp mã, sau đó ERP gọi ngược lại API của Directus để cập nhật giá trị `erp_ref` này.

### 6. Idempotency key chốt là gì?
* **Quy tắc:**
  * Nếu đã có `erp_ref` (đã đồng bộ): Sử dụng **`erp_ref`** làm khóa đối khớp duy nhất để ERP tránh tạo trùng lặp.
  * Nếu chưa có `erp_ref` (đơn hàng Portal mới tạo): Sử dụng kết hợp **`collection:id`** (tên bảng và ID tự tăng của Directus) làm khóa định danh tạm thời.

### 7. Nếu `erp_ref` null thì xử lý sao?
* Webhook vẫn bắn bình thường. ERP sẽ dựa trên thông tin định danh tạm thời của Directus (`id`) để xử lý đơn hàng, tạo bản ghi tương ứng trên ERP, sau đó ERP gửi phản hồi cập nhật ngược lại mã `erp_ref` cho Directus.

### 8. Retry policy và Queue xử lý lỗi thế nào nếu ERP down?
* **Retry Policy:** Tự động thử lại **3 lần** với khoảng cách giãn cách tăng dần (Exponential backoff):
  * Lần 1: Sau 1 phút.
  * Lần 2: Sau 5 phút.
  * Lần 3: Sau 15 phút.
* **Dead-letter / Failed Queue:** 
  * Nếu sau 3 lần vẫn thất bại, yêu cầu Webhook lỗi sẽ được lưu vào một bảng log chuyên dụng trong Directus mang tên `failed_erp_webhooks`.
  * Giao diện Directus Admin sẽ cung cấp màn hình cho kỹ thuật viên theo dõi log lỗi (URL, Payload, Response Error) và có nút **Bắn lại thủ công (Re-send)** sau khi hệ thống ERP khôi phục hoạt động.

### 9. ERP trả mã lỗi 4xx vs 5xx thì xử lý khác nhau thế nào?
* **Mã lỗi 4xx (Lỗi dữ liệu/Quyền hạn - Client Error):** Hệ thống ghi nhận thẳng vào `failed_erp_webhooks`, không chạy chu kỳ retry tự động (vì thử lại dữ liệu lỗi cũng sẽ tiếp tục thất bại). Đồng thời gửi thông báo cảnh báo cho Admin/Dev.
* **Mã lỗi 5xx (Lỗi hệ thống/Downtime - Server Error hoặc Timeout):** Kích hoạt chu kỳ tự động retry 3 lần như trên.

### 10. Khi ERP chưa tồn tại thực tế, endpoint đích là gì?
* **Phương án:** Cấu hình trỏ webhook đến một **Mock Server / Stub Endpoint** (ví dụ: Hookdeck, Webhook.site hoặc một API route mock của Next.js) để phục vụ kiểm thử tích hợp (UAT) và đóng gói nghiệm thu.

### 11. Có cần staging/prod endpoint tách riêng không?
* **Có**. Cấu hình URL endpoint đích của ERP tách biệt hoàn toàn qua các biến môi trường (`ERP_WEBHOOK_URL`) trong file `.env.staging` và `.env.production`.

### 12. Delete/cancel chứng từ xử lý sao?
* Trong B2B không thực hiện xóa cứng (hard delete). 
* Khi hủy đơn hàng, trạng thái của Order/Delivery sẽ chuyển sang `cancelled`, hệ thống bắn webhook thông báo trạng thái này để ERP thực hiện hủy chứng từ tương ứng.

### 13. Các bước chuyển trạng thái (Status Transitions) bắt buộc phải bắn webhook:
* **Orders:** `pending -> confirmed`, `processing -> shipped`, `shipped -> completed`, và bất kỳ trạng thái nào chuyển sang `cancelled`.
* **Invoices:** `unpaid -> partial`, `partial -> paid`, hoặc chuyển sang `overdue`.
* **Deliveries:** `scheduled -> in_transit`, `in_transit -> delivered`, `* -> cancelled` / `* -> late`.
