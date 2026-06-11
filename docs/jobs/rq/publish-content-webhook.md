# Publish Content -> Webhook Specification

Dưới đây là các câu trả lời và phương án thiết kế chi tiết cho luồng **Publish content -> webhook** để đồng bộ cache giữa Directus (Headless CMS) và Next.js (Frontend).

---

### 1. Trigger chính xác là gì?
* **Lựa chọn:** Bắn khi có cả 3 sự kiện: `create`, `update` và `delete`.
* **Cơ chế lọc:** Trong Directus Flow, bộ lọc điều kiện (Condition block) sẽ chỉ cho phép gửi Webhook đi nếu:
  * Bản ghi hiện tại có `status === "published"`.
  * HOẶC bản ghi vừa được cập nhật thay đổi trạng thái sang `published` (từ `draft`/`archived`), hoặc ngược lại từ `published` sang trạng thái khác.

### 2. Có bắn khi `unpublish/archive` không?
* **Có**. Phải bắn webhook khi unpublish (chuyển trạng thái từ `published` sang `draft`/`archived`) hoặc khi bản ghi bị xóa hoàn toàn.
* **Mục đích:** Để Next.js biết và tiến hành xóa cache (revalidate) các bài viết/sản phẩm không còn hiển thị nữa, tránh lỗi link chết (broken links) hiển thị trên Frontend.

### 3. Áp dụng cho những collection nào?
* Áp dụng cho toàn bộ các **Content Collections** hiển thị ra ngoài Frontend:
  * `products`
  * `pages`
  * `blog_posts`
  * `case_studies`
  * `regional_hubs`
  * `documents`
  * `product_categories`
  * `partners`
  * `hero_banners`

### 4. Bắn theo 1 record hay bulk batch?
* **1 record:** Đây là cơ chế kích hoạt mặc định của Directus Flows khi admin chỉnh sửa trên giao diện.
* **Hỗ trợ Batch:** Endpoint tiếp nhận ở phía Next.js cần được thiết kế để xử lý mảng `keys` (danh sách ID) đề phòng trường hợp admin cập nhật hàng loạt qua API hoặc import dữ liệu.

### 5. Payload cần field gì?
Gửi payload dạng JSON tối giản nhưng đủ thông tin:
```json
{
  "event": "items.update", // items.create | items.update | items.delete
  "collection": "blog_posts",
  "id": 123, // hoặc mảng keys: [123, 124]
  "slug": "huong-dan-onboarding-ulink",
  "status": "published",
  "locale": "vi" // nếu sử dụng đa ngôn ngữ i18n
}
```

### 6. Endpoint đích là 1 URL chung hay nhiều URL theo loại content?
* **1 URL chung duy nhất:** Ví dụ: `POST https://frontend.domain/api/revalidate`.
* **Cơ chế bảo mật:** Sử dụng mã bảo mật `REVALIDATE_SECRET` gửi kèm ở trường `Authorization` Header để xác thực request là từ Directus gửi sang.
* **Xử lý phía Next.js:** Route handler sẽ đọc trường `collection` để tự điều phối logic xử lý cache tương ứng.

### 7. Side effect chốt là gì?
Thực hiện **cả hai** cơ chế revalidate trên Next.js:
* `revalidateTag(collection)`: Để xóa cache các trang danh sách/danh mục chứa nội dung đó (ví dụ trang list tin tức).
* `revalidatePath(path)`: Để xóa cache chính xác trang chi tiết của nội dung đó (ví dụ trang chi tiết tin tức `/blog/huong-dan-onboarding-ulink`).

### 8. Có cần retry nếu webhook fail không?
* **Không cần cơ chế hàng đợi retry phức tạp** (exponential backoff) vì Directus Flow không hỗ trợ sẵn hàng đợi tự động.
* **Giải pháp thay thế:**
  1. Ghi nhận lỗi chi tiết tại Directus Flow run logs để Admin/Dev có thể theo dõi.
  2. Phía Next.js cấu hình bộ nhớ đệm có thời hạn (Cache TTL fallback) ví dụ 1 tiếng (`revalidate = 3600` giây). Nếu Webhook thất bại, bộ nhớ đệm vẫn tự động được cập nhật sau tối đa 1 giờ khi có người dùng truy cập.

### 9. Nếu retry, retry bao nhiêu lần, backoff thế nào?
* **Cơ chế mặc định:** Gửi webhook 1 lần duy nhất, thất bại thì log lỗi và dựa vào cache TTL của Next.js làm dự phòng.
* **Nếu dùng script custom:** Thử lại **tối đa 3 lần, giãn cách cố định 5 giây** giữa các lần gửi (flat delay) trước khi ghi nhận lỗi hẳn.

### 10. Có cần log/audit từng lần bắn webhook không?
* **Có**. Bật tính năng **Log Activity** trong Directus Flows.
* **Chi tiết:** Directus sẽ tự động lưu lại lịch sử mỗi lần chạy Flow, bao gồm: thời gian kích hoạt, payload gửi đi và mã trạng thái HTTP nhận được từ API Next.js.
