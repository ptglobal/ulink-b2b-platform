Repo này đã có khung lớn trong `directus/SCHEMA.md` + `directus/bootstrap.mjs`. Muốn gọi là `Directus only setup hoàn thiện`, làm hết list này.

**1. Infra**
1. Tạo `.env` backend đủ biến: `POSTGRES_*`, `DIRECTUS_KEY`, `DIRECTUS_SECRET`, `DIRECTUS_ADMIN_EMAIL`, `DIRECTUS_ADMIN_PASSWORD`, `DIRECTUS_PUBLIC_URL`, Redis, CORS.
2. Chạy `docker compose up -d`. Verify `directus`, `postgres`, `redis` healthy.
3. Gắn domain `cms...`, reverse proxy `:8055`, bật HTTPS + HSTS.
4. Chốt storage strategy: local `directus/uploads` hay object storage như R2/S3.
5. Chốt `PUBLIC_URL`, CORS origin, cookie/session policy cho dev + prod.

**2. Bootstrap Core**
6. Chạy `cd directus && npm install && npm run bootstrap`.
7. Verify tạo đủ collections: `hero_banners`, `partners`, `product_categories`, `products`, `product_skus`, `documents`, `regional_hubs`, `industries`, `blog_posts`, `case_studies`, `iso_certifications`, `pages`, `customers`, `orders`, `order_items`, `invoices`, `deliveries`, `rfq_requests`.
8. Verify tạo đủ singletons: `site_settings`, `homepage`.
9. Verify relations đúng: self-ref category, product-sku, product-industry, product-files, customer-user, order/invoice/delivery links.
10. Verify rerun bootstrap idempotent, không nhân bản role/policy/seed.
11. Đồng bộ schema thật với `SCHEMA.md`. Không để UI sửa tay làm lệch spec.

**3. Content Model + Admin UX**
12. Check từng field type đúng: `string`, `text`, `json`, `decimal`, `date`, `uuid`, relation, file.
13. Check `required`, `unique`, `default`, `enum/status`, `sort`, hidden/read-only fields.
14. Setup interface tốt cho admin: image picker, file picker, textarea, JSON editor, relation display.
15. Setup display template/list view/filter preset cho collection sales dùng nhiều: `rfq_requests`, `orders`, `invoices`, `deliveries`.
16. Setup note/help text cho field dễ nhập sai: `erp_ref`, `paid_status`, `line_items`, SEO fields.
17. Bật system timestamps và audit fields nếu cần hiển thị trong admin.

**4. Auth + RBAC**
18. Tạo đủ roles: `Admin`, `Editor`, `Sales`, `Customer`.
19. Cấu hình `public role`: chỉ read content `published`; không chạm portal data.
20. Cấu hình `Editor`: CRUD content + publish/unpublish; không user/role/policy.
21. Cấu hình `Sales`: CRUD `rfq_requests`, `customers`, `orders`, `order_items`, `invoices`, `deliveries`; read content.
22. Cấu hình `Customer`: chỉ read dữ liệu own qua row-level filter theo `$CURRENT_USER`.
23. Verify `customers.user -> directus_users` map đúng cho portal auth.
24. Chốt customer onboarding flow: create user, assign `Customer` role, link record `customers`, reset password/invite mail.
25. Tạo scoped `DIRECTUS_TOKEN` cho server-side writes. Không dùng admin token ở browser.

**5. i18n**
26. Bật `Translations` cho mọi collection có text-bearing fields.
27. Bật đủ locales: `vi`, `en`, `ja`.
28. Chốt fallback policy: thiếu bản dịch -> fallback `vi`.
29. Chốt launch policy: VI 100%, EN trang chính 100%, JP key pages trước.
30. Verify frontend query lấy đúng translation, không trả raw key hay field rỗng.

**6. Files + Media**
31. Chốt rule upload: loại file cho phép, max size, naming convention, folder convention.
32. Bắt editor nhập alt text/caption nơi cần SEO + a11y.
33. Check `documents` cho TDS/MSDS/cert/brochure hoạt động đúng với file relation.
34. Chốt media URL/origin để frontend load ổn trong prod.

**7. Flows + Automation**
35. Tạo Flow: publish content -> webhook sang frontend -> revalidate ISR.
36. Tạo Flow: create/update/publish `product_skus` -> invalidate hoặc prime Redis cache cho `/api/sku`.
37. Tạo Flow: RFQ mới -> notify Sales, set status `new`, optional auto-assign theo hub.
38. Tạo Flow: order/invoice/delivery đổi trạng thái -> optional email/notification cho customer hoặc sales.
39. Giữ sẵn webhook contract cho future ERP trên `orders`, `invoices`, `deliveries` dùng `erp_ref`.

**8. Data Seed + Contract Test**
40. Seed dữ liệu thật tối thiểu cho content, SKU, hub, customer, order, invoice, delivery, RFQ.
41. Verify `/api/sku/{code}` đọc đúng `product_skus`, cache hit/miss đúng.
42. Verify `/api/rfq` ghi đúng `rfq_requests`, không lộ token, không bypass validation.
43. Verify public REST/GraphQL chỉ đọc content `published`.
44. Verify customer A không đọc được order/invoice/delivery customer B.

**9. Security**
45. Bật HTTPS everywhere, CORS đúng origin, security headers, frame protection.
46. Bật anti-spam cho public writes: honeypot, Turnstile, Redis IP rate limit.
47. Rotate admin password, `DIRECTUS_KEY/SECRET`, server token trước go-live.
48. Giữ Directus activity log. Review least privilege trước launch.

**10. Ops**
49. Setup backup DB hằng ngày, backup `directus/uploads`, lưu off-box.
50. Test restore thật ít nhất 1 lần. Không chỉ backup suông.
51. Setup monitoring: `cms/.../server/health`, container health, CPU/RAM/disk, Redis/Postgres up.
52. Setup log retention/rotation, alert khi Directus down hay error spike.
53. Viết runbook: deploy, bootstrap lại, rotate secrets, restore backup, onboard user.

**11. Handover**
54. Viết guide cho `Editor`, `Sales`, `Admin`: publish, translations, SEO, RFQ triage, orders/invoices/deliveries, user roles.
55. Chạy UAT checklist cuối: publish loop, i18n, RFQ, portal row-level, file upload/download, cache, backup restore.

Thiếu lớn nhất hiện giờ, theo repo này: `translations`, `Flows/webhooks`, `customer onboarding/auth flow`, `anti-spam/rate-limit`, `ops prod`.

Muốn, tôi tách tiếp thành `đã có sẵn` vs `chưa làm` theo đúng `bootstrap.mjs` hiện tại.