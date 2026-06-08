# Skill 10 — Quy ước Lập trình, Chất lượng & Definition of Done | Nguồn: AD-01/02/03 + ENG/PROC/TEST/REV

> Skill cấp senior: gom mọi ràng buộc kỹ thuật, cổng chất lượng và định nghĩa "xong" rải rác trong tài liệu thành một nơi. Đây là **bộ luật kỹ thuật** áp cho mọi PR, mọi repo.
>
> Ghi chú nguồn: Các mã `ENG-02/06`, `PROC-04`, `TEST-04`, `REV-01` được tài liệu AD tham chiếu nhưng không định nghĩa đầy đủ trong 7 file AD-01..07. Phần dưới bám sát nội dung tài liệu nêu rõ; những mục đánh dấu **[Khuyến nghị senior]** là thực hành tốt bổ sung, cần xác nhận với tài liệu ENG gốc nếu có.

## 1. Ràng buộc mã nguồn (AD-01 §2.5)

Mọi mã phải đạt 4 thuộc tính + Definition of Done:

| Thuộc tính | Nghĩa thực tế khi review |
|---|---|
| **Đầy đủ (complete)** | Không TODO treo trên đường đi chính; xử lý đủ luồng chính + thay thế + ngoại lệ (theo UC ở skill 02) |
| **Sạch (clean)** | Đặt tên rõ, hàm nhỏ một trách nhiệm, không lặp; tuân lint/format |
| **Kế thừa được (maintainable)** | Người mới đọc hiểu; có tài liệu/chú thích chỗ cần; ranh giới có kiểu |
| **Mở rộng được (extensible)** | Tăng trưởng cộng thêm — thêm file/module, không sửa mã không liên quan (AD-03 §9) |

## 2. Định nghĩa Hoàn thành — "operator-green" (AD-01 §6)

> **CI-green và staging-green CHƯA đủ.** Một người phải mở URL **production** và xác nhận kết quả đúng, đồng thời **danh mục UAT phải được ký**.

Thang Definition of Done cho một tính năng:
1. Code đạt 4 thuộc tính (§1) + qua review (REV-01).
2. Qua mọi cổng CI liên quan (§4).
3. Truy vết rõ về FR-xx (skill 01) và hiện thực đủ BR-xx (skill 02 §6).
4. Deploy staging → smoke test.
5. **Operator mở URL production → thấy đúng** → UAT ký.

## 3. Quy ước lập trình (ENG-02) + ranh giới (ENG-06)

### 3.1. Ranh giới bắt buộc (ENG-06)
- **Tầng truy cập dữ liệu**: component KHÔNG gọi Directus SDK trực tiếp → qua `@/lib/directus` (AD-05 §3, skill 08). Thay đổi backend không được lan vào component.
- **Chỉ 2 route handler tùy biến** (`/api/sku`, `/api/rfq`) — ADR-0007.
- **Schema thay đổi cộng thêm + migration**; đổi tên/xóa phá vỡ cần **migration + một ADR** (AD-04 §10).
- **Vấn đề xuyên suốt áp đồng nhất** (i18n, a11y, SEO, lỗi) qua cơ chế dùng chung — **không vá lẻ theo trang** (AD-06 §10).

### 3.2. Quy ước cụ thể [Khuyến nghị senior, nhất quán tài liệu]
- TypeScript `strict`; không `any` ngầm; type/contract dùng chung qua `@ulink/contracts` (skill 08/09).
- Kiểm tra đầu vào ngoài bằng **zod** phía server trước khi dùng (AD-07 §6).
- Mọi truy vấn danh sách có `limit` — không truy vấn không chặn (AD-04 §2, AD-05 §2).
- Đọc công khai chỉ `status = published` (BR-01).
- Tiền tệ `decimal(15,2)`, VND — không float (AD-04 §2).
- Không hard-code: màu → token; chuỗi → next-intl (skill 06).
- Lỗi: phong bì JSON đồng nhất, không lộ stack trace (AD-05 §4, AD-07 §6).
- Secrets chỉ ở server/env; chỉ `NEXT_PUBLIC_*` ra client (AD-07 §7).
- Commit nhỏ, có chủ đích; mọi biến env mới ghi vào `.env.example`.

## 4. Cổng chất lượng CI (PROC-04 / TEST-04 / REV-01 + NFR)

> Map đầy đủ ở skill 09 §6. Tóm tắt theo NFR:

