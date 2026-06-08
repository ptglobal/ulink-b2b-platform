# Skill 01 — Yêu cầu Phần mềm (SRS) | Nguồn: ULINK-AD-01

> Đây là **baseline yêu cầu** của toàn dự án. Mọi tính năng phải truy vết về một mã FR ở đây. Mọi quyết định kỹ thuật phải tôn trọng một NFR ở đây.

## 1. Phạm vi sản phẩm

**Trong phạm vi (8 tuần):**
- Website marketing công khai (trang chủ, Giới thiệu)
- 5 Cụm vùng (Regional Hubs)
- Danh bạ Sản phẩm có tìm kiếm SKU
- Giải pháp theo Ngành
- Trung tâm Tài nguyên
- Quick Order / RFQ
- Toàn bộ Cổng B2B (đăng nhập, dashboard, lịch sử đơn, lịch giao hàng, công nợ, đặt lại)
- CMS 17 phân hệ
- Hạ tầng nội dung VI/EN/JP

**Ngoài phạm vi (giai đoạn này):**
- Đồng bộ ERP/CRM thời gian thực → giai đoạn Tích hợp tương lai (ADR-0003)
- Thanh toán/checkout trực tuyến → thương mại theo mô hình RFQ; công nợ theo dõi thủ công (ADR-0008)

**Giả định nền tảng (ADR-0003):** Dữ liệu đơn hàng, công nợ, giao hàng của Cổng B2B được quản lý trực tiếp trong Directus/PostgreSQL ở bản phát hành này. Cần xác nhận với ULink tại kickoff.

## 2. Thuật ngữ bắt buộc nhớ

| Thuật ngữ | Ý nghĩa |
|---|---|
| **RFQ** | Yêu cầu Báo giá — hành động thương mại B2B chính; KHÔNG có checkout online |
| **SKU** | Đơn vị lưu kho — biến thể sản phẩm bán được, có mã duy nhất |
| **Hub** | Cụm/kho vùng: Đông Văn 4, Bắc Thăng Long, Bắc Ninh, Hưng Yên, Hải Phòng |
| **TDS / MSDS** | Phiếu dữ liệu Kỹ thuật / An toàn vật liệu — file PDF tải về |
| **Công nợ** | Khoản phải thu / dư nợ của khách hàng |
| **CMS** | Hệ quản trị nội dung — bản quản trị Directus |
| **CWV** | Core Web Vitals — LCP / CLS / INP |
| **ISR/SSG/SSR** | Tái tạo tĩnh tăng dần / Sinh trang tĩnh / Kết xuất phía máy chủ |
| **RBAC** | Kiểm soát truy cập theo vai trò |
| **Operator-green** | Định nghĩa Hoàn thành: một người mở URL **production** và thấy đúng kết quả |

## 3. Người dùng và vai trò

| Vai trò | Mô tả | Xác thực |
|---|---|---|
| **Khách (Visitor)** | Ẩn danh: duyệt, tìm SKU, tải tài liệu, gửi RFQ | Không |
| **Khách hàng (Customer)** | B2B đã xác thực; chỉ thấy đơn/hóa đơn/giao hàng của chính mình | Có |
| **Biên tập (Editor)** | Quản lý + publish nội dung; KHÔNG quản trị users/roles | Có (admin) |
| **Kinh doanh (Sales)** | Quản lý RFQ, đơn, hóa đơn, giao hàng, hồ sơ khách | Có (admin) |
| **Quản trị (Admin)** | Toàn quyền hệ thống | Có (admin) |

## 4. Yêu cầu chức năng (FR) — 20 mục

> Độ ưu tiên: **P1** = lõi/cần để bắt đầu · **P2** = cần khi xây · **P3** = bàn giao.

