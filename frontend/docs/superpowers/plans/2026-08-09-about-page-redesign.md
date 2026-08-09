# Plan Thiết Kế & Lập Trình Trang About Mới (Hub Hà Nam)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang Giới thiệu (About Us) mới dựa trên thiết kế 8 section hoàn chỉnh cho Hub Hà Nam - ULink Industries B2B Platform.

**Architecture:** Tạo 8 UI components độc lập trong `frontend/src/components/about/` tương ứng 8 section của giao diện thiết kế, sau đó lắp ráp toàn bộ vào `frontend/src/app/[locale]/(main)/about/page.tsx`.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải viết bằng TypeScript (`.tsx`) đầy đủ type-safe.
- Đảm bảo thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Sử dụng màu sắc thương hiệu ULink (Primary blue, slate background, emerald cho sustainability).
- Giữ vững quy chuẩn SEO (H1 cho Hero, H2 cho các section).
- Chạy `npm run typecheck` thành công sau khi hoàn tất.

---

### Task 1: Component Hero Banner (`about-hero.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-hero.tsx`

**Interfaces:**
- Consumes: Image từ `public/images/about/hero-warehouse.webp`
- Produces: `AboutHero` component function

- [ ] **Step 1: Khởi tạo file `about-hero.tsx`**

```tsx
import Image from 'next/image';

export function AboutHero() {
  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Trung tâm vật tư Hà Nam
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            Hub Hà Nam - Cung ứng vật tư cho Doanh nghiệp sản xuất
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Thắt chặt chuỗi cung ứng vật tư công nghiệp với các trung tâm kho bãi tối tân tại các vùng công nghiệp trọng điểm.
          </p>
          <p className="text-base leading-relaxed text-slate-600">
            Cung cấp giải pháp vật tư kỹ thuật tổng thể, tối ưu chi phí và nâng cao hiệu quả vận hành cho nhà máy.
          </p>
        </div>
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-900/10">
            <Image
              src="/images/about/hero-warehouse.webp"
              alt="Hub Hà Nam - Trung tâm vật tư ULink"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra component render không lỗi**

---

### Task 2: Component 4 Con Số Impression (`about-stats.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-stats.tsx`

**Interfaces:**
- Consumes: Icon từ `lucide-react` (`Warehouse`, `PackageCheck`, `Clock`, `Award`)
- Produces: `AboutStats` component function

- [ ] **Step 1: Khởi tạo file `about-stats.tsx`**

```tsx
import { Warehouse, PackageCheck, Clock, Award } from 'lucide-react';

const stats = [
  {
    icon: Warehouse,
    value: '10.000 m²',
    label: 'Diện tích kho bãi',
    sub: 'Lưu trữ & trung chuyển',
  },
  {
    icon: PackageCheck,
    value: '3.000+',
    label: 'Danh mục SKU',
    sub: 'Sẵn sàng giao ngay',
  },
  {
    icon: Clock,
    value: '24 - 48h',
    label: 'Thời gian giao hàng',
    sub: 'Tối ưu toàn Miền Bắc',
  },
  {
    icon: Award,
    value: 'ISO 9001:2015',
    label: 'Tiêu chuẩn chất lượng',
    sub: 'Quản lý kho đạt chuẩn',
  },
];