| Cổng | NFR / nguồn | Công cụ gợi ý |
|---|---|---|
| Lint + Format + Typecheck | NFR-11 | ESLint, Prettier, tsc |
| Review bắt buộc trước merge | NFR-11 / REV-01 | PR review ≥ 1 approver |
| Unit/integration/E2E | NFR-10 (zero-critical RFQ/Đơn) | Vitest/Jest + Playwright |
| Lighthouse CI ≥ 90, CWV tốt | NFR-01 / PROC-04 / TEST-04 | Lighthouse CI |
| SKU < 50ms (cache hit) | NFR-02 | k6 / đo endpoint |
| i18n key-check (thiếu khóa → FAIL) | NFR-08 / AD-06 §7 | script kiểm catalog |
| Diễn tập vai trò + chéo tài khoản | NFR-06 / BR-10 | test RBAC |
| Quét SSL/HSTS/header | NFR-05 | SSL Labs / header scan |
| Kiểm thử flood chống spam | NFR-07 / BR-08 | script flood |
| Secret scan | AD-07 §11 | gitleaks / bundle scan |

## 5. Chiến lược kiểm thử theo tầng [Khuyến nghị senior]

| Tầng | Kiểm gì | Ưu tiên |
|---|---|---|
| Unit | Hàm thuần: parser CSV SKU, builder SEO/JSON-LD, zod schema | Cao |
| Integration | `@/lib/directus` query đúng filter/limit/publish; row-level | Cao |
| API/route | `/api/sku` (hit/miss/404), `/api/rfq` (200/422/429/502) đúng mã lỗi | **Bắt buộc** (NFR-10) |
| E2E | UC-04, UC-12, UC-14, UC-16, UC-19 (luồng then chốt) | **Bắt buộc** |
| Bảo mật | Chéo tài khoản A↔B, diễn tập vai trò | **Bắt buộc** (NFR-06) |
| Hiệu năng | Lighthouse, k6 SKU | Cao (NFR-01/02) |

> Trọng tâm: **luồng RFQ/Đơn (UC-12/13/16) phải zero-critical** — đây là điều kiện nghiệm thu cứng.

## 6. Quy trình Git & PR [Khuyến nghị senior, hỗ trợ ADR-0002 hai luồng song song]
- Nhánh theo tính năng, gắn FR/UC vào tên/PR (vd `feat/FR-09-rfq-submit`).
- PR mô tả: tính năng làm gì, FR/BR liên quan, đã test gì, cổng nào đã xanh.
- Không merge khi cổng chất lượng đỏ; review bắt buộc (REV-01).
- Push nhánh mới, không push thẳng main; tạo PR qua CLI phù hợp.
- Thay đổi schema/contract phá vỡ → ADR + bump semver + thông báo downstream (skill 09 §3).

## 7. Quan trắc & vận hành (AD-03 §7)
- Nhật ký hoạt động Directus cho kiểm toán.
- Đo thời gian đường SKU (chứng minh NFR-02).
- Metrics/uptime của host; sao lưu PostgreSQL tự động (giảm rủi ro VPS đơn — AD-03 §11).
- Cache SKU: làm nóng/vô hiệu tường minh khi publish (ADR-0005) — không để cache lệch.

## 8. Lịch 8 tuần & hai luồng song song (ADR-0002) — bối cảnh ưu tiên
- Có tuần riêng cho i18n/hiệu năng/QA + tuần UAT thật.
- Hai luồng: **A — Site & Nội dung** (owner AD-06) và **B — Nền tảng & Thương mại** (owner AD-03/04/05/07).
- ERP interface stub đặt ở **Tuần 6**; NestJS hoãn (ADR-0007).
- → Ưu tiên P1 nền tảng (CMS/i18n/publish/RBAC) trước, rồi P1 công khai + cổng (xem skill 01 §4).

## Checklist senior trước khi mở PR
- [ ] Truy vết rõ FR-xx + hiện thực đủ BR-xx liên quan?
- [ ] Đạt 4 thuộc tính mã (đầy đủ/sạch/kế thừa/mở rộng)?
- [ ] Ranh giới đúng (DAL, 2 route handler, contracts)?
- [ ] Test phủ luồng chính + thay thế + ngoại lệ (mã lỗi đúng)?
- [ ] Cổng chất lượng liên quan đã cấu hình & xanh?
- [ ] Không hard-code màu/chuỗi; không lộ secret; danh sách có `limit`?
- [ ] Thay đổi phá vỡ → có migration/ADR/semver?
- [ ] Có kế hoạch đạt operator-green (không chỉ CI-green)?
