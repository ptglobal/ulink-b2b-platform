# Implementation Plan: Trang Xác Nhận Ứng Tuyển Thành Công (Job Application Success Page)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang "Xác nhận ứng tuyển thành công" (Job Application Success Page) tại route `/about/careers/apply-success` với 4 UI components chính tái hiện chính xác 100% giao diện thiết kế mẫu.

**Architecture:** Tạo 4 UI components độc lập trong `frontend/src/components/about/careers/apply-success/`, sau đó lắp ráp toàn bộ vào trang chính `frontend/src/app/[locale]/(main)/about/careers/apply-success/page.tsx` kèm hệ thống Breadcrumbs chuẩn.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn `border-radius`: Container lớn dùng `rounded-2xl`, card/box dùng `rounded-xl` hoặc `rounded-lg`, badge/icon dùng `rounded-full`.
- Quy chuẩn màu sắc: ULink Primary Blue (`text-blue-600`, `bg-blue-600`), Slate Backgrounds.
- Tuân thủ quy chuẩn SEO (H1 cho Hero Title, H2 cho các Section Title).
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Component Success Hero & Nút Về Trang Chủ (`apply-success-hero.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/apply-success/apply-success-hero.tsx`

**Interfaces:**
- Consumes: Lucide Icons (`Check`, `ArrowLeft`)
- Produces: `ApplySuccessHero` component function

- [ ] **Step 1: Khởi tạo file `apply-success-hero.tsx`**

```tsx
import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

export function ApplySuccessHero() {
  return (
    <section className="py-10 flex flex-col items-center text-center max-w-3xl mx-auto">
      {/* Top Checkmark Circle */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30">
        <Check className="h-8 w-8 stroke-[3]" />
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
        Nộp đơn ứng tuyển thành công!
      </h1>

      {/* Description */}
      <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
        Cảm ơn bạn đã nộp đơn ứng tuyển tại ULink Industries. Hồ sơ của bạn đã được gửi trực tiếp đến Bộ phận Nhân sự. Chúng tôi trân trọng tài năng của bạn và sẽ phản hồi kết quả duyệt hồ sơ sớm nhất.
      </p>

      {/* Back to Home Button */}
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-blue-600 shadow-sm hover:bg-slate-50 hover:border-blue-200 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 2: Component Thẻ Tóm Tắt Hồ Sơ Đã Nộp (`apply-success-recap.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/apply-success/apply-success-recap.tsx`

**Interfaces:**
- Consumes: Job recap metadata
- Produces: `ApplySuccessRecap` component function

- [ ] **Step 1: Khởi tạo file `apply-success-recap.tsx`**

```tsx
export function ApplySuccessRecap() {
  return (
    <section className="py-6 max-w-4xl mx-auto">
      <div className="rounded-xl bg-white p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            THÔNG TIN HỒ SƠ ĐÃ NỘP
          </span>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-sm">
              UL
            </div>
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 mb-1">
                VỊ TRÍ ỨNG TUYỂN
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Chuyên viên Phát triển Kinh doanh B2B — Khu Công nghiệp
              </h2>
            </div>
          </div>
        </div>

        {/* 3 Columns Meta */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="block text-slate-400 text-[10px]">Nơi làm việc</span>
            <span className="font-bold text-slate-800">KCN Đồng Văn IV, Hà Nam</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px]">Mức lương thương lượng</span>
            <span className="font-bold text-slate-800">15 - 25M VNĐ</span>
          </div>
          <div>
            <span className="block text-slate-400 text-[10px]">Ngày nộp đơn</span>
            <span className="font-bold text-slate-800">Hôm nay, 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 3: Component Các Bước Tiếp Theo (`apply-success-steps.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/apply-success/apply-success-steps.tsx`

**Interfaces:**
- Consumes: Steps list
- Produces: `ApplySuccessSteps` component function

- [ ] **Step 1: Khởi tạo file `apply-success-steps.tsx`**

```tsx
const steps = [
  {
    num: '1',
    title: 'Xác nhận hồ sơ',
    desc: 'Hệ thống tự động gửi email xác nhận đã nhận CV đầy đủ đến email của bạn.',
  },
  {
    num: '2',
    title: 'Đánh giá năng lực',
    desc: 'Chuyên viên tuyển dụng ULink đánh giá kinh nghiệm và độ phù hợp trong 3 ngày làm việc.',
  },
  {
    num: '3',
    title: 'Liên hệ phỏng vấn',
    desc: 'Nếu CV phù hợp, chúng tôi sẽ gọi điện trực tiếp để đặt lịch phỏng vấn chính thức.',
  },
];

export function ApplySuccessSteps() {
  return (
    <section className="py-10 max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Các bước tiếp theo của bạn là gì?
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Hành trình gia nhập đại gia đình ULink Industries bắt đầu từ đây
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((item) => (
          <div
            key={item.num}
            className="flex flex-col rounded-xl bg-slate-50 p-6 border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-extrabold text-white mb-4 shadow-sm">
              {item.num}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-xs leading-relaxed text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 4: Component Công Việc Gợi Ý Tương Tự (`apply-success-recommendations.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/apply-success/apply-success-recommendations.tsx`

**Interfaces:**
- Consumes: Recommended jobs array, Lucide Icons (`MapPin`, `Briefcase`)
- Produces: `ApplySuccessRecommendations` component function

- [ ] **Step 1: Khởi tạo file `apply-success-recommendations.tsx`**

```tsx
import Link from 'next/link';

const jobs = [
  {
    id: '1',
    category: 'Khối Sản Xuất - Công Nghệ Cao',
    title: 'Kỹ Sư Giám Sát Chất Lượng QA/QC (Phòng Sạch)',
    salary: '14 - 20M VNĐ',
    location: 'Kim Bảng, Hà Nam',
    href: '/about/careers/qa-qc-engineer',
  },
  {
    id: '2',
    category: 'Phòng Logistics & HUB',
    title: 'Chuyên Viên Logistics & Điều Phối Chuỗi Cung Ứng',
    salary: '12 - 18M VNĐ',
    location: 'HUB Hà Nam',
    href: '/about/careers/logistics-spec',
  },
];

export function ApplySuccessRecommendations() {
  return (
    <section className="py-10 max-w-5xl mx-auto border-t border-slate-100">
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Cơ hội nghề nghiệp tương tự dành cho bạn
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Các vị trí đang tuyển có yêu cầu kỹ năng tương tự với hồ sơ của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {jobs.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col justify-between rounded-xl bg-white p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200 group"
          >
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                {item.category}
              </span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3">
                {item.title}
              </h3>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="font-bold text-blue-600">{item.salary}</span>
              <span className="text-slate-500 font-medium">{item.location}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 5: Lắp Ráp Trang Apply Success Page & Kiểm Tra Typecheck (`careers/apply-success/page.tsx`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/about/careers/apply-success/page.tsx`

**Interfaces:**
- Consumes: All 4 apply-success components created in Tasks 1-4
- Produces: Default Export `ApplySuccessPage`

- [ ] **Step 1: Khởi tạo file `careers/apply-success/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ApplySuccessHero } from '@/components/about/careers/apply-success/apply-success-hero';
import { ApplySuccessRecap } from '@/components/about/careers/apply-success/apply-success-recap';
import { ApplySuccessSteps } from '@/components/about/careers/apply-success/apply-success-steps';
import { ApplySuccessRecommendations } from '@/components/about/careers/apply-success/apply-success-recommendations';

export default async function ApplySuccessPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-slate-50/50 min-h-screen py-4">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about/careers" className="hover:text-blue-600 transition-colors">
            Vị trí tuyển dụng
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Ứng tuyển thành công</span>
        </nav>

        {/* 4 Section chính */}
        <ApplySuccessHero />
        <ApplySuccessRecap />
        <ApplySuccessSteps />
        <ApplySuccessRecommendations />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update ApplyForm to navigate to `/about/careers/apply-success` upon submit**

In `frontend/src/components/about/careers/apply/apply-form.tsx`:
```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  router.push('/about/careers/apply-success');
};
```

- [ ] **Step 3: Chạy kiểm tra TypeScript (`npm run typecheck`)**

Command: `npm run typecheck`
Expected output: Success with zero errors.

---

## Verification Plan

### Automated Tests
- Chạy `npm run typecheck` trong thư mục `frontend` để đảm bảo 100% không có lỗi Type trong toàn bộ project.

### Manual Verification
- Truy cập `http://localhost:3000/vi/about/careers/apply-success` trên trình duyệt để kiểm tra toàn bộ trang xác nhận ứng tuyển thành công render đúng giao diện thiết kế mẫu.
