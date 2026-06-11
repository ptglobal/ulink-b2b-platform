**Publish content -> webhook**
- Trigger chính xác là gì: `create`, `update`, `status -> published`, hay cả 3?
- Có bắn khi `unpublish/archive` không?
- Áp cho collection nào: `products`, `pages`, `blog_posts`, `case_studies`, `regional_hubs`, `documents`, hay all content?
- Bắn theo 1 record hay bulk batch?
- Payload cần field gì: `collection`, `id`, `slug`, `locale`, `status`, `updated_at`, `published_at`?
- Endpoint đích là 1 URL chung hay nhiều URL theo loại content?
- Side effect chốt là gì: `revalidateTag`, `revalidatePath`, cache prime, hay cả hai?
- Có cần retry nếu webhook fail không?
- Nếu retry, retry bao nhiêu lần, backoff thế nào?
- Có cần log/audit từng lần bắn webhook không?

**SKU create/update/publish -> cache hook**
- Trigger chạy khi nào: `create`, `update`, `publish`, `unpublish`, `archive`?
- Cache action là `prime`, `invalidate`, hay `prime + invalidate`?
- Khi SKU từ `draft -> published`, có prime cache ngay không?
- Khi SKU từ `published -> draft/archived`, cache có xóa ngay không?
- Key chuẩn chốt là gì: `sku:{code-lowercased}` hay còn alias khác?
- Có normalize `sku_code` bằng trim / uppercase / lowercase không?
- Nếu đổi `sku_code`, old key có xóa không?
- Field change nào làm invalidate: `sku_code`, `product`, `pack_size`, `unit`, `attributes`, `status`?
- Cache miss path có phép đọc Directus rồi fill lại không?
- TTL cố định `1h` hay khác theo SKU?
- Bulk update nhiều SKU thì xử lý từng item hay batch job?

**RFQ created -> notify Sales / assign owner**
- Owner assign tự động hay manual triage?
- Rule assign theo `hub`, `industry`, round-robin, load-based, hay fixed owner?
- Nếu `assigned_sales` null thì ai nhận notify?
- Notify qua kênh nào: email, Directus notification, Slack, Teams, cả 3?
- Notify ngay khi create hay sau validate / anti-spam / dedupe?
- RFQ status ban đầu là gì: `new`, `triaged`, hay `unassigned`?
- Có auto-change status sau assign không?
- Có SLA/timeout để reassign nếu Sales chưa xử lý không?
- Sales cần thấy full payload hay chỉ summary?
- Có cần audit trail: ai assign, lúc nào, vì sao?
- Dedupe RFQ trùng email/phone/company có chặn không?
- Nếu notify fail nhưng record đã tạo, xử lý thế nào?

**order / invoice / delivery create-update -> outbound webhook future ERP**
- Đây là push outbound ngay hay event log để ERP pull sau?
- 1 webhook chung hay 3 webhook riêng cho `orders`, `invoices`, `deliveries`?
- Trigger nào bắn: `create`, `update`, `status change`, `delete`, `soft delete`, hay subset?
- Có bắn khi field không liên quan đổi không?
- Payload là full record hay delta patch?
- Có include `erp_ref` trong payload không?
- Idempotency key chốt là gì: `erp_ref`, `id`, hay `collection:id:version`?
- Nếu `erp_ref` null thì xử lý sao?
- Retry policy thế nào nếu ERP down?
- Có dead-letter / failed queue không?
- ERP trả 4xx vs 5xx thì flow khác nhau không?
- Khi ERP chưa tồn tại, endpoint đích là mock, stub, hay reserved contract thôi?
- Có cần staging/prod endpoint tách riêng không?
- Delete/cancel có bắn webhook không?
- Status transitions nào phải bắn: `pending -> confirmed`, `processing -> shipped`, `shipped -> completed`, `unpaid -> paid`, v.v.?

**Import / process dữ liệu thương mại**
- CSV import áp cho collection nào: `customers`, `orders`, `invoices`, `deliveries`, `order_items`?
- Ai được import: Admin, Sales, role riêng?
- Import qua Directus UI hay endpoint riêng?
- Validation rule tối thiểu là gì cho từng file?
- `erp_ref` bắt buộc hay optional?
- Dùng `erp_ref` làm upsert key hay `code`?
- Nếu record trùng thì update hay reject?
- Nếu file có lỗi 1 dòng, rollback toàn bộ hay partial success?
- Có preview trước import không?
- Có log số dòng created / updated / skipped / failed không?

**Ops / vận hành flow**
- Flow thuần Directus hay cần hook/endpoint custom cho case nào?
- Logic đặt trong Directus Flow hay Next.js route handler?
- Flow chạy sync hay async?
- Error handling chốt là fail fast, retry, hay log-only?
- Có alert khi flow fail không?
- Secrets / webhook token lưu ở đâu?
- Có cần phân biệt staging/prod endpoint không?
- Có cần test/smoke script cho từng flow không?
- Ai owner từng flow: Dev, BA, Sales Ops, Admin?
- Naming convention cho flow, hook, cache key chốt chưa?
- Có cần doc contract riêng cho từng flow không?

**Câu ngắn nhất để hỏi khách**
- Content publish: bắn gì, lúc nào, tới đâu?
- SKU flow: prime hay invalidate hay cả hai?
- RFQ: auto assign ai, notify qua đâu?
- ERP: outbound mức nào, payload nào, retry nào?
- Import: ai import, upsert theo gì, lỗi thì rollback hay không?

Nếu muốn, mình gom tiếp thành bảng 3 cột: `Cần hỏi / Đã có câu trả lời / Người quyết`.