export function AboutStats() {
  return (
    <section className="py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-2xl font-bold text-slate-900 sm:text-3xl">
                {item.value}
              </span>
              <span className="mt-1 text-sm font-semibold text-slate-700">
                {item.label}
              </span>
              <span className="mt-0.5 text-xs text-slate-500">{item.sub}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

---

### Task 3: Component Vị Trí Kết Nối Thuận Tiện (`about-location.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-location.tsx`

**Interfaces:**
- Consumes: Icon từ `lucide-react` (`Navigation`, `Ship`, `Plane`, `Route`, `Building2`), Image từ `public/images/about/location-aerial.webp`
- Produces: `AboutLocation` component function

- [ ] **Step 1: Khởi tạo file `about-location.tsx`**

```tsx
import Image from 'next/image';
import { Ship, Plane, Route, Building2 } from 'lucide-react';

const connectivityList = [
  {
    icon: Ship,
    title: 'Cách Cảng Hải Phòng: 100km (~1.5h vận chuyển)',
  },
  {
    icon: Plane,
    title: 'Cách Sân bay Quốc tế Nội Bài: 80km',
  },
  {
    icon: Route,
    title: 'Kết nối trực tiếp đường cao tốc Cầu Giẽ - Ninh Bình',
  },
  {
    icon: Building2,
    title: 'Tiếp cận nhanh các KCN: Hà Nam, Nam Định, Thái Bình...',
  },
];

export function AboutLocation() {
  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            Vị trí chiến lược
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Trung tâm kết nối thuận tiện
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            Nằm tại vị trí nút giao thông huyết mạch, dễ dàng tiếp cận các khu công nghiệp trọng điểm miền Bắc và kết nối nhanh chóng đến cảng biển/sân bay.
          </p>
          <ul className="mt-2 space-y-3.5">
            {connectivityList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} className="flex items-start gap-3 text-slate-700">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium">{item.title}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-900/10">
            <Image
              src="/images/about/location-aerial.webp"
              alt="Vị trí kết nối giao thông Hub Hà Nam"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### Task 4: Component Hạ Tầng & Hệ Thống Tối Ưu (`about-infrastructure.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-infrastructure.tsx`

**Interfaces:**
- Consumes: Images từ `public/images/about/op-wms.webp`, `op-warehouse.webp`, `op-truck.webp`, `op-team.webp`
- Produces: `AboutInfrastructure` component function

- [ ] **Step 1: Khởi tạo file `about-infrastructure.tsx`**

```tsx
import Image from 'next/image';

const items = [
  {
    image: '/images/about/op-wms.webp',
    title: 'Hệ thống kho WMS',
    desc: 'Quản lý kho hàng tự động, theo dõi tồn kho theo thời gian thực chuẩn xác.',
  },
  {
    image: '/images/about/op-warehouse.webp',
    title: 'Quản lý đơn hàng OMS',
    desc: 'Xử lý đơn hàng thông minh, tối ưu hóa quy trình từ khâu đặt hàng đến xuất kho.',
  },
  {
    image: '/images/about/op-truck.webp',
    title: 'Mạng lưới Vận tải',
    desc: 'Đội xe vận chuyển chuyên dụng, đảm bảo giao hàng an toàn, đúng hẹn.',
  },
  {
    image: '/images/about/op-team.webp',
    title: 'Đội ngũ chuyên nghiệp',
    desc: 'Kỹ sư & chuyên gia tư vấn giải pháp vật tư kỹ thuật chuyên sâu cho nhà máy.',
  },
];

export function AboutInfrastructure() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          Vận hành thông minh
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Hạ tầng kỹ thuật & Hệ thống tối ưu
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col p-5">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

### Task 5: Component Tiêu Chuẩn Quốc Tế ISO (`about-standards.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-standards.tsx`

**Interfaces:**
- Consumes: Icon từ `lucide-react` (`ShieldCheck`, `Leaf`, `HeartPulse`)
- Produces: `AboutStandards` component function

- [ ] **Step 1: Khởi tạo file `about-standards.tsx`**

```tsx
import { ShieldCheck, Leaf, HeartPulse } from 'lucide-react';

const standards = [
  {
    icon: ShieldCheck,
    title: 'ISO 9001:2015',
    tag: 'Hệ thống quản lý chất lượng',
    desc: 'Quy trình kiểm soát chất lượng vật tư đầu vào và xuất kho nghiêm ngặt.',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    icon: Leaf,
    title: 'ISO 14001:2015',
    tag: 'Quản lý môi trường',
    desc: 'Cam kết vận hành thân thiện với môi trường và tiết kiệm năng lượng tiêu thụ.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    icon: HeartPulse,
    title: 'ISO 45001:2018',
    tag: 'An toàn & Sức khỏe nghề nghiệp',
    desc: 'Đảm bảo môi trường làm việc an toàn tuyệt đối cho toàn bộ nhân sự.',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
  },
];

export function AboutStandards() {
  return (
    <section className="py-12 px-6 rounded-3xl bg-slate-50 border border-slate-100 my-4">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          Quy trình chất lượng
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Vận hành theo tiêu chuẩn quốc tế
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {standards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <span className="mt-1 text-xs font-semibold text-blue-600">
                {item.tag}
              </span>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

---

### Task 6: Component Phát Triển Bền Vững (`about-sustainability.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-sustainability.tsx`

**Interfaces:**
- Consumes: Icon từ `lucide-react` (`ArrowRight`), Image từ `public/images/about/hero-warehouse-wide.webp`
- Produces: `AboutSustainability` component function

- [ ] **Step 1: Khởi tạo file `about-sustainability.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

export function AboutSustainability() {
  return (
    <section className="py-8 lg:py-12">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="grid grid-cols-1 items-center lg:grid-cols-12">
          <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full lg:col-span-6 overflow-hidden">
            <Image
              src="/images/about/hero-warehouse-wide.webp"
              alt="Phát triển bền vững Hub Hà Nam"
              fill
              className="object-cover opacity-80"
            />
          </div>
          <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 mb-4">
              <Leaf className="h-3.5 w-3.5" />
              Phát triển bền vững
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Kiến tạo tương lai xanh
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              Cam kết sử dụng năng lượng tái tạo (hệ thống điện mặt trời mái kho), tối ưu hóa bao bì đóng gói tái chế và giảm thiểu lượng phát thải carbon trong toàn bộ chuỗi cung ứng vật tư B2B.
            </p>
            <div className="mt-6">
              <Link
                href="/about/sustainability"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### Task 7: Component Tin Tức Thị Trường (`about-news.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-news.tsx`

**Interfaces:**
- Consumes: Icon `ArrowRight`, `Calendar`, `User`
- Produces: `AboutNews` component function

- [ ] **Step 1: Khởi tạo file `about-news.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

const articles = [
  {
    id: '1',
    title: 'Thắt chặt chuỗi cung ứng vật tư B2B năm 2026',
    snippet: 'Những giải pháp đột phá giúp các nhà máy tối ưu hóa chi phí dự trữ kho bãi.',
    category: 'Thị trường',
    author: 'Minh Tuấn',
    date: '05/08/2026',
    image: '/images/about/quality-hero-bg.webp',
  },
  {
    id: '2',
    title: 'Ứng dụng hệ thống WMS trong quản lý kho hiện đại',
    snippet: 'Tự động hóa dữ liệu giúp kiểm soát tỷ lệ sai lệch tồn kho dưới 0.01%.',
    category: 'Công nghệ',
    author: 'Bích Ngọc',
    date: '02/08/2026',
    image: '/images/about/op-wms.webp',
  },
  {
    id: '3',
    title: 'Giải pháp giao hàng thần tốc 24h vùng kinh tế trọng điểm',
    snippet: 'Mạng lưới kết nối giao thông đồng bộ giúp tối ưu lộ trình xe tải.',
    category: 'Vận tải',
    author: 'Hoàng Nam',
    date: '28/07/2026',
    image: '/images/about/op-truck.webp',
  },
  {
    id: '4',
    title: 'Tiêu chuẩn xanh cho hệ thống kho hàng công nghiệp',
    snippet: 'Chuyển đổi năng lượng mặt trời giảm 35% chi phí vận hành kho.',
    category: 'Bền vững',
    author: 'Khánh Linh',
    date: '20/07/2026',
    image: '/images/about/quality-lab.webp',
  },
];

export function AboutNews() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          Tin tức thị trường
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Cập nhật xu hướng và diễn biến mới nhất
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((item) => (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="font-semibold text-blue-600">{item.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {item.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-600">
                {item.title}
              </h3>
              <p className="mt-2 text-xs text-slate-600 line-clamp-2 flex-1">
                {item.snippet}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <User className="h-3 w-3" /> {item.author}
                </span>
                <Link
                  href={`/about/news/${item.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Đọc tiếp <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/about/news"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-all"
        >
          Xem tất cả
        </Link>
      </div>
    </section>
  );
}
```

---

### Task 8: Component Form Liên Hệ & Bản Đồ (`about-contact.tsx`)

**Files:**
- Create: `frontend/src/components/about/about-contact.tsx`

**Interfaces:**
- Consumes: Icon `MapPin`, `Phone`, `Mail`, `Clock`, `Send`
- Produces: `AboutContact` component function

- [ ] **Step 1: Khởi tạo file `about-contact.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export function AboutContact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-12">
      <div className="rounded-3xl bg-slate-50 p-6 sm:p-10 border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
            LIÊN HỆ VỚI CHÚNG TÔI
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Kết nối với ULink Industries ngay hôm nay
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl">
            Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của Quý doanh nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Cột trái: Form */}
          <div className="lg:col-span-7 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Gửi yêu cầu tư vấn</h3>
            {submitted ? (
              <div className="rounded-xl bg-emerald-50 p-6 text-center text-emerald-800">
                <p className="font-semibold text-base">Cảm ơn bạn đã liên hệ!</p>
                <p className="text-xs mt-1">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email doanh nghiệp *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung cần tư vấn</label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả nhu cầu vật tư hoặc thắc mắc của bạn..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
                >
                  <Send className="h-4 w-4" /> Gửi yêu cầu
                </button>
              </form>
            )}
          </div>

          {/* Cột phải: Thông tin liên hệ + Bản đồ */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Văn phòng & Hub Hà Nam</span>
                  <span className="text-xs font-bold text-slate-800">KCN Đồng Văn, Thị xã Duy Tiên, Tỉnh Hà Nam</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Hotline tư vấn</span>
                  <span className="text-xs font-bold text-slate-800">1900 6868 - 0988 123 456</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500">Email</span>
                  <span className="text-xs font-bold text-slate-800">support@ulink.vn</span>
                </div>
              </div>
            </div>

            {/* Bản đồ Preview */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title="ULink Ha Nam Hub Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.473595677843!2d105.975765!3d20.650228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135c345a5555555%3A0x1!2zS0NOIMSQ4buTbmcgVsSDbiwgRHV5IFRpw6puLCBIw6AgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### Task 9: Lắp Ráp Trang About & Kiểm Tra Biên Dịch (`about/page.tsx`)

**Files:**
- Modify: `frontend/src/app/[locale]/(main)/about/page.tsx`

**Interfaces:**
- Consumes: `AboutHero`, `AboutStats`, `AboutLocation`, `AboutInfrastructure`, `AboutStandards`, `AboutSustainability`, `AboutNews`, `AboutContact`

- [ ] **Step 1: Cập nhật `about/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AboutHero } from '@/components/about/about-hero';
import { AboutStats } from '@/components/about/about-stats';
import { AboutLocation } from '@/components/about/about-location';
import { AboutInfrastructure } from '@/components/about/about-infrastructure';
import { AboutStandards } from '@/components/about/about-standards';
import { AboutSustainability } from '@/components/about/about-sustainability';
import { AboutNews } from '@/components/about/about-news';
import { AboutContact } from '@/components/about/about-contact';

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Giới thiệu</span>
        </nav>

        {/* 8 Section chính */}
        <AboutHero />
        <AboutStats />
        <div className="my-4 h-px w-full bg-slate-200" />
        <AboutLocation />
        <AboutInfrastructure />
        <AboutStandards />
        <AboutSustainability />
        <AboutNews />
        <AboutContact />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Chạy kiểm tra TypeScript (`npm run typecheck`)**

Command: `npm run typecheck`
Expected: Zero errors.

---

## Verification Plan

### Automated Tests
- Chạy `npm run typecheck` để đảm bảo 100% không có lỗi Type trong toàn bộ project.

### Manual Verification
- Truy cập địa chỉ `http://localhost:3000/vi/about` (hoặc dev server) để kiểm tra giao diện từng section đúng 100% so với ảnh mẫu.
