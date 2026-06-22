# QA — Test API Regional Hubs (List & Detail)

> **URL Directus:** http://localhost:8055  
> **Swagger UI:** http://localhost:8056  
> **Tài liệu này** hướng dẫn test 2 API: Lấy danh sách Regional Hubs và Lấy chi tiết 1 Regional Hub.

---

## Mục lục

1. [Xác thực (Authentication)](#1-xác-thực-authentication)
2. [API 1 — Lấy danh sách Regional Hubs](#2-api-1--lấy-danh-sách-regional-hubs)
3. [API 2 — Lấy chi tiết Regional Hub](#3-api-2--lấy-chi-tiết-regional-hub)
4. [Dữ liệu seed (mẫu)](#4-dữ-liệu-seed-mẫu)
5. [Các test case](#5-các-test-case)
6. [Schema Response](#6-schema-response)

---

## 1. Xác thực (Authentication)

Tất cả API Directus yêu cầu xác thực. Có 2 cách:

### Cách 1: Dùng Static Token (đơn giản nhất)

Dùng token đã cấu hình trong `.env`:

```
Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH
```

### Cách 2: Đăng nhập lấy Access Token

**Request:**
```bash
curl -X POST http://localhost:8055/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"admin@ulink.com\", \"password\": \"5f8859f07a20530ee9be42c4\"}"
```

**Response thành công:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJI...",
    "expires": 900000,
    "refresh_token": "xxxxxxxx..."
  }
}
```

Sau đó dùng `access_token` trong các request tiếp theo:
```
Authorization: Bearer <access_token>
```

> **Lưu ý:** Token (cách 1) không hết hạn. Access Token (cách 2) hết hạn sau 15 phút.

### Tài khoản test

| Email | Password | Role |
|-------|----------|------|
| admin@ulink.com | 5f8859f07a20530ee9be42c4 | Admin (Directus) |

---

## 2. API 1 — Lấy danh sách Regional Hubs

### Thông tin cơ bản

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:8055/items/regional_hubs` |
| **Operation ID** | `readItemsRegionalHubs` |
| **Auth** | Bắt buộc |

### Query Parameters

| Param | Kiểu | Mô tả | Ví dụ |
|-------|------|-------|-------|
| `fields` | string | Chọn fields trả về (phân tách dấu `,`) | `id,name,slug,coordinates` |
| `limit` | integer | Giới hạn số item (mặc định 100, `-1` = tất cả) | `10` |
| `offset` | integer | Bỏ qua N items đầu (phân trang) | `0` |
| `sort` | string | Sắp xếp (`-` = giảm dần) | `name` hoặc `-id` |
| `filter` | object (JSON) | Bộ lọc Directus | `{"status":{"_eq":"published"}}` |
| `search` | string | Tìm kiếm full-text | `Đông Vân` |
| `meta` | string | Metadata bổ sung | `total_count,filter_count` |

### Ví dụ curl

#### 2.1. Lấy tất cả hubs (cơ bản)

```bash
curl -X GET "http://localhost:8055/items/regional_hubs" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 2.2. Lấy hubs chỉ định fields + limit

```bash
curl -X GET "http://localhost:8055/items/regional_hubs?fields=id,name,slug,operating_status,coordinates&limit=3" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 2.3. Lọc theo status = published

```bash
curl -X GET "http://localhost:8055/items/regional_hubs?filter[status][_eq]=published" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 2.4. Sắp xếp theo tên (A → Z)

```bash
curl -X GET "http://localhost:8055/items/regional_hubs?sort=name&fields=id,name" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 2.5. Phân trang: trang 2, mỗi trang 2 items

```bash
curl -X GET "http://localhost:8055/items/regional_hubs?limit=2&offset=2&meta=total_count,filter_count" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 2.6. Lấy hubs kèm relations (industrial_zones, team_members, translations)

```bash
curl -X GET "http://localhost:8055/items/regional_hubs?fields=id,name,slug,industrial_zones.id,industrial_zones.name,team_members.name,team_members.role,translations.languages_code,translations.name&limit=5" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 2.7. Tìm kiếm bằng search

```bash
curl -X GET "http://localhost:8055/items/regional_hubs?search=VSIP" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

### Response thành công (200)

```json
{
  "data": [
    {
      "id": 1,
      "status": "published",
      "hub_code": null,
      "name": "Đông Vân 4",
      "slug": "dong-van-4",
      "province": 17,
      "district": null,
      "detail_address": "KCN Đông Vân IV, Kim Bảng, Hà Nam",
      "operating_status": "active",
      "coordinates": "20.5500,105.9100",
      "warehouse_total_area": 5000,
      "warehouse_utilized_area": 3200,
      "warehouse_available_area": 1800,
      "warehouse_storage_tons": 2000,
      "warehouse_pallets": 800,
      "standard_delivery_time": "24 giờ",
      "on_time_rate": 96.5,
      "on_time_rate_delta": "+2.1%",
      "orders_today": 45,
      "order_capacity_per_day": 100,
      "avg_delivery_time": "18 giờ",
      "person_in_charge_name": "Nguyễn Văn Hùng",
      "person_in_charge_title": "Giám đốc Hub",
      "person_in_charge_phone": "0912345678",
      "current_personnel_count": 25,
      "translations": [1, 2],
      "industrial_zones": [1, 2],
      "team_members": [1, 2]
    }
  ]
}
```

> **Lưu ý:** Khi không chỉ định `fields`, các relation fields (`translations`, `industrial_zones`, `team_members`) trả về dạng mảng ID. Để lấy chi tiết, cần chỉ định nested fields (xem ví dụ 2.6).

---

## 3. API 2 — Lấy chi tiết Regional Hub

### Thông tin cơ bản

| Mục | Giá trị |
|-----|---------|
| **Method** | `GET` |
| **URL** | `http://localhost:8055/items/regional_hubs/{id}` |
| **Operation ID** | `readSingleItemsRegionalHubs` |
| **Auth** | Bắt buộc |

### Path Parameters

| Param | Kiểu | Mô tả | Bắt buộc |
|-------|------|-------|----------|
| `id` | integer hoặc UUID | ID của hub cần lấy | ✅ |

### Query Parameters

| Param | Kiểu | Mô tả | Ví dụ |
|-------|------|-------|-------|
| `fields` | string | Chọn fields trả về | `id,name,slug,province.*` |
| `meta` | string | Metadata bổ sung | `total_count` |

### Ví dụ curl

#### 3.1. Lấy chi tiết hub id = 1 (đầy đủ)

```bash
curl -X GET "http://localhost:8055/items/regional_hubs/1" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 3.2. Lấy chi tiết hub id = 1 với chỉ định fields

```bash
curl -X GET "http://localhost:8055/items/regional_hubs/1?fields=id,name,slug,detail_address,operating_status,coordinates,on_time_rate,warehouse_total_area" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 3.3. Lấy chi tiết hub kèm province (deep relation)

```bash
curl -X GET "http://localhost:8055/items/regional_hubs/1?fields=id,name,province.name,province.code,detail_address" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 3.4. Lấy chi tiết hub kèm industrial_zones + team_members

```bash
curl -X GET "http://localhost:8055/items/regional_hubs/1?fields=id,name,industrial_zones.id,industrial_zones.name,team_members.name,team_members.role,team_members.years_experience" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

#### 3.5. Lấy chi tiết hub kèm translations (đa ngôn ngữ)

```bash
curl -X GET "http://localhost:8055/items/regional_hubs/1?fields=id,name,translations.languages_code,translations.name" ^
  -H "Authorization: Bearer Gb_HrRCaR8As6fFZpMuqi2Gfw9ZuEqOH"
```

### Response thành công (200)

```json
{
  "data": {
    "id": 1,
    "status": "published",
    "hub_code": null,
    "name": "Đông Vân 4",
    "slug": "dong-van-4",
    "province": 17,
    "district": null,
    "detail_address": "KCN Đông Vân IV, Kim Bảng, Hà Nam",
    "operating_status": "active",
    "coordinates": "20.5500,105.9100",
    "warehouse_total_area": 5000,
    "warehouse_utilized_area": 3200,
    "warehouse_available_area": 1800,
    "warehouse_storage_tons": 2000,
    "warehouse_pallets": 800,
    "standard_delivery_time": "24 giờ",
    "on_time_rate": 96.5,
    "on_time_rate_delta": "+2.1%",
    "orders_today": 45,
    "order_capacity_per_day": 100,
    "avg_delivery_time": "18 giờ",
    "person_in_charge_name": "Nguyễn Văn Hùng",
    "person_in_charge_title": "Giám đốc Hub",
    "person_in_charge_phone": "0912345678",
    "current_personnel_count": 25,
    "translations": [1, 2],
    "industrial_zones": [1, 2],
    "team_members": [1, 2]
  }
}
```

### Response lỗi

**401 Unauthorized** (thiếu hoặc sai token):
```json
{
  "errors": [
    {
      "message": "You don't have permission to access this.",
      "extensions": { "code": "FORBIDDEN" }
    }
  ]
}
```

**404 Not Found** (ID không tồn tại):
```json
{
  "errors": [
    {
      "message": "Item \"999\" doesn't exist.",
      "extensions": { "code": "ITEM_NOT_FOUND" }
    }
  ]
}
```

---

## 4. Dữ liệu seed (mẫu)

Sau khi chạy bootstrap, hệ thống có **5 regional hubs** sau:

| # | name | slug | Tỉnh | Địa chỉ | operating_status | on_time_rate |
|---|------|------|------|---------|------------------|--------------|
| 1 | Đông Vân 4 | `dong-van-4` | Hà Nam | KCN Đông Vân IV, Kim Bảng | active | 96.5% |
| 2 | Bắc Thăng Long | `bac-thang-long` | Hà Nội | Đông Anh, Hà Nội | active | 98.2% |
| 3 | VSIP Bình Dương | `vsip-binh-duong` | Bình Dương | KCN VSIP II-A, Tân Uyên | active | 95.0% |
| 4 | VSIP Hải Phòng | `vsip-hai-phong` | Hải Phòng | KCN VSIP Hải Phòng, Thuỷ Nguyên | active | 94.8% |
| 5 | Long Thành | `long-thanh` | Đồng Nai | KCN Long Thành, Long Thành | active | 97.5% |

### Industrial Zones (theo hub)

| Hub | Industrial Zone |
|-----|----------------|
| Đông Vân 4 | KCN Đông Vân IV, KCN Đồng Văn III |
| Bắc Thăng Long | KCN Bắc Thăng Long |
| VSIP Bình Dương | KCN VSIP II-A |
| VSIP Hải Phòng | KCN VSIP Hải Phòng |
| Long Thành | KCN Long Thành |

### Team Members (theo hub)

| Hub | Tên | Vai trò | Kinh nghiệm |
|-----|-----|---------|-------------|
| Đông Vân 4 | Trần Minh Đức | Kỹ sư phòng sạch | 8 năm |
| Đông Vân 4 | Lê Hoàng Nam | Quản lý kho | 5 năm |
| Bắc Thăng Long | Phạm Thị Hoa | Kỹ sư QC | 6 năm |
| VSIP Bình Dương | Nguyễn Thanh Sơn | Kỹ sư logistics | 7 năm |
| VSIP Hải Phòng | Đỗ Văn Bình | Chuyên viên ESD | 4 năm |
| Long Thành | Trịnh Minh Tuấn | Quản lý kho | 6 năm |

---

## 5. Các test case

### TC-HUB-LIST: Danh sách Regional Hubs

| ID | Tên test case | Mô tả | Expected Result |
|----|--------------|-------|-----------------|
| L01 | List — Happy path | `GET /items/regional_hubs` với token hợp lệ | 200, trả về mảng ≥ 5 hubs |
| L02 | List — Không có auth | `GET /items/regional_hubs` **không** gửi header Auth | 401 hoặc 403 |
| L03 | List — Token sai | Gửi `Authorization: Bearer invalid-token` | 401 |
| L04 | List — Chỉ định fields | Thêm `?fields=id,name,slug` | 200, mỗi item chỉ có 3 fields |
| L05 | List — Limit | Thêm `?limit=2` | 200, mảng có đúng 2 items |
| L06 | List — Offset (phân trang) | `?limit=2&offset=2` | 200, trả về items 3-4 |
| L07 | List — Sort tăng dần | `?sort=name&fields=id,name` | 200, tên sắp xếp A→Z |
| L08 | List — Sort giảm dần | `?sort=-name&fields=id,name` | 200, tên sắp xếp Z→A |
| L09 | List — Filter theo status | `?filter[status][_eq]=published` | 200, chỉ trả về hubs published |
| L10 | List — Filter theo operating_status | `?filter[operating_status][_eq]=active` | 200, chỉ trả về hubs active |
| L11 | List — Search | `?search=VSIP` | 200, trả về 2 hubs VSIP |
| L12 | List — Deep fields (relations) | `?fields=id,name,industrial_zones.name` | 200, industrial_zones có name |
| L13 | List — Meta total_count | `?meta=total_count` | 200, response có `meta.total_count` |
| L14 | List — Limit -1 (all) | `?limit=-1` | 200, trả về tất cả hubs |
| L15 | List — Filter không khớp | `?filter[status][_eq]=draft` | 200, `data` là mảng rỗng `[]` |

### TC-HUB-DETAIL: Chi tiết Regional Hub

| ID | Tên test case | Mô tả | Expected Result |
|----|--------------|-------|-----------------|
| D01 | Detail — Happy path | `GET /items/regional_hubs/1` với token hợp lệ | 200, trả về object hub id=1 |
| D02 | Detail — Không có auth | `GET /items/regional_hubs/1` không gửi Auth | 401 hoặc 403 |
| D03 | Detail — ID không tồn tại | `GET /items/regional_hubs/999` | 403 hoặc 404 |
| D04 | Detail — ID không hợp lệ | `GET /items/regional_hubs/abc` | 403 hoặc 400 |
| D05 | Detail — Chỉ định fields | `GET /items/regional_hubs/1?fields=id,name` | 200, chỉ trả về id và name |
| D06 | Detail — Deep relations (province) | `?fields=id,name,province.name` | 200, province là object có name |
| D07 | Detail — Industrial zones | `?fields=id,industrial_zones.id,industrial_zones.name` | 200, `industrial_zones` là array objects |
| D08 | Detail — Team members | `?fields=id,team_members.name,team_members.role` | 200, `team_members` là array objects |
| D09 | Detail — Translations | `?fields=id,translations.languages_code,translations.name` | 200, translations gồm vi/en |
| D10 | Detail — Kiểm tra đúng dữ liệu | `GET /items/regional_hubs/1` | Trường `name` = "Đông Vân 4", `slug` = "dong-van-4" |
| D11 | Detail — Hub khác | `GET /items/regional_hubs/2` | 200, name = "Bắc Thăng Long" |

---

## 6. Schema Response

### ItemsRegionalHubs

| Field | Kiểu | Nullable | Mô tả |
|-------|------|----------|-------|
| `id` | integer | ❌ | Primary key |
| `status` | string | ✅ | Trạng thái xuất bản (`published`, `draft`, `archived`) |
| `hub_code` | string | ✅ | Mã hub |
| `name` | string | ✅ | Tên hub |
| `slug` | string | ✅ | URL-friendly slug |
| `province` | integer \| object | ✅ | Tỉnh/thành phố (FK → vn_provinces) |
| `district` | integer \| object | ✅ | Quận/huyện (FK → vn_districts) |
| `detail_address` | string | ✅ | Địa chỉ chi tiết |
| `operating_status` | string | ✅ | Trạng thái hoạt động (`active`, ...) |
| `coordinates` | string | ✅ | Tọa độ GPS, format `"lat,lng"` |
| `warehouse_total_area` | float | ✅ | Tổng diện tích kho (m²) |
| `warehouse_utilized_area` | float | ✅ | Diện tích kho đã sử dụng (m²) |
| `warehouse_available_area` | float | ✅ | Diện tích kho còn trống (m²) |
| `warehouse_storage_tons` | integer | ✅ | Sức chứa (tấn) |
| `warehouse_pallets` | integer | ✅ | Số pallet |
| `standard_delivery_time` | string | ✅ | Thời gian giao hàng chuẩn |
| `on_time_rate` | float | ✅ | Tỷ lệ giao đúng hẹn (%) |
| `on_time_rate_delta` | string | ✅ | Biến động tỷ lệ giao hàng |
| `orders_today` | integer | ✅ | Số đơn hàng hôm nay |
| `order_capacity_per_day` | integer | ✅ | Công suất đơn hàng/ngày |
| `avg_delivery_time` | string | ✅ | Thời gian giao trung bình |
| `person_in_charge_name` | string | ✅ | Tên người phụ trách |
| `person_in_charge_title` | string | ✅ | Chức danh |
| `person_in_charge_phone` | string | ✅ | SĐT liên hệ |
| `current_personnel_count` | integer | ✅ | Số nhân sự hiện tại |
| `translations` | array | ✅ | Bản dịch (vi, en, ja) |
| `industrial_zones` | array | ✅ | Danh sách KCN liên kết |
| `team_members` | array | ✅ | Danh sách nhân sự |

### ItemsRegionalHubsTranslations

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | PK |
| `regional_hubs_id` | integer | FK → regional_hubs |
| `languages_code` | string | Mã ngôn ngữ (`vi`, `en`, `ja`) |
| `name` | string | Tên hub theo ngôn ngữ |

### ItemsHubIndustrialZones

| Field | Kiểu | Mô tả |
|-------|------|-------|
| `id` | integer | PK |
| `name` | string | Tên khu công nghiệp |
| `hub` | integer | FK → regional_hubs |
| `image` | uuid | FK → files (ảnh) |

---

## Ghi chú cho Tester

1. **Tool khuyến nghị:** Swagger UI tại http://localhost:8056 hoặc Postman/Insomnia.
2. **Windows cmd/PowerShell:** Các ví dụ curl dùng `^` để xuống dòng. Trên Linux/macOS thay bằng `\`.
3. **Directus filter syntax:** Dạng query string là `filter[field][operator]=value`. Xem thêm: https://docs.directus.io/reference/filter-rules.html
4. **Deep fields:** Để lấy dữ liệu nested, dùng cú pháp `relation.field` (ví dụ: `province.name`, `industrial_zones.name`).
5. **ID có thể thay đổi:** Các ID trong ví dụ (1, 2, ...) phụ thuộc vào thứ tự seed. Nếu DB đã reset, hãy gọi List trước để xác nhận ID.
