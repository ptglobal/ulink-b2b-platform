# Implementation Plan: Tái Tạo Hoàn Chỉnh Trang Đăng Nhập (Recreate Login Page Section)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tái hiện chính xác 100% giao diện trang Đăng nhập theo đúng thiết kế mẫu trong hình ảnh người dùng đã cung cấp, bao gồm:
1. Thẻ Hero màu xanh `#0D4397` bên trái với tiêu đề *"Kết nối hôm nay, Kiến tạo tương lai."*, ảnh kệ kho tự động và 3 badge tính năng (An toàn, Hiệu quả, Đồng hành).
2. Thẻ Đăng nhập màu trắng bên phải với Tab Đăng nhập / Đăng ký, Form nhập liệu, Nút Đăng nhập xanh, Google SSO, SSO ULink & Dòng hotline hỗ trợ `1900 6868`.
3. Thanh logo đối tác "Hơn 300 doanh nghiệp FDI & Tập đoàn dược phẩm đồng hành cùng ULink Industries".
4. Khối CTA "Liên hệ trực tiếp - Kết nối với ULink Industries" với 2 nút `Gọi ngay` và `Gửi yêu cầu`.
5. Đảm bảo có `<SiteHeader />` và `<SiteFooter />` tiêu chuẩn đồng bộ.

**Architecture:**
- Create: `frontend/src/components/auth/login-hero-card.tsx` (Thẻ xanh Hero bên trái)
- Modify: `frontend/src/components/auth/login-form.tsx` (Form Đăng nhập bên phải với Tab, SSO, Hotline)
- Create: `frontend/src/components/auth/login-partners.tsx` (Thanh 12 logo đối tác FDI & Dược phẩm)
- Create: `frontend/src/components/auth/login-cta.tsx` (Banner Liên hệ trực tiếp)
- Update: `frontend/src/app/[locale]/(auth)/login/page.tsx` (Lắp ráp toàn bộ các section)

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn màu sắc: Deep Blue `#0D4397`, Primary Blue `bg-blue-600`, Slate Backgrounds.
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Component Thẻ Hero Xanh Bên Trái (`login-hero-card.tsx`)

**Files:**
- Create: `frontend/src/components/auth/login-hero-card.tsx`

- [ ] **Step 1: Khởi tạo file `login-hero-card.tsx`**

```tsx
import Image from 'next/image';
import { ShieldCheck, Zap, HeartHandshake } from 'lucide-react';

export function LoginHeroCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0D4397] to-[#0A3273] p-8 lg:p-10 text-white shadow-xl h-full min-h-[600px]">
      {/* Top Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
          Kết nối hôm nay,<br />Kiến tạo <span className="text-blue-300">tương lai.</span>
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed text-blue-100/90 max-w-md">
          ULink Industries chuyên sản xuất và phân phối các sản phẩm vật tư kỹ thuật cho doanh nghiệp sản xuất, với danh mục đa dạng, đáp ứng mọi nhu cầu vận hành - tối ưu chi phí mang sao hiệu suất.
        </p>
      </div>

      {/* Center Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg border border-white/20 my-6">
        <Image
          src="/images/about/kho.png"
          alt="Hệ thống kệ kho tự động ULink Industries"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Bottom 3 Feature Badges */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200 backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white">An toàn</span>
            <span className="block text-[10px] text-blue-200">Tiêu chuẩn kỹ thuật cao</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200 backdrop-blur">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white">Hiệu quả</span>
            <span className="block text-[10px] text-blue-200">Tối ưu chi phí sản xuất</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200 backdrop-blur">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-white">Đồng hành</span>
            <span className="block text-[10px] text-blue-200">Hỗ trợ doanh nghiệp 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 2: Component Thanh Logo Đối Tác & Khối CTA Liên Hệ (`login-partners.tsx` & `login-cta.tsx`)

**Files:**
- Create: `frontend/src/components/auth/login-partners.tsx`
- Create: `frontend/src/components/auth/login-cta.tsx`

- [ ] **Step 1: Khởi tạo file `login-partners.tsx` với 12 logo doanh nghiệp FDI & Dược phẩm**
- [ ] **Step 2: Khởi tạo file `login-cta.tsx` với thông điệp Liên hệ trực tiếp**

---

### Task 3: Tối Ưu Form Đăng Nhập Bên Phải (`login-form.tsx`)

**Files:**
- Modify: `frontend/src/components/auth/login-form.tsx`

- [ ] **Step 1: Cập nhật Tab Đăng nhập / Đăng ký, input Email, Mật khẩu, Google SSO, SSO ULink và dòng Hotline hỗ trợ `1900 6868`**

---

### Task 4: Lắp Ráp Trang Login Complete Page (`login/page.tsx`)

**Files:**
- Modify: `frontend/src/app/[locale]/(auth)/login/page.tsx`

- [ ] **Step 1: Lắp ráp 4 block chính vào trang Login**
- [ ] **Step 2: Chạy `npm run typecheck` xác nhận 0 lỗi**

---

## Verification Plan

### Automated Tests
- Chạy `npm run typecheck` trong thư mục `frontend` để đảm bảo 100% không có lỗi Type.

### Manual Verification
- Truy cập `http://localhost:3000/vi/login` trên trình duyệt để kiểm tra toàn bộ 4 section tái hiện chính xác 100% theo hình ảnh đính kèm.
