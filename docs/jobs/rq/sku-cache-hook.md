# SKU Cache Hook Specification

Tài liệu này định nghĩa chi tiết các phương án thiết kế và câu trả lời nghiệp vụ cho luồng **SKU create/update/publish -> cache hook** để quản lý bộ nhớ đệm Redis của SKU.

---

### 1. Trigger chạy khi nào?
* **Sự kiện:** Kích hoạt khi có hành động `create` (tạo mới), `update` (cập nhật) hoặc `delete` (xóa) trên collection `product_skus`.
* **Trạng thái:** Áp dụng cho mọi thay đổi trạng thái của SKU bao gồm: `publish`, `unpublish` (chuyển về `draft`), và `archive`.

### 2. Cache action là gì?
* **Lựa chọn:** Cả hai (`prime + invalidate`).
  * Nếu SKU có `status === "published"` $\rightarrow$ Thực hiện **Prime** (ghi/cập nhật thông tin SKU mới nhất vào Redis).
  * Nếu SKU có `status === "draft"` hoặc `"archived"`, hoặc bị xóa $\rightarrow$ Thực hiện **Invalidate** (xóa key SKU tương ứng khỏi Redis).

### 3. Khi SKU từ `draft -> published`, có prime cache ngay không?
* **Có, prime ngay lập tức**. 
* **Lý do:** Đảm bảo khi một SKU vừa được xuất bản, khách hàng sử dụng tính năng Quick Order tra cứu sẽ tìm thấy thông tin ngay lập tức từ Redis với tốc độ phản hồi nhanh nhất (<50ms) mà không bị trễ ở lần truy cập đầu tiên.

### 4. Khi SKU từ `published -> draft/archived`, cache có xóa ngay không?
* **Có, xóa ngay lập tức**.
* **Lý do:** Ngăn chặn ngay lập tức việc khách hàng tiếp tục tra cứu và đặt hàng những SKU đã bị ẩn hoặc ngưng kinh doanh.

### 5. Key chuẩn chốt là gì?
* **Cấu trúc key:** `sku:{code-lowercased}` (Ví dụ: SKU `CR-GLV-001` sẽ có Redis key tương ứng là `sku:cr-glv-001`).
* **Alias:** Không sử dụng alias khác để tối ưu hóa hiệu năng và dung lượng lưu trữ của Redis.

### 6. Có normalize `sku_code` bằng trim / uppercase / lowercase không?
* **Có**. Tất cả mã SKU trước khi lưu vào Redis hoặc khi khách hàng gửi lên để tra cứu đều phải đi qua bước chuẩn hóa:
  * Loại bỏ khoảng trắng ở hai đầu: `.trim()`
  * Chuyển toàn bộ thành chữ thường: `.toLowerCase()` (để khớp với Redis key).

### 7. Nếu đổi `sku_code`, old key có xóa không?
* **Có**. Directus Flow (hoặc hook) khi phát hiện sự kiện đổi tên `sku_code` sẽ thực hiện:
  1. Gửi lệnh xóa key cũ (`sku:{old-code}`) khỏi Redis.
  2. Tạo/ghi dữ liệu mới vào key mới (`sku:{new-code}`).

### 8. Field change nào làm trigger/invalidate?
* Bất kỳ sự thay đổi nào trên các trường nghiệp vụ chính của SKU đều kích hoạt cập nhật cache:
  * `sku_code` (Mã SKU)
  * `product` (Liên kết sản phẩm cha)
  * `pack_size` (Quy cách đóng gói)
  * `unit` (Đơn vị tính)
  * `attributes` (Thông số thuộc tính động)
  * `status` (Trạng thái)

### 9. Cache miss path có được phép đọc Directus rồi fill lại không?
* **Có**. 
* **Quy trình:** Khi khách hàng tra cứu một SKU và bị cache miss trên Redis $\rightarrow$ Next.js BFF được phép truy vấn trực tiếp vào Directus DB 1 lần. Nếu tìm thấy SKU ở trạng thái `published`, Next.js sẽ trả dữ liệu cho client đồng thời ghi ngược lại (fill) vào Redis để phục vụ các lượt truy xuất sau.

### 10. TTL cố định là bao nhiêu?
* **Thời gian sống (TTL):** Cố định **1 giờ** (`3600` giây) cho tất cả các key SKU trong Redis.
* **Mục đích:** Tránh việc Redis bị phình dung lượng bộ nhớ đối với những SKU rác hoặc những SKU cũ không còn phát sinh giao dịch tra cứu.

### 11. Bulk update nhiều SKU xử lý thế nào?
* **Cơ chế:** Khi import file CSV hoặc cập nhật hàng loạt trên giao diện Directus, sự kiện sẽ trả về danh sách mảng các `keys` bị thay đổi.
* **Xử lý:** Thay vì gọi ghi/xóa Redis đơn lẻ cho từng SKU (gây nghẽn kết nối), hệ thống sẽ gộp lại và thực hiện dưới dạng **Batch** sử dụng cơ chế **Redis Pipeline / Multi** để thực hiện ghi/xóa hàng loạt SKU trong một chu kỳ kết nối duy nhất.
