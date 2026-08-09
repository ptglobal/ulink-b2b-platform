# Implementation Plan: Trang Nộp Đơn Ứng Tuyển (Job Application Form Page)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang "Nộp đơn ứng tuyển" (Job Application Form Page) tại route `/about/careers/[slug]/apply` với 3 UI components chính tái hiện chính xác 100% giao diện thiết kế mẫu.

**Architecture:** Tạo 3 UI components độc lập trong `frontend/src/components/about/careers/apply/`, sau đó lắp ráp toàn bộ vào trang chính `frontend/src/app/[locale]/(main)/about/careers/[slug]/apply/page.tsx` kèm hệ thống Breadcrumbs chuẩn.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn `border-radius`: Container lớn dùng `rounded-2xl`, card/box/input dùng `rounded-xl` hoặc `rounded-lg`, badge dùng `rounded-full`.
- Quy chuẩn màu sắc: ULink Primary Blue (`text-blue-600`, `bg-blue-600`), Slate Backgrounds.
- Tuân thủ quy chuẩn SEO (H1 cho Title).
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Component Header Form Ứng Tuyển (`apply-header.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/apply/apply-header.tsx`

**Interfaces:**
- Consumes: Job title
- Produces: `ApplyHeader` component function

- [ ] **Step 1: Khởi tạo file `apply-header.tsx`**

```tsx
export function ApplyHeader() {
  return (
    <section className="py-6 border-b border-slate-100">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-sm">
          UL
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
          NỘP ĐƠN ỨNG TUYỂN
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
        Chuyên viên Phát triển Kinh doanh B2B — Khu Công nghiệp
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
        Cảm ơn bạn đã quan tâm đến cơ hội nghề nghiệp tại ULink Industries. Vui lòng hoàn thành biểu mẫu thông tin dưới đây, Đội ngũ Tuyển dụng sẽ phản hồi hồ sơ của bạn trong vòng 3 ngày làm việc.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 2: Component Biểu Mẫu Ứng Tuyển 5 Section (`apply-form.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/apply/apply-form.tsx`

**Interfaces:**
- Consumes: Form submit handler, file upload state, Lucide Icons (`UploadCloud`, `CheckCircle2`, `ArrowRight`, `FileText`, `X`)
- Produces: `ApplyForm` component function

- [ ] **Step 1: Khởi tạo file `apply-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { UploadCloud, FileText, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-8 text-center text-emerald-900 border border-emerald-200 my-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Nộp đơn ứng tuyển thành công!</h2>
        <p className="mt-2 text-sm text-emerald-700 max-w-lg mx-auto">
          Cảm ơn bạn đã ứng tuyển vào ULink Industries. Bộ phận Tuyển dụng sẽ xem xét hồ sơ và liên hệ với bạn trong vòng 3 ngày làm việc.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 py-8">
      {/* Section 01: Thông tin cá nhân */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            01
          </span>
          <h2 className="text-base font-bold text-slate-900">Thông tin cá nhân</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              placeholder="Nhập đầy đủ họ và tên của bạn"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ Email *</label>
              <input
                type="email"
                required
                placeholder="nhapname@example.com"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="Nhập số điện thoại liên hệ"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày tháng năm sinh *</label>
              <input
                type="date"
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giới tính *</label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="">Không yêu cầu / Chọn giới tính</option>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
                <option value="khac">Khác</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 02: Trình độ học vấn */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            02
          </span>
          <h2 className="text-base font-bold text-slate-900">Trình độ học vấn</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bậc học cao nhất *</label>
              <select
                required
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600"
              >
                <option value="dai-hoc">Đại học</option>
                <option value="thac-si">Thạc sĩ</option>
                <option value="cao-dang">Cao đẳng</option>
                <option value="khac">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trường Đại học / Cao đẳng *</label>
              <input
                type="text"
                required
                placeholder="Tên trường học của bạn"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên ngành *</label>
              <input
                type="text"
                required
                placeholder="Chuyên ngành đào tạo"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Năm tốt nghiệp *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 2021"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 03: Kinh nghiệm làm việc gần nhất */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            03
          </span>
          <h2 className="text-base font-bold text-slate-900">Kinh nghiệm làm việc gần nhất</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên công ty gần nhất</label>
              <input
                type="text"
                placeholder="Nhập tên công ty bạn đã/đang làm việc"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí đảm nhiệm</label>
              <input
                type="text"
                placeholder="Ví dụ: Nhân viên kinh doanh, Trưởng nhóm..."
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian làm việc</label>
            <input
              type="text"
              placeholder="Ví dụ: 03/2022 - Hiện tại hoặc 2 năm"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả ngắn về công việc và thành tựu nổi bật</label>
            <textarea
              rows={4}
              placeholder="Nêu ngắn gọn nhiệm vụ chính và KPI hoặc kết quả nổi bật bạn đã đạt được..."
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Section 04: Hồ sơ đính kèm (CV) */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            04
          </span>
          <h2 className="text-base font-bold text-slate-900">Hồ sơ đính kèm (CV)</h2>
        </div>

        <div className="relative border-2 border-dashed border-blue-200 rounded-xl p-8 bg-blue-50/30 flex flex-col items-center justify-center text-center transition-colors hover:bg-blue-50/60">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          {cvFile ? (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm text-xs font-semibold text-blue-700">
              <FileText className="h-4 w-4" />
              <span>{cvFile.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCvFile(null);
                }}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-900">
                Kéo thả tệp tin CV của bạn vào đây
              </p>
              <p className="text-[11px] text-blue-600 underline mt-1">Hoặc bấm để chọn tệp từ máy tính</p>
              <p className="text-[10px] text-slate-400 mt-2">Hỗ trợ định dạng PDF, DOC, DOCX. Dung lượng tối đa 10MB.</p>
            </>
          )}
        </div>
      </div>

      {/* Section 05: Thư giới thiệu & Submit */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            05
          </span>
          <h2 className="text-base font-bold text-slate-900">Thư giới thiệu / Thông điệp gửi nhà tuyển dụng</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Thư giới thiệu (Không bắt buộc)</label>
          <textarea
            rows={4}
            placeholder="Chia sẻ lý do bạn mong muốn đồng hành cùng ULink, mục tiêu phát triển bản thân hoặc kỳ vọng..."
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
          ></textarea>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" required id="commit" className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
          <label htmlFor="commit" className="text-[11px] leading-relaxed text-slate-600">
            Tôi cam kết thông tin cung cấp là chính xác và đồng ý cho ULink Industries sử dụng thông tin này phục vụ quy trình tuyển dụng và đánh giá năng lực theo đúng Chính sách bảo mật thông tin.
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">Đơn ứng tuyển sẽ được gửi trực tiếp đến bộ phận nhân sự.</span>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
          >
            Gửi đơn <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 3: Component Sidebar Tóm Tắt & Quy Trình Tuyển Dụng (`apply-sidebar.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/apply/apply-sidebar.tsx`

**Interfaces:**
- Consumes: Job metadata, steps list
- Produces: `ApplySidebar` component function

- [ ] **Step 1: Khởi tạo file `apply-sidebar.tsx`**

```tsx
import { Briefcase, DollarSign, Clock, Calendar } from 'lucide-react';

const processSteps = [
  { num: '1', title: 'Tiếp nhận hồ sơ' },
  { num: '2', title: 'Sàng lọc CV phù hợp' },
  { num: '3', title: 'Phỏng vấn' },
  { num: '4', title: 'Đánh giá' },
  { num: '5', title: 'Gửi Offer' },
  { num: '6', title: 'Onboarding' },
];

export function ApplySidebar() {
  return (
    <div className="flex flex-col gap-6 py-8">
      {/* Card 1: Tóm tắt công việc */}
      <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
          Tóm tắt công việc
        </h3>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Cấp bậc</span>
              <span className="font-bold text-slate-800">Chuyên viên</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Mức lương</span>
              <span className="font-bold text-slate-800">15 - 25 triệu VNĐ</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Hình thức làm việc</span>
              <span className="font-bold text-slate-800">Toàn thời gian</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shrink-0">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Hạn nộp hồ sơ</span>
              <span className="font-bold text-amber-700">30/08/2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Quy trình tuyển dụng */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Quy trình tuyển dụng
        </h3>

        <div className="flex flex-col gap-3">
          {processSteps.map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                {step.num}
              </span>
              <span className="text-xs font-semibold text-slate-800">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 4: Lắp Ráp Trang Apply Page & Kiểm Tra Typecheck (`careers/[slug]/apply/page.tsx`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/about/careers/[slug]/apply/page.tsx`

**Interfaces:**
- Consumes: All 3 apply components created in Tasks 1-3
- Produces: Default Export `ApplyJobPage`

- [ ] **Step 1: Khởi tạo file `careers/[slug]/apply/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ApplyHeader } from '@/components/about/careers/apply/apply-header';
import { ApplyForm } from '@/components/about/careers/apply/apply-form';
import { ApplySidebar } from '@/components/about/careers/apply/apply-sidebar';

export default async function ApplyJobPage({
  params: { locale },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-slate-50/50 min-h-screen py-4">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about/careers" className="hover:text-blue-600 transition-colors">
            Tuyển dụng
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about/careers/b2b-sales" className="hover:text-blue-600 transition-colors">
            Kinh doanh
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Nộp đơn ứng tuyển</span>
        </nav>

        {/* Header */}
        <ApplyHeader />

        {/* Main 2 Columns Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ApplyForm />
          </div>
          <div className="lg:col-span-4">
            <ApplySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Chạy kiểm tra TypeScript (`npm run typecheck`)**

Command: `npm run typecheck`
Expected output: Success with zero errors.

---

## Verification Plan

### Automated Tests
- Chạy `npm run typecheck` trong thư mục `frontend` để đảm bảo 100% không có lỗi Type trong toàn bộ project.

### Manual Verification
- Truy cập `http://localhost:3000/vi/about/careers/b2b-sales/apply` trên trình duyệt để kiểm tra toàn bộ form nộp đơn ứng tuyển render đúng giao diện thiết kế mẫu.
