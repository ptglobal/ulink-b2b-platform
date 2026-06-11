# RFQ Created Flow Specification

Tài liệu này định nghĩa chi tiết các phương án thiết kế và câu trả lời nghiệp vụ cho luồng **RFQ created -> notify Sales / assign owner** để xử lý các yêu cầu báo giá của khách hàng.

---

### 1. Owner assign tự động hay manual triage?
* **Lựa chọn:** **Tự động (Auto-assign)** qua Directus Flow ngay khi bản ghi RFQ được tạo thành công.
* **Mở rộng:** Hỗ trợ Admin hoặc Sales Manager chuyển người phụ trách (re-assign) thủ công qua giao diện Directus Admin bất cứ lúc nào.

### 2. Rule assign cụ thể là gì?
* **Luật phân bổ đề xuất:** Phân bổ theo **Hub** (Khu vực địa lý) kết hợp **Industry** (Ngành nghề kinh doanh). 
  * Mỗi nhân viên Sales (hoặc nhóm Sales) phụ trách một cụm Hub và Ngành cụ thể.
  * *Ví dụ:* RFQ gửi tới Hub phía Nam ngành Hóa chất $\rightarrow$ gán cho Sales A.
* **Fallback (Dự phòng):** Nếu không khớp bất kỳ điều kiện tự động nào, hệ thống gán mặc định cho Trưởng phòng Sales (Sales Manager) để phân bổ thủ công.

### 3. Nếu `assigned_sales` null thì ai nhận notify?
* Gửi email thông báo về hòm thư chung của phòng kinh doanh (được lưu tại `site_settings.contact_email`) hoặc gửi trực tiếp cho Sales Manager để xử lý phân bổ.

### 4. Notify qua kênh nào?
* **Kênh áp dụng:** 
  1. **Email:** Gửi cho nhân viên Sales được gán phụ trách (Sales Owner) để họ nhận việc ngay lập tức.
  2. **Directus Notification:** Gửi thông báo trong hệ thống nội bộ của Directus để hiển thị chuông thông báo trên Dashboard quản trị.
* *Slack/Teams:* Để lại như một tính năng mở rộng trong tương lai nếu khách hàng yêu cầu tích hợp.

### 5. Notify khi nào: ngay khi create hay sau validate / anti-spam / dedupe?
* **Thời điểm:** Chỉ gửi thông báo **sau khi RFQ đã vượt qua các lớp validate, anti-spam (Cloudflare Turnstile) và lọc trùng (dedupe) thành công** ở phía Next.js BFF và đã được lưu thành công thành một bản ghi trong database Directus.

### 6. RFQ status ban đầu là gì?
* Trạng thái khởi tạo: **`new`** (theo danh sách trạng thái `new`, `quoted`, `won`, `lost` của schema).

### 7. Có auto-change status sau khi assign không?
* **Không**. Việc tự động gán chủ sở hữu (assign owner) diễn ra ngay lập tức khi tạo và bản ghi vẫn giữ nguyên trạng thái `new`. 
* Trạng thái chỉ đổi sang `quoted` khi Sales chủ động cập nhật bảng báo giá gửi khách.

### 8. Có SLA/timeout để reassign nếu Sales chưa xử lý không?
* **Không áp dụng ở Phase 1**. Việc theo dõi SLA quá hạn sẽ làm tăng độ phức tạp của hệ thống. Ở giai đoạn này, Sales Manager sẽ quản lý hiệu suất của nhân viên bằng cách xem báo cáo trực quan các đơn hàng ở trạng thái `new` quá hạn trên Dashboard.

### 9. Sales cần thấy nội dung gì (full payload hay summary)?
* **Nội dung email:** Gửi **Summary (Thông tin tóm tắt) kèm Link chi tiết**.
  * Thông tin bao gồm: Tên công ty, Tên người liên hệ, Email, SĐT, Hub yêu cầu, Ghi chú của khách hàng và danh sách các SKU + Số lượng yêu cầu.
  * Đính kèm một đường link trực tiếp dẫn tới trang quản trị của bản ghi RFQ đó trong Directus Admin (`/admin/content/rfq_requests/[ID]`) để Sales click vào xử lý nhanh.

### 10. Có cần audit trail (nhật ký thay đổi)?
* **Có**. Directus có tính năng tự động lưu lịch sử chỉnh sửa bản ghi (Revisions & Activity Log). Mọi hành động gán người, đổi người phụ trách, thời gian đổi, và ai thực hiện đều được lưu lại tự động dưới dạng Revision History.

### 11. Dedupe RFQ trùng email/phone/company có chặn không?
* **Có chặn**. Enforce một bộ lọc trùng (dedupe window) trong vòng **2 phút** tại tầng Next.js BFF API. Nếu phát hiện một yêu cầu gửi liên tiếp có cùng Email/Phone/Company trong 2 phút $\rightarrow$ trả về lỗi `CONFLICT (409)` để chặn spam.

### 12. Nếu notify fail nhưng record đã tạo, xử lý thế nào?
* **Nguyên tắc:** Dữ liệu khách hàng là quan trọng nhất. Nếu việc gửi Email/Notify thất bại $\rightarrow$ bản ghi RFQ **vẫn phải được tạo và lưu thành công** trong DB.
* Hệ thống sẽ ghi nhận lỗi gửi mail vào log để kỹ thuật kiểm tra SMTP, Sales vẫn có thể tìm thấy RFQ đó bằng cách kiểm tra thủ công danh sách đơn RFQ mới trên Directus Admin.
