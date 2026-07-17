# Sơ đồ Luồng xử lý Báo giá (RFQ Lifecycle)

Dưới đây là sơ đồ chi tiết luồng dữ liệu từ lúc Khách hàng ấn gửi Yêu cầu Báo giá (UC-12) cho đến khi Sales chốt đơn thành công/thất bại (UC-13).

```mermaid
graph TD
    Customer(("Khách hàng / Visitor"))
    SalesActor(("Nhân sự Sales"))

    Customer -->|"1. Submit Form RFQ"| NextJS["Next.js API Route"]

    subgraph Phase1 ["Phase 1: Tầng Next.js BFF (Xử lý kỹ thuật & Chống Spam)"]
        NextJS --> AntiSpam{"2. Kiểm tra Spam (Turnstile & Honeypot)"}
        AntiSpam -->|"Spam"| RejectSpam["Chặn & Báo lỗi"]
        AntiSpam -->|"Hợp lệ"| Dedupe{"3. Chống trùng lặp (Idempotency Key)"}
        
        Dedupe -->|"Khớp Key cũ"| ReturnID["Trả về ID bản ghi cũ (Không tạo mới)"]
        Dedupe -->|"Key mới"| SaveDB["Lưu vào Directus DB (Trạng thái ban đầu: New)"]
    end

    ReturnID -.-> Customer

    subgraph Phase2 ["Phase 2: Directus Workflow (Auto-assign & Notify)"]
        SaveDB --> AutoAssign{"4. Phân bổ Tự động (Dựa trên Hub & Ngành)"}
        
        AutoAssign -->|"Khớp luật"| AssignSales["Gán Owner: Nhân viên Sales"]
        AutoAssign -->|"Không khớp luật"| AssignManager["Gán Owner: Sales Manager"]
        
        AssignSales --> TriggerNotify["5. Gửi Notification"]
        AssignManager --> TriggerNotify
        
        TriggerNotify -->|"Thành công"| NotifyEmail["Gửi Email tóm tắt kèm link"]
        TriggerNotify -->|"Thành công"| NotifyApp["Báo chuông Notification CMS"]
        
        TriggerNotify -.->|"Lỗi mạng/SMTP"| Retry["Next.js Worker Retry gửi lại"]
        Retry -.-> TriggerNotify
    end

    subgraph Phase3 ["Phase 3: Sales Xử lý (Nghiệp vụ Thủ công trên CMS)"]
        NotifyEmail --> SalesActor
        NotifyApp --> SalesActor
        
        SalesActor -->|"6. Click URL"| OpenCMS["Mở chi tiết RFQ trên Directus Admin"]
        OpenCMS --> OfflineQuote["7. Lập báo giá offline / Gọi điện trao đổi"]
        
        OfflineQuote --> UpdateQuoted["8. Sales đổi trạng thái: New ➔ Quoted"]
        
        UpdateQuoted --> WaitCustomer{"9. Khách chốt?"}
        
        WaitCustomer -->|"Đồng ý mua"| StatusWon["10a. Đổi trạng thái: Won (Hệ thống sinh Đơn hàng mới)"]
        WaitCustomer -->|"Từ chối / Chê đắt"| StatusLost["10b. Đổi trạng thái: Lost"]
        WaitCustomer -->|"Khách ảo"| StatusSpam["10c. Đổi trạng thái: Spam"]
        
        StatusWon -.-> AuditLog[("Directus Audit Trail (Tự động lưu lịch sử sửa đổi)")]
        StatusLost -.-> AuditLog
        UpdateQuoted -.-> AuditLog
        StatusSpam -.-> AuditLog
    end

    classDef actor fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef system fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef humanAction fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px;

    class Customer,SalesActor actor;
    class NextJS,AntiSpam,Dedupe,ReturnID,SaveDB,Retry system;
    class AutoAssign,AssignSales,AssignManager,TriggerNotify,NotifyEmail,NotifyApp,AuditLog db;
    class OpenCMS,OfflineQuote,UpdateQuoted,WaitCustomer,StatusWon,StatusLost,StatusSpam humanAction;
```

## Chú giải sơ đồ (Phục vụ cho Tester/QA):

Sơ đồ này vẽ ra **3 cụm test lớn** mà QA phải chuẩn bị kịch bản (Test Cases):

1. **Cụm Màu Tím (Phase 1):** Phải test khả năng **Chống Spam** (Cố tình vượt Turnstile) và **Chống trùng lặp** (Cố tình bấm Submit 2 lần liên tục với cùng email và thông tin đơn hàng). Yêu cầu hệ thống không được sập, không được báo lỗi 409 mà phải trả về thành công dù chỉ tạo 1 bản ghi.
2. **Cụm Màu Cam (Phase 2):** Phải test luật **Auto-Assign**. Đóng vai khách ở "Hub Miền Nam" + "Ngành Thực phẩm", sau đó kiểm tra xem tài khoản Sales phụ trách mảng đó có nhận được Chuông thông báo và Email không. Phải test thử ngắt kết nối mạng (hoặc điền sai SMTP) xem hệ thống có Retry lại việc gửi email không.
3. **Cụm Màu Xanh Lá (Phase 3):** Phải test **Phân quyền thao tác**. Đảm bảo Sales chỉ được quyền đổi trạng thái từ `New` sang `Quoted`, `Won`, `Lost`. Đảm bảo hệ thống có sinh ra log Audit Trail ghi nhận chính xác thời gian Sales đổi trạng thái. Đảm bảo bản ghi Đơn hàng được tạo ra khi chuyển sang `Won` sẽ hiển thị đúng lên Cổng B2B của tài khoản Customer tương ứng.