| ID | Yêu cầu | Phân hệ | ƯT |
|---|---|---|---|
| **FR-01** | Trang chủ: hero, giải pháp lõi, giải pháp theo ngành, đối tác, case study, teaser tài nguyên, CTA quick-RFQ, tín hiệu tin cậy — do CMS điều khiển, sắp xếp được | Trang chủ | P1 |
| **FR-02** | 5 Cụm vùng với SLA giao hàng, năng lực kho, đội kỹ thuật, tổng quan cụm | Cụm vùng | P2 |
| **FR-03** | Duyệt cây danh mục sản phẩm (Cleanroom, Packaging + con) | Sản phẩm | P1 |
| **FR-04** | Tìm kiếm SKU; tra cứu có cache trả về **< 50 ms khi cache hit** | SP / Quick Order | P1 |
| **FR-05** | Chi tiết SP: thông số kỹ thuật, tải TDS/MSDS, yêu cầu mẫu, thêm vào giỏ RFQ | Sản phẩm | P1 |
| **FR-06** | Lọc SP/giải pháp theo ngành: Điện tử, Dược, Mỹ phẩm, F&B | Ngành | P2 |
| **FR-07** | Trung tâm Tài nguyên: tài liệu kỹ thuật, ISO, case study, blog & tin, trung tâm tải | Tài nguyên | P2 |
| **FR-08** | Quick Order: nhập SKU, tải số lượng hàng loạt, giỏ RFQ, gửi yêu cầu | Quick Order | P1 |
| **FR-09** | Gửi RFQ định tuyến tới Sales + vòng đời (new → quoted → won/lost) | RFQ | P1 |
| **FR-10** | Xác thực khách hàng: đăng ký + đăng nhập qua Directus | Cổng | P1 |
| **FR-11** | Dashboard cổng: tổng hợp đơn, công nợ, giao hàng sắp tới | Cổng | P2 |
| **FR-12** | Lịch sử đơn: danh sách + chi tiết đơn của chính khách (theo dòng) | Cổng | P1 |
| **FR-13** | Lịch giao hàng: các đợt sắp tới và trễ của đơn của khách | Cổng | P2 |
| **FR-14** | Công nợ: hóa đơn, số dư, hạn thanh toán | Cổng | P1 |
| **FR-15** | Đặt lại: sao chép dòng hàng đơn cũ vào giỏ RFQ mới | Cổng | P2 |
| **FR-16** | CMS CRUD cho toàn bộ 17 phân hệ nội dung + quản trị | CMS | P1 |
| **FR-17** | Nội dung đa ngôn ngữ VI / EN / JP | i18n | P1 |
| **FR-18** | Quy trình publish/unpublish; chỉ nội dung đã publish mới công khai | CMS | P1 |
| **FR-19** | RBAC: Admin / Editor / Sales / Customer | Bảo mật | P1 |
| **FR-20** | Trang Giới thiệu: tổng quan, năng lực lõi, bền vững, tuyển dụng, liên hệ | Giới thiệu | P2 |

### Thứ tự ưu tiên triển khai gợi ý
1. **P1 nền tảng**: FR-16/17/18/19 (CMS + i18n + publish + RBAC) — vì đây là backbone.
2. **P1 công khai**: FR-01/03/04/05/08/09 (trang chủ + sản phẩm + SKU + RFQ).
3. **P1 cổng**: FR-10/12/14 (auth + lịch sử đơn + công nợ).
4. **P2**: FR-02/06/07/11/13/15/20.

## 5. Yêu cầu phi chức năng (NFR) — 12 mục

| ID | Nhóm | Yêu cầu | Mục tiêu / Đo lường | Kiểm chứng |
|---|---|---|---|---|
| **NFR-01** | Hiệu năng | Tốc độ trang desktop | PageSpeed ≥ 90; CWV "tốt" | Lighthouse CI |
| **NFR-02** | Hiệu năng | Tra cứu SKU Quick Order | **< 50 ms khi cache hit (Redis)** | Log endpoint / k6 |
| **NFR-03** | Tương thích | Trình duyệt | Chrome, Edge, Safari (hiện hành − 1) | Ma trận đa trình duyệt |
| **NFR-04** | Khả dụng | Responsive | Desktop / Tablet / Mobile | Ma trận QA thiết bị |
| **NFR-05** | Bảo mật | Truyền tải | HTTPS toàn bộ; HSTS | Quét SSL |
| **NFR-06** | Bảo mật | Kiểm soát truy cập | Theo vai trò + theo dòng | Diễn tập vai trò |
| **NFR-07** | Bảo mật | Lạm dụng form | Turnstile + honeypot + rate-limit | Kiểm thử flood |
| **NFR-08** | i18n | Ngôn ngữ | VI/EN/JP + hreflang | Demo chuyển ngôn ngữ |
| **NFR-09** | SEO | Lập chỉ mục | URL, metadata, schema markup đúng | Rich-results test |
| **NFR-10** | Tin cậy | Luồng đặt hàng | **Không lỗi Nghiêm trọng (S1)** trên RFQ/Đơn | Bảng lỗi zero-critical |
| **NFR-11** | Bảo trì | Chất lượng mã | Cổng lint/format/typecheck + tài liệu | Cổng CI + review |
| **NFR-12** | Khả chuyển | Triển khai | Docker hóa, cấu hình env, tái triển khai được | Diễn tập tái triển khai |

