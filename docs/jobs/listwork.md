Đúng thứ tự nên làm cho `backend Directus only` từ trạng thái hiện tại:

<!-- 1. **Chốt baseline schema.** Giữ [SCHEMA.md](C:\Users\thanh\Desktop\PathtechProject\ulink-b2b-platform\directus\SCHEMA.md) làm doc chuẩn theo [bootstrap.mjs](C:\Users\thanh\Desktop\PathtechProject\ulink-b2b-platform\directus\bootstrap.mjs). Từ đây đổi schema ở đâu thì sync cả 2 chỗ. -->

<!-- 2. **Kiểm tra bootstrap trên instance sạch.** Dựng Directus/Postgres/Redis mới, chạy bootstrap, xác nhận tạo đủ collections, relations, roles, policies, permissions, singletons, seed. Bước này khóa nền móng. -->

<!-- 3. **Khóa RBAC thật chắc.** Test 4 role `Admin`, `Editor`, `Sales`, `Customer`. Xác nhận row-level filters chạy đúng, nhất là `orders`, `order_items`, `invoices`, `deliveries`, `customers`, `rfq_requests`. -->

<!-- 4. **Chốt access model public/anonymous.** Quyết định rõ public có được đọc published content trực tiếp từ Directus không. Quyết định rõ anonymous RFQ có đi qua Directus permission hay luôn đi qua server token. (Đã chốt đi qua BFF Route dùng server token). -->

<!-- 5. **Bật i18n trong Directus.** Enable Translations cho text-bearing collections, tạo `vi/en/ja`, chốt fallback `vi`. Bootstrap chưa làm phần này. -->

<!-- 6. **Bổ sung DB indexes.** Done: migration-tracked indexes added under `directus/sql/migrations/2026-06-10-add-query-indexes.sql` and verified on local Postgres. -->

7. **Chốt media/storage policy.** Quy định loại file, max size, folder convention, naming convention, xóa file, object storage hay local uploads. Không chốt sớm thì sau bẩn kho file.

8. **Setup email/auth vận hành.** Cấu hình mail cho Directus, reset password, invite user, onboarding customer user, link `directus_users` với `customers`.

9. **Làm Directus Flows.** Ít nhất cần:
   - publish content -> webhook
   - SKU create/update/publish -> cache hook
   - RFQ created -> notify Sales / assign owner
   - order/invoice/delivery create-update -> outbound webhook future ERP

10. **Chốt import/process cho dữ liệu thương mại.** Quy định CSV import cho `customers/orders/invoices/deliveries`, validation rules, idempotent key `erp_ref`, ai được import, rollback khi import lỗi.

11. **Setup backup/recovery.** DB dump, uploads backup, off-box storage, restore drill thật. Không test restore = chưa có backup đáng tin.

12. **Setup monitoring/logging.** Health check `/server/health`, container health, CPU/RAM/disk, Postgres/Redis up, log rotation, alert khi service down.

13. **Setup hardening production.** HTTPS, reverse proxy, CORS, secret rotation, scoped tokens, admin password policy, review activity log.

14. **Chạy UAT backend cuối.** Test publish flow, permission isolation, translations, file upload, RFQ flow, import flow, backup restore, webhook flow. Qua bước này mới gọi là hoàn thiện setup.

**Đã xong trước bước 1**
- collections
- relations
- roles
- policies
- permissions
- singletons
- seed mẫu
- `SCHEMA.md` sync theo bootstrap

**Nếu muốn làm nhanh, ưu tiên 5 bước kế tiếp**
1. bootstrap clean verify  
2. RBAC verify  
3. i18n enable  
4. indexes  
5. Flows/webhooks

Muốn, tôi tách tiếp thành checklist `P1 / P2 / P3` hoặc `1 ngày / 3 ngày / 1 tuần`.
