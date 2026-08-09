# Implementation Plan: Cập Nhật Trang Đăng Nhập Chuẩn Header & Footer (Redesign Login Page)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi trang Đăng nhập (Login Page) từ dạng Split-screen đơn độc sang bố cục chuẩn hệ thống có `<SiteHeader />` và `<SiteFooter />`, có hệ thống Breadcrumbs, thẻ thương hiệu Hub Hà Nam bên trái và Form đăng nhập B2B hiện đại bên phải.

**Architecture:** 
- Cập nhật `frontend/src/app/[locale]/(auth)/layout.tsx` tích hợp `<SiteHeader />` và `<SiteFooter />`.
- Tối ưu `frontend/src/components/auth/login-form.tsx` và `frontend/src/components/auth/auth-hero.tsx` để hiển thị cân đối trong bố cục chuẩn 1440px.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn `border-radius`: Container lớn dùng `rounded-2xl`, card/box dùng `rounded-xl`, input/button dùng `rounded-lg`.
- Quy chuẩn màu sắc: ULink Primary Blue (`text-blue-600`, `bg-blue-600`), Slate Backgrounds.
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Cập Nhật Auth Layout Với Header & Footer (`(auth)/layout.tsx`)

**Files:**
- Modify: `frontend/src/app/[locale]/(auth)/layout.tsx`

- [ ] **Step 1: Cập nhật `(auth)/layout.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export default function AuthLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch layout**

---

### Task 2: Cập Nhật Component Form Đăng Nhập & Banner (`login-form.tsx` & `auth-hero.tsx`)

**Files:**
- Modify: `frontend/src/components/auth/login-form.tsx`
- Modify: `frontend/src/components/auth/auth-hero.tsx`

- [ ] **Step 1: Nâng cấp `auth-hero.tsx` thành thẻ nhận diện thương hiệu Hub Hà Nam**
- [ ] **Step 2: Nâng cấp `login-form.tsx` với giao diện Card B2B hiện đại**
- [ ] **Step 3: Kiểm tra `npm run typecheck`**

---

## Verification Plan

### Automated Tests
- Chạy `npm run typecheck` trong thư mục `frontend` để đảm bảo 100% không có lỗi Type.

### Manual Verification
- Truy cập `http://localhost:3000/vi/login` trên trình duyệt để xác nhận Header và Footer hiển thị đầy đủ, giao diện đăng nhập đẹp và đồng bộ với toàn bộ hệ thống.
