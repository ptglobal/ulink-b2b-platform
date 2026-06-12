# ERP Outbound Webhook Specification

Tài liệu này định nghĩa chi tiết các phương án thiết kế và câu trả lời nghiệp vụ cho luồng **order / invoice / delivery create-update -> outbound webhook future ERP** để chuẩn bị sẵn sàng cho việc tích hợp hệ thống ERP trong tương lai.

---

### 1. Push outbound ngay hay event log để ERP pull sau?
* **⚠ CORRECTION (Transactional Outbox Pattern):** Thay vì gọi đẩy trực tiếp thời gian thực từ Directus Flow với cơ chế retry tự động trong Flow (do Directus Flow không hỗ trợ lập lịch và retry bền vững), hệ thống áp dụng mô hình **Transactional Outbox Pattern**:
  1. Khi có thay đổi quan trọng trên Order/Invoice/Delivery, Directus Flow ghi nhận một dòng tin nhắn sự kiện vào bảng lưu trữ trung gian **`integration_events`** (chứa `{ entity, op, record_id, erp_ref, idempotency_key, payload(full), status: 'pending', attempts: 0 }`).
  2. Một **Scheduled Worker** chạy ngầm (cron job phía Next.js hoặc service nhỏ) sẽ quét bảng này để đẩy sang ERP khi biến cấu hình `ERP_SYNC_ENABLED=true` (gửi tới endpoint `ERP_WEBHOOK_URL`), đồng thời tự quản lý việc retry/backoff/đưa vào hàng đợi lỗi (DLQ).
  3. **Event Pull (Đối soát):** Hệ thống vẫn cung cấp các API REST (`GET /items/{orders|invoices|deliveries}?filter[updated_at][_gte]=...`) để phía ERP có thể chủ động đối soát và kéo bù dữ liệu sau khi xảy ra downtime kéo dài.

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
  * Nếu đã có `erp_ref` (đã đồng bộ): Sử dụng **`erp_ref`** làm khóa đối khớp.
  * Nếu chưa có `erp_ref` (đơn hàng Portal mới tạo): Sử dụng cấu trúc **`entity:id:revision`** làm khóa định danh tạm thời chống trùng lặp.

### 7. Nếu `erp_ref` null thì xử lý sao?
* Webhook vẫn bắn bình thường. ERP sẽ dựa trên thông tin định danh tạm thời của Directus (`id`) để xử lý đơn hàng, tạo bản ghi tương ứng trên ERP, sau đó ERP gửi phản hồi cập nhật ngược lại mã `erp_ref` cho Directus.

### 8. Retry policy và Queue xử lý lỗi thế nào nếu ERP down?
* **Retry Policy (Thực hiện bởi Worker, không thực hiện trong Flow):** Khi gửi thất bại (mã lỗi 5xx hoặc timeout), worker tự động thử lại tối đa **3 lần** theo cơ chế exponential backoff:
  * Lần 1: Sau 1 phút.
  * Lần 2: Sau 5 phút.
  * Lần 3: Sau 15 phút.
* **Dead-letter / Failed Queue (DLQ):**
  * Nếu sau 3 lần thử lại vẫn thất bại, worker cập nhật dòng sự kiện trong bảng `integration_events` thành `status: 'failed'`.
  * Bản ghi lỗi này sẽ hiển thị lên view `failed_erp_webhooks` trên giao diện Directus Admin để quản trị viên giám sát (gồm URL, Payload, Response Error) và cung cấp tính năng **Re-send (Gửi lại)** thủ công kết hợp phát cảnh báo.

### 9. ERP trả mã lỗi 4xx vs 5xx thì xử lý khác nhau thế nào?
* **Mã lỗi 4xx (Client Error - Lỗi dữ liệu/quyền hạn):** Chuyển thẳng dòng sự kiện trong outbox sang `status: 'failed'` (đi vào DLQ/view `failed_erp_webhooks`) ngay lập tức mà không chạy chu kỳ retry tự động (vì dữ liệu sai/lỗi phân quyền có thử lại vẫn sẽ lỗi). Đồng thời gửi cảnh báo khẩn tới Admin/Dev.
* **Mã lỗi 5xx hoặc Timeout (Server Error/Downtime):** Kích hoạt chu kỳ retry 3 lần tự động của worker như quy định ở trên.

### 10. Khi ERP chưa tồn tại thực tế, endpoint đích là gì?
* **Cơ chế hoạt động:** Cấu hình biến môi trường `ERP_SYNC_ENABLED=false`. Khi đó các sự kiện trong bảng outbox (`integration_events`) sẽ tích lũy dưới dạng log chờ.
* **UAT & Testing:** Khi cần thử nghiệm, có thể trỏ worker tới một **Staging Stub/Mock Endpoint** (ví dụ: Hookdeck, Webhook.site hoặc mock route `/api/mock/erp` của Next.js) để kiểm tra dòng dữ liệu tích hợp trước khi ERP chính thức vận hành.

### 11. Có cần staging/prod endpoint tách riêng không?
* **Có**. Cấu hình URL endpoint đích của ERP tách biệt hoàn toàn qua các biến môi trường (`ERP_WEBHOOK_URL`) trong file `.env.staging` và `.env.production`.

### 12. Delete/cancel chứng từ xử lý sao?
* Trong B2B không thực hiện xóa cứng (hard delete). 
* Khi hủy đơn hàng, trạng thái của Order/Delivery sẽ chuyển sang `cancelled`, hệ thống bắn webhook thông báo trạng thái này để ERP thực hiện hủy chứng từ tương ứng.

### 13. Các bước chuyển trạng thái (Status Transitions) bắt buộc phải bắn webhook:
* **Orders:** `pending -> confirmed`, `processing -> shipped`, `shipped -> completed`, và bất kỳ trạng thái nào chuyển sang `cancelled`.
* **Invoices:** `unpaid -> partial`, `partial -> paid`, hoặc chuyển sang `overdue`.
* **Deliveries:** `scheduled -> in_transit`, `in_transit -> delivered`, `* -> cancelled` / `* -> late`.
