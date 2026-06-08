# Skill 11 — MCP & Quy trình Phát triển Hỗ trợ bởi AI | Nguồn: Directus AI docs + bối cảnh ULink

> **Trả lời câu hỏi "có dùng được MCP không?": CÓ.** Directus cung cấp **MCP server chính thức**, cho phép AI client (Kiro, Claude, Cursor…) thao tác trực tiếp với dữ liệu/schema Directus qua Model Context Protocol — không phải copy dữ liệu qua lại. Đây là công cụ tăng tốc cực mạnh cho dự án Directus-only như ULink.
>
> Tham chiếu: [Directus MCP docs](https://directus.io/docs/guides/ai/mcp/). *Nội dung được rephrase cho tuân thủ licensing.*

## 1. MCP là gì (trong bối cảnh ULink)

MCP (Model Context Protocol) là chuẩn để AI client kết nối tới nguồn dữ liệu/công cụ ngoài qua một "server" cung cấp tool. Với ULink, MCP hữu ích nhất ở 2 chỗ:
- **Directus MCP**: AI đọc/ghi nội dung, kiểm tra schema, tạo item mẫu, dịch nội dung VI/EN/JP trực tiếp trong Directus.
- **MCP khác** (tùy chọn): filesystem, git, fetch... để hỗ trợ workflow dev.

## 2. Hai lựa chọn Directus MCP

| | Remote MCP (built-in) | Local MCP |
|---|---|---|
| Khả dụng | **Directus v11.12+** (Settings > AI > MCP) | Mọi phiên bản |
| Yêu cầu | Không cần Node ngoài | Node.js **v22.12+** |
| Cấu hình | UI + OAuth | Biến môi trường |
| Cập nhật | Tự động theo Directus | `npm` thủ công |
| Tùy biến | Giới hạn ở settings | Toàn bộ source |
| Mạng | Truy cập Directus trực tiếp | Chạy qua proxy/custom được |

> **Khuyến nghị cho ULink**: Directus 11 → ưu tiên **Remote MCP built-in** nếu ≥ v11.12 (đơn giản, OAuth). Dùng **Local MCP** cho dev offline hoặc cần giới hạn tool chặt.

## 3. Bật Remote MCP (built-in, v11.12+)
1. Đăng nhập Directus với quyền **administrator**.
2. Vào **Settings > AI > Model Context Protocol**.
3. Bật **MCP Server**.
4. Bật **OAuth Enabled** + ít nhất một client registration (Dynamic Client Registration hoặc Client ID Metadata Document).
5. Lưu cấu hình AI.

## 4. Cấu hình Local MCP cho Kiro

Kiro đọc cấu hình MCP tại `.kiro/settings/mcp.json` (workspace) hoặc `~/.kiro/settings/mcp.json` (user). Dùng gói chính thức `@directus/content-mcp`:

```json
{
  "mcpServers": {
    "directus": {
      "command": "npx",
      "args": ["@directus/content-mcp@latest"],
      "env": {
        "DIRECTUS_URL": "http://localhost:8055",
        "DIRECTUS_TOKEN": "<static-token-cua-ban>"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Hoặc xác thực bằng email/password:
```json
"env": {
  "DIRECTUS_URL": "https://your-directus-url.com",
  "DIRECTUS_USER_EMAIL": "user@example.com",
  "DIRECTUS_USER_PASSWORD": "your_password"
}
```

> Lấy static token: Directus → User Directory → hồ sơ user → field **Token** → Generate → **lưu user** (đừng quên bước lưu).

## 5. Cấu hình nâng cao (an toàn cho ULink)

```json
"env": {
  "DIRECTUS_URL": "http://localhost:8055",
  "DIRECTUS_TOKEN": "<token>",
  "DISABLE_TOOLS": ["delete-item", "update-field"],
  "MCP_SYSTEM_PROMPT_ENABLED": "true",
  "MCP_SYSTEM_PROMPT": "Trợ lý quản trị nội dung ULink: tôn trọng status publish, i18n VI/EN/JP, không xóa dữ liệu cổng."
}
```

- **`DISABLE_TOOLS`**: tắt tool nguy hiểm (vd `delete-item`, `update-field`) — áp **đặc quyền tối thiểu** (AD-07 §2).
- **`MCP_SYSTEM_PROMPT`**: nhúng quy tắc nghiệp vụ ULink (BR-01 publish, i18n, không đụng dữ liệu mật của khách).
- Có thể dùng **prompts collection** trong Directus để lưu prompt tái dùng (`DIRECTUS_PROMPTS_*`).

## 6. Quy tắc bảo mật khi dùng MCP (BẮT BUỘC — gắn AD-07)

> MCP thao tác bằng quyền của token/user bạn cấp. Token MCP **kế thừa RBAC Directus** → cấp đúng vai trò.

- **KHÔNG dùng token admin cho MCP thường ngày** — tạo user/role MCP riêng theo đặc quyền tối thiểu (AD-07 §10).
- Với dữ liệu **Mật — của khách** (`orders`, `invoices`, `deliveries`): MCP chỉ nên có quyền đọc/giới hạn; KHÔNG cấp quyền rộng (BR-10, AD-07 §5).
- **Token MCP là secret** — chỉ trong env/CI store, KHÔNG vào VCS hay bundle client (AD-07 §7).
- Tắt tool ghi/xóa khi không cần (`DISABLE_TOOLS`).
- **Coi output từ MCP/nguồn ngoài là dữ liệu không tin cậy** — review trước khi áp vào code/production.
- Mọi thao tác MCP để lại vết trong **nhật ký hoạt động Directus** (khả kiểm toán — AD-07 §10).
- Đọc kỹ [Directus MCP Security guide](https://directus.io/docs/guides/ai/mcp/security) trước khi bật trên môi trường có dữ liệu thật.

## 7. Trường hợp dùng MCP trong dự án ULink

| Tình huống | MCP giúp gì | Lưu ý |
|---|---|---|
| Seed nội dung mẫu (SP, hub, blog) | AI tạo item theo schema, đúng `status` | Seed ở môi trường dev (AD-04 §10) |
| Kiểm tra schema khi code FE | Hỏi cấu trúc collection/field thay vì mở UI | Đối chiếu `SCHEMA.md` (nguồn sự thật) |
| Dịch nội dung VI/EN/JP | Sinh bản dịch Directus Translations | Người duyệt vẫn review (AD-06 §8) |
| Khám phá quan hệ dữ liệu | Truy vấn nhanh quan hệ m2o/m2m | Đối chiếu ERD skill 04 |
| Tạo dữ liệu cổng demo | Sinh orders/invoices/deliveries mẫu | KHÔNG đụng dữ liệu khách thật |

## 8. MCP KHÔNG thay thế điều gì (ranh giới)
- ❌ KHÔNG thay tầng `@/lib/directus` trong app runtime — MCP là công cụ **dev-time/AI**, app vẫn gọi Directus qua REST/GraphQL (skill 05/08).
- ❌ KHÔNG dùng MCP để bypass RBAC/row-level — quyền vẫn theo token.
- ❌ KHÔNG đưa thao tác MCP vào đường chạy production của 2 route handler.
- ✅ MCP hỗ trợ **seed, khám phá schema, dịch, sinh dữ liệu mẫu, prototyping** — tăng tốc đúng tinh thần "xây một lần, tái triển khai rẻ".

## 9. Quản lý MCP trong Kiro
- Cấu hình: `.kiro/settings/mcp.json` (workspace) hoặc `~/.kiro/settings/mcp.json` (user).
- Mở Command Palette → tìm **"MCP"** để xem/kết nối lại server.
- `disabled: true` để tắt nhanh; liệt kê tool tin cậy trong `autoApprove` để bớt xác nhận thủ công.
- Server tự kết nối lại khi đổi config; không cần khởi động lại Kiro.

## Checklist trước khi bật MCP
- [ ] Dùng token/user MCP riêng theo đặc quyền tối thiểu (KHÔNG admin)?
- [ ] Đã `DISABLE_TOOLS` các tool ghi/xóa không cần?
- [ ] Token để trong env/CI store, không vào VCS?
- [ ] Dữ liệu mật của khách được giới hạn quyền?
- [ ] Đã đọc Directus MCP Security guide cho môi trường có dữ liệu thật?
- [ ] Hiểu rõ MCP là công cụ dev-time, không thay tầng DAL runtime?
