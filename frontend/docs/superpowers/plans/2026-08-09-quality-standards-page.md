# Implementation Plan: Trang Chất Lượng & Tiêu Chuẩn (Quality & Standards)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang "Chất lượng & Tiêu chuẩn" mới cho ULink B2B Platform tại route `/about/standards` (nằm trong cụm trang Về chúng tôi), bao gồm 5 UI components độc lập tái hiện chính xác giao diện thiết kế chuẩn B2B.

**Architecture:** Xây dựng 5 UI components chuyên biệt trong `frontend/src/components/about/standards/`, sau đó kết hợp vào trang chính `frontend/src/app/[locale]/(main)/about/standards/page.tsx` kèm hệ thống Breadcrumbs chuẩn.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn `border-radius`: Container lớn dùng `rounded-2xl`, card/box dùng `rounded-xl`, icon/badge/button dùng `rounded-lg` hoặc `rounded-full`.
- Quy chuẩn màu sắc: ULink Primary Blue (`text-blue-600`, `bg-blue-600`), Slate Backgrounds, Dark Blue/Slate 900 cho Section Quy Trình Vận Hành.
- Tuân thủ quy chuẩn SEO (H1 cho Hero Title, H2 cho các Section Title).
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Component Hero Banner (`quality-hero.tsx`)

**Files:**
- Create: `frontend/src/components/about/standards/quality-hero.tsx`

**Interfaces:**
- Consumes: Image `/images/about/quality-hero-bg.webp`
- Produces: `QualityHero` component function

- [ ] **Step 1: Khởi tạo file `quality-hero.tsx`**

```tsx
import Image from 'next/image';

export function QualityHero() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col gap-4 max-w-3xl mb-8">
        <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
          CHẤT LƯỢNG & TIÊU CHUẨN
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
          Chất lượng là cam kết. Tiêu chuẩn là nền tảng.
        </h1>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          Tại ULink B2B Platform, chất lượng sản phẩm và vật tư kỹ thuật không chỉ là mục tiêu kinh doanh, mà là lời cam kết sinh tử với hiệu quả vận hành của Khách hàng. Chúng tôi thiết lập hệ thống kiểm soát chất lượng đạt chuẩn quốc tế ISO ngay từ khâu lưu kho, kiểm định đến khi giao tới dây chuyền sản xuất.
        </p>
      </div>

      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-900/10">
        <Image
          src="/images/about/quality-hero-bg.webp"
          alt="Trung tâm kiểm định chất lượng vật tư ULink"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 p-2 shadow-md backdrop-blur">
          <span className="text-xs font-extrabold text-blue-600">ULINK</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 2: Component Hệ Thống Tiêu Chuẩn (`quality-standards-grid.tsx`)

**Files:**
- Create: `frontend/src/components/about/standards/quality-standards-grid.tsx`

**Interfaces:**
- Consumes: Lucide React Icons
- Produces: `QualityStandardsGrid` component function

- [ ] **Step 1: Khởi tạo file `quality-standards-grid.tsx`**

```tsx
const standardsList = [
  {
    code: 'ISO',
    title: 'ISO 9001:2015',
    sub: 'Quản lý chất lượng',
    desc: 'Quy trình kiểm soát chất lượng vật tư đầu vào và xuất kho tuân thủ chuẩn ISO 9001 nghiêm ngặt.',
  },
  {
    code: 'ISO',
    title: 'ISO 14001:2015',
    sub: 'Quản lý môi trường',
    desc: 'Giảm thiểu tác động môi trường trong vận hành kho bãi, tiết kiệm tài nguyên và bảo vệ môi trường sản xuất.',
  },
  {
    code: 'ISO',
    title: 'ISO 50001:2018',
    sub: 'Quản lý năng lượng',
    desc: 'Tối ưu hóa hiệu suất sử dụng năng lượng vận hành hệ thống kho bãi và dây chuyền đóng gói.',
  },
  {
    code: 'ISO',
    title: 'ISO/IEC 17025',
    sub: 'Phòng thử nghiệm',
    desc: 'Đảm bảo năng lực thử nghiệm và hiệu chuẩn thông số kỹ thuật vật tư đạt tiêu chuẩn phòng lab quốc tế.',
  },
];

