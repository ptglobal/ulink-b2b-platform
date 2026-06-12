# Flow Operations & Management Specification

Tài liệu này định nghĩa chi tiết các phương án vận hành, quản lý lỗi và tiêu chuẩn kỹ thuật (Ops / vận hành flow) cho các luồng xử lý tự động của hệ thống Directus & Next.js.

---

### 1. Flow thuần Directus hay cần hook/endpoint custom?
* **Phương án phối hợp (Hybrid):**
  * **Directus Flow thuần (UI-based):** Sử dụng cho các luồng đơn giản như cập nhật trạng thái bản ghi nội bộ, điền trường tự động (auto-fill).
  * **Webhook + Custom Endpoint / Worker:** Đối với các luồng nghiệp vụ phức tạp (như gửi email mẫu HTML động, đồng bộ cache Redis, revalidate Next.js, đẩy dữ liệu ERP qua Outbox table + worker, import nghiệp vụ), Directus Flow chỉ đóng vai trò **Trigger (kích hoạt)** hoặc ghi nhận trạng thái. Toàn bộ logic nghiệp vụ thực thi chính sẽ được đưa về **Next.js (BFF)** hoặc background worker để xử lý.

### 2. Logic nghiệp vụ đặt ở đâu?
* **Vị trí đặt logic:** Đặt tập trung trong **Next.js route handlers** (mã nguồn Frontend/BFF).
* **Lý do:**
  * Dễ dàng viết Unit Test, Integration Test.
  * Tích hợp mượt mà vào quy trình CI/CD (không phụ thuộc vào DB migration của Directus).
  * Tránh quá tải cho Directus Server khi chạy các tác vụ nặng (như render HTML email, kết nối Redis).

### 3. Flow chạy đồng bộ (sync) hay bất đồng bộ (async)?
* **Async (Bất đồng bộ - Non-blocking):** Áp dụng cho hầu hết các luồng (gửi email thông báo, bắn webhook ERP, revalidate cache Next.js, đồng bộ Redis). Điều này giúp Editor/Admin lưu dữ liệu trên Directus UI ngay lập tức mà không phải chờ đợi các hệ thống bên ngoài phản hồi.
* **Sync (Đồng bộ - Blocking):** Chỉ áp dụng đối với các luồng **Validation Hook** trước khi lưu (như kiểm tra định dạng dữ liệu, kiểm tra quyền hạn) để có thể ngăn chặn (reject) hành động lưu của người dùng nếu dữ liệu không hợp lệ.

### 4. Error handling chốt thế nào?
* **Quy tắc xử lý lỗi:**
  * **Fail-safe (Log-only) đối với luồng phụ:** Nếu việc gửi mail thông báo hoặc revalidate cache thất bại $\rightarrow$ chỉ ghi nhận log lỗi vào hệ thống và vẫn hoàn thành việc lưu dữ liệu chính của người dùng (không chặn tiến trình lưu).
  * **Fail-fast đối với luồng chính:** Nếu các luồng kiểm tra nghiệp vụ hoặc kiểm tra trùng lặp (dedupe) thất bại $\rightarrow$ chặn ngay lập tức, báo lỗi đỏ lên màn hình người dùng.

### 5. Có alert (cảnh báo) khi flow bị lỗi không?
* **Có**. Cấu hình hệ thống để khi có lỗi xảy ra liên tục (hoặc webhook trả về mã lỗi 5xx từ Next.js/ERP):
  * Ghi nhận chi tiết lỗi vào Directus Flow run log hoặc log của background worker.
  * Tự động trigger gửi cảnh báo khẩn cấp (email/Slack/Teams) tới đội ngũ vận hành kỹ thuật (tham khảo thêm tài liệu [OPS-03](../operations/OPS-03-backup-recovery-monitoring.md)).

### 6. Secrets / webhook token lưu ở đâu?
* **Bảo mật:** Lưu tập trung tại biến môi trường (`.env`) của Directus và Next.js.
* **Quy tắc:** Tuyệt đối không hardcode các chuỗi nhạy cảm (như mật khẩu Redis, Token Webhook `REVALIDATE_SECRET`, `INTERNAL_API_TOKEN`, `ERP_WEBHOOK_TOKEN`, `ERP_WEBHOOK_URL`, `ERP_SYNC_ENABLED`, SMTP credentials) trong mã nguồn hoặc cấu hình trực tiếp trên giao diện Flow UI.

### 7. Có phân biệt staging/prod endpoint không?
* **Có, bắt buộc**. Các cấu hình URL Webhook, Redis host, SMTP host, ERP URL phải được định nghĩa bằng biến môi trường ở các file cấu hình tương ứng (`.env.staging` và `.env.production`).

### 8. Có cần test/smoke script cho từng flow không?
* **Có**. Viết các script Node.js nhỏ (đặt tại thư mục `directus/` hoặc `scripts/` của dự án) để giả lập sự kiện Webhook (ví dụ gửi một payload JSON giả lập sự kiện Publish/RFQ sang Next.js).
* **Mục đích:** Giúp chạy thử nghiệm tự động (automated test) và kiểm thử nhanh (smoke test) sau mỗi lần deploy mà không cần bấm thủ công trên UI.

### 9. Ai sở hữu (Owner) từng luồng?
* **Dev (Lập trình viên):** Owner về hạ tầng kỹ thuật (cấu hình Flow, viết API, kết nối Redis, email, ERP, xử lý lỗi mã nguồn).
* **BA / Sales Ops / Admin:** Owner về nghiệp vụ (định nghĩa quy tắc gán Sales, nội dung email gửi khách hàng, duyệt lỗi dữ liệu từ ERP đẩy về).

### 10. Naming convention (Quy ước đặt tên) là gì?
* **Directus Flows:** Đặt tên theo tiền tố `flow-` kèm chức năng: `flow-revalidate-content`, `flow-sku-cache-sync`, `flow-rfq-notify`, `flow-erp-outbox`, `flow-import-commercial`.
* **Redis Key:** `sku:{code}` (Ví dụ: `sku:cr-glv-001`).
* **Next.js Tags:** `col:{collection}` (cho danh sách), `entity:{collection}:{id}` (cho chi tiết đa ngôn ngữ).
* **Webhook / API Route:** `/api/revalidate`, `/api/internal/sku-cache`, `/api/import`, `/erp/webhook`.

### 11. Có cần viết tài liệu giao tiếp (contract doc) riêng không?
* **Có**. Mỗi luồng tích hợp cần có một file đặc tả API (contract specification) trong thư mục `docs/specs/` mô tả chi tiết: URL, Header, Method, Cấu trúc JSON payload đầu vào/đầu ra để các bên liên quan (Next.js Dev, Directus Dev, ERP Partner) dễ dàng phát triển song song.