## 6. Giao diện ngoài (tóm tắt — chi tiết ở AD-05/06)

- **UI**: Hệ thiết kế "Japanese Industrial Minimalism", Tailwind + Shadcn/UI, WCAG 2.1 AA.
- **API phần mềm**: Directus REST/GraphQL + 2 route handler (`GET /api/sku/{code}` cache Redis <50ms, `POST /api/rfq` chống spam) + Cloudflare Turnstile + ERP interface (tương lai).
- **Truyền thông**: HTTPS toàn bộ; publish nội dung → webhook Directus Flow → revalidate ISR + làm nóng cache SKU; thông báo RFQ mới tới Sales qua Flows.

## 7. Tiêu chí nghiệm thu (Definition of Done = operator-green)

> CI-green và staging-green **chưa đủ** — một người phải mở URL **production** và xác nhận kết quả đúng, đồng thời danh mục UAT phải được ký.

| Tiêu chí | Chứng minh bằng |
|---|---|
| Ổn định Chrome/Edge/Safari | Ma trận QA đa trình duyệt + demo trực tiếp |
| Không lỗi Nghiêm trọng luồng đặt hàng | E2E đạt; bảng lỗi zero-critical |
| KPI tải trang (PageSpeed ≥ 90 / CWV tốt) | Báo cáo Lighthouse CI |
| Dữ liệu sản phẩm & hub hiển thị đúng | QA nội dung so nguồn; khách review |
| SEO lập chỉ mục đúng | sitemap.xml, schema checker, hreflang |
| Tra cứu SKU < 50 ms (cache hit) | Đo thời gian endpoint |

## 8. Ma trận truy vết (RTM) — FR → tài liệu → kiểm chứng

| FR | Đặc tả CN (AD-02) | Thiết kế | Kiểm chứng |
|---|---|---|---|
| FR-01 | §1 Trang chủ | AD-06 | UAT render trang chủ |
| FR-02 | §2 Cụm vùng | AD-04, AD-06 | TEST-02 hubs |
| FR-03/05 | §3 Giải pháp/SP | AD-04, AD-06 | TEST-02 catalog |
| FR-04/08 | §3, §6 Tìm SKU & Quick Order | AD-05 (/api/sku) | k6 + TEST-02 |
| FR-06 | §4 Ngành | AD-06 | TEST-02 ngành |
| FR-07 | §5 Tài nguyên | AD-04, AD-06 | TEST-02 tài nguyên |
| FR-09 | §6 RFQ | AD-05 (/api/rfq), AD-04 | TEST-02 RFQ; NFR-10 |
| FR-10/19 | §7 Cổng; §8 CMS | AD-07 | Diễn tập vai trò |
| FR-11…15 | §7 Cổng B2B | AD-04, AD-07 | TEST-02 cổng |
| FR-16/18 | §8 Quản trị CMS | AD-04 | Diễn tập CRUD CMS |
| FR-17 | Xuyên suốt i18n | AD-06 | Demo chuyển ngôn ngữ |
| FR-20 | §9 Giới thiệu | AD-06 | TEST-02 giới thiệu/liên hệ |

## Checklist khi code một FR
- [ ] Đã đọc đặc tả hành vi tương ứng trong AD-02 (skill 02)?
- [ ] Đã kiểm tra schema dữ liệu trong AD-04 (skill 04)?
- [ ] Tính năng có tôn trọng NFR liên quan (đặc biệt NFR-02, NFR-06, NFR-10)?
- [ ] Có truy vết ngược về FR-xx rõ ràng?
- [ ] Có kế hoạch kiểm chứng (UAT) tương ứng?