export function QualityStandardsGrid() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          ĐẠT CHUẨN QUỐC TẾ
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Hệ Thống Tiêu Chuẩn
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl">
          ULink cam kết vận hành và tuân thủ các tiêu chuẩn ngành nghiêm ngặt nhất, đảm bảo chất lượng vật tư kỹ thuật cho toàn bộ chuỗi cung ứng công nghiệp Việt Nam.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {standardsList.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-extrabold text-xs">
              {item.code}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
            <span className="mt-1 text-xs font-semibold text-blue-600">
              {item.sub}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 3: Component Chứng Nhận ISO & Logo Đơn Vị Chứng Nhận (`quality-badges.tsx`)

**Files:**
- Create: `frontend/src/components/about/standards/quality-badges.tsx`

**Interfaces:**
- Consumes: Icons & badges từ Lucide
- Produces: `QualityBadges` component function

- [ ] **Step 1: Khởi tạo file `quality-badges.tsx`**

```tsx
import { CheckCircle2, ShieldAlert, Award, FileCheck2 } from 'lucide-react';

const badges = [
  {
    name: 'ISO 9001:2015',
    tag: 'CERTIFIED',
    color: 'bg-blue-600 text-white',
    icon: CheckCircle2,
  },
  {
    name: 'SGS',
    tag: 'VERIFIED',
    color: 'bg-amber-600 text-white',
    icon: Award,
  },
  {
    name: 'RoHS',
    tag: 'COMPLIANT',
    color: 'bg-emerald-600 text-white',
    icon: FileCheck2,
  },
  {
    name: 'MSDS',
    tag: 'SAFETY DATA',
    color: 'bg-red-600 text-white',
    icon: ShieldAlert,
  },
];

export function QualityBadges() {
  return (
    <section className="py-8">
      <div className="rounded-2xl bg-slate-50 p-6 sm:p-10 border border-slate-100 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-2">
          Chứng nhận ISO
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mb-8">
          Đáp ứng các tiêu chuẩn quốc tế và chất lượng của mỗi mắt xích trong chuỗi cung ứng.
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-3xl">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${b.color} mb-3 shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-900">{b.name}</span>
                <span className="mt-0.5 text-[10px] font-semibold text-slate-500 tracking-wider">
                  {b.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 4: Component Quy Trình Quản Lý Chất Lượng 5 Bước (`quality-process.tsx`)

**Files:**
- Create: `frontend/src/components/about/standards/quality-process.tsx`

**Interfaces:**
- Consumes: Step numbers (01 -> 05), step descriptions
- Produces: `QualityProcess` component function

- [ ] **Step 1: Khởi tạo file `quality-process.tsx`**

```tsx
const steps = [
  {
    num: '01',
    title: 'Kiểm tra đầu vào',
    desc: 'Kiểm định nghiệm thu chất lượng vật tư ngay khi nhập kho 100% lô hàng.',
  },
  {
    num: '02',
    title: 'Giám sát quy trình',
    desc: 'Kiểm soát điều kiện lưu trữ và bảo quản kho bãi đúng tiêu chuẩn kỹ thuật.',
  },
  {
    num: '03',
    title: 'Kiểm định thành phẩm',
    desc: 'Kiểm tra chất lượng chi tiết trước khi đóng gói và xuất kho giao hàng.',
  },
  {
    num: '04',
    title: 'Đóng gói & Lưu kho',
    desc: 'Đóng gói bảo vệ an toàn chuẩn công nghiệp và lưu trữ chế độ bảo quản nghiêm ngặt.',
  },
  {
    num: '05',
    title: 'Giao hàng & Hậu mãi',
    desc: 'Giao hàng đúng hẹn tận nhà máy và hỗ trợ kỹ thuật xử lý yêu cầu phát sinh 24/7.',
  },
];

export function QualityProcess() {
  return (
    <section className="py-12 px-6 sm:px-10 rounded-2xl bg-slate-900 text-white my-8 shadow-xl">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/30 mb-2">
          QUY TRÌNH VẬN HÀNH
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Quy trình Quản lý Chất lượng
        </h2>
        <p className="mt-2 text-sm text-slate-300 max-w-xl">
          Quy trình 5 bước khép kín đảm bảo mỗi vật tư công nghiệp cung cấp đến doanh nghiệp đều đạt tiêu chuẩn kỹ thuật tối cao.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-xl bg-slate-800/80 p-5 border border-slate-700/60 backdrop-blur"
          >
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-extrabold text-white shadow">
              {step.num}
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
            <p className="text-xs leading-relaxed text-slate-300 flex-1">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 5: Component Cam Kết Doanh Nghiệp & SLA (`quality-commitments.tsx`)

**Files:**
- Create: `frontend/src/components/about/standards/quality-commitments.tsx`

**Interfaces:**
- Consumes: Metric numbers & descriptions
- Produces: `QualityCommitments` component function

- [ ] **Step 1: Khởi tạo file `quality-commitments.tsx`**

```tsx
const metrics = [
  {
    value: '99.7%',
    label: 'Tỷ lệ sản phẩm đạt chuẩn',
    sub: 'Kiểm định nghiêm ngặt trước khi xuất kho',
  },
  {
    value: '< 24h',
    label: 'Thời gian xử lý khiếu nại',
    sub: 'Hỗ trợ kỹ thuật và đổi trả nhanh chóng',
  },
  {
    value: '98.5%',
    label: 'Độ hài lòng khách hàng',
    sub: 'Theo khảo sát thường niên năm 2025',
  },
  {
    value: '97.8%',
    label: 'Tỷ lệ giao hàng đúng hẹn',
    sub: 'Cam kết tiến độ sản xuất cho nhà máy',
  },
];

export function QualityCommitments() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          CAM KẾT DOANH NGHIỆP
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Đồng hành cùng sự phát triển của Bạn
        </h2>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
        <h3 className="text-center text-base font-bold text-slate-800 mb-6">
          Cam kết với Doanh nghiệp
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {metrics.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center pt-4 sm:pt-0 sm:px-4">
              <span className="text-3xl font-extrabold text-blue-600 sm:text-4xl">
                {item.value}
              </span>
              <span className="mt-2 text-sm font-bold text-slate-900">
                {item.label}
              </span>
              <span className="mt-1 text-xs text-slate-500 max-w-[200px]">
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 6: Lắp Ráp Trang Quality Standards Page & Kiểm Tra Typecheck (`standards/page.tsx`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/about/standards/page.tsx`

**Interfaces:**
- Consumes: `QualityHero`, `QualityStandardsGrid`, `QualityBadges`, `QualityProcess`, `QualityCommitments`
- Produces: Default Export `QualityStandardsPage`

- [ ] **Step 1: Khởi tạo file `standards/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { QualityHero } from '@/components/about/standards/quality-hero';
import { QualityStandardsGrid } from '@/components/about/standards/quality-standards-grid';
import { QualityBadges } from '@/components/about/standards/quality-badges';
import { QualityProcess } from '@/components/about/standards/quality-process';
import { QualityCommitments } from '@/components/about/standards/quality-commitments';

export default async function QualityStandardsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            Về chúng tôi
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Chất lượng & Tiêu chuẩn</span>
        </nav>

        {/* Các section chính */}
        <QualityHero />
        <QualityStandardsGrid />
        <QualityBadges />
        <QualityProcess />
        <QualityCommitments />
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
- Truy cập `http://localhost:3000/vi/about/standards` trên trình duyệt để kiểm tra toàn bộ 5 section render đúng giao diện thiết kế mẫu.
