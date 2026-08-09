# Implementation Plan: Trang Cơ Hội Nghề Nghiệp (Careers Page)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang "Cơ hội nghề nghiệp" (Careers Page) hoàn chỉnh cho ULink B2B Platform tại route `/about/careers` với 7 UI components tái hiện chính xác 100% thiết kế mẫu.

**Architecture:** Tạo 7 UI components độc lập trong `frontend/src/components/about/careers/`, sau đó lắp ráp toàn bộ vào trang chính `frontend/src/app/[locale]/(main)/about/careers/page.tsx` kèm hệ thống Breadcrumbs chuẩn.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn `border-radius`: Container lớn dùng `rounded-2xl`, card/box dùng `rounded-xl`, icon/badge/button dùng `rounded-lg` hoặc `rounded-full`.
- Quy chuẩn màu sắc: ULink Primary Blue (`text-blue-600`, `bg-blue-600`), Slate Backgrounds.
- Tuân thủ quy chuẩn SEO (H1 cho Hero Title, H2 cho các Section Title).
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Component Hero & Key Metrics Bar (`careers-hero.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/careers-hero.tsx`

**Interfaces:**
- Consumes: Lucide Icons (`MapPin`, `Users`, `TrendingUp`, `Award`, `Clock`, `Building2`, `HeartHandshake`)
- Produces: `CareersHero` component function

- [ ] **Step 1: Khởi tạo file `careers-hero.tsx`**

```tsx
import Image from 'next/image';
import { MapPin, Users, TrendingUp, Award, Clock, HeartHandshake } from 'lucide-react';

const stats = [
  { value: '100+', label: 'Nhân sự tài năng', icon: Users },
  { value: '15+', label: 'Năm kinh nghiệm', icon: Clock },
  { value: '35+', label: 'Đối tác lớn', icon: Award },
  { value: '98%', label: 'Tỷ lệ gắn bó', icon: HeartHandshake },
];

export function CareersHero() {
  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Headline & Quick Props */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            TÌM KIẾM NHÂN TÀI
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            Kiến tạo giá trị khác biệt. Phát triển bền vững.
          </h1>
          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Tại ULink B2B Platform, chúng tôi xây dựng một môi trường làm việc cởi mở, sáng tạo, nơi mỗi cá nhân đều được trao quyền bứt phá và tạo ra giá trị thực sự cho chuỗi cung ứng công nghiệp Việt Nam.
          </p>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Vị trí thuận lợi</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Users className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Môi trường mở</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <TrendingUp className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Phát triển lâu dài</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-900/10">
            <Image
              src="/images/about/op-team.webp"
              alt="Đội ngũ nhân sự ULink B2B Platform"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Impression Metrics Bar */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-slate-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-slate-900">{s.value}</span>
                <span className="text-xs font-medium text-slate-500">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 2: Component Giá Trị Cốt Lõi (`careers-culture.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/careers-culture.tsx`

**Interfaces:**
- Consumes: Lucide Icons (`Sparkles`, `Users`, `ShieldCheck`, `TrendingUp`, `Target`, `Heart`)
- Produces: `CareersCulture` component function

- [ ] **Step 1: Khởi tạo file `careers-culture.tsx`**

```tsx
import { Sparkles, Users, ShieldCheck, TrendingUp, Target, Heart } from 'lucide-react';

const values = [
  {
    icon: Sparkles,
    title: 'Môi trường mở & Đổi mới',
    desc: 'Khuyến khích mọi cá nhân đưa ra ý tưởng mới, sáng tạo không giới hạn và thử nghiệm giải pháp đột phá.',
  },
  {
    icon: Users,
    title: 'Tinh thần đồng đội',
    desc: 'Hợp tác chặt chẽ, chia sẻ tri thức và luôn sẵn sàng hỗ trợ lẫn nhau hoàn thành mục tiêu chung.',
  },
  {
    icon: ShieldCheck,
    title: 'Liêm chính & Uy tín',
    desc: 'Đặt tinh thần trung thực, minh bạch và tính cam kết uy tín lên hàng đầu trong mọi hành động.',
  },
  {
    icon: TrendingUp,
    title: 'Phát triển cá nhân',
    desc: 'Tạo mọi điều kiện học tập, tham gia đào tạo chuyên sâu và lộ trình thăng tiến rõ ràng cho từng vị trí.',
  },
  {
    icon: Target,
    title: 'Cam kết sứ mệnh',
    desc: 'Đồng lòng hướng tới sứ mệnh tối ưu hóa chuỗi cung ứng vật tư B2B cho cộng đồng doanh nghiệp Việt.',
  },
  {
    icon: Heart,
    title: 'Đóng góp cộng đồng',
    desc: 'Gắn liền sự phát triển của doanh nghiệp với trách nhiệm xã hội và định hướng phát triển xanh bền vững.',
  },
];

export function CareersCulture() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          VĂN HÓA & NỀN TẢNG
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Giá trị cốt lõi của chúng tôi
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl">
          Những nguyên tắc định hình phong cách làm việc và môi trường doanh nghiệp tại ULink.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex flex-col rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
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

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 3: Component Tin Tức Tuyển Dụng (`careers-news.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/careers-news.tsx`

**Interfaces:**
- Consumes: Image, Lucide Icons (`ArrowRight`, `Calendar`)
- Produces: `CareersNews` component function

- [ ] **Step 1: Khởi tạo file `careers-news.tsx`**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

const featuredNews = {
  title: 'ULink chào đón 20+ nhân sự mới gia nhập đợt 3/2026',
  snippet: 'Buổi đón chào nhân sự mới với chuỗi hoạt động onboarding gắn kết và đào tạo chuyên sâu về hệ thống B2B.',
  date: '08/08/2026',
  image: '/images/about/op-team.webp',
};

const newsList = [
  {
    id: '1',
    title: 'Hành trình phát triển sự nghiệp của kỹ sư vận hành tại Hub Hà Nam',
    category: 'Chia sẻ nhân sự',
    date: '02/08/2026',
    image: '/images/about/op-wms.webp',
  },
  {
    id: '2',
    title: 'Chương trình đào tạo kỹ năng quản lý chuỗi cung ứng 2026',
    category: 'Đào tạo',
    date: '25/07/2026',
    image: '/images/about/op-warehouse.webp',
  },
  {
    id: '3',
    title: 'Ngày hội văn hóa thể thao ULink Sports Day 2026',
    category: 'Văn hóa doanh nghiệp',
    date: '18/07/2026',
    image: '/images/about/quality-hero-bg.webp',
  },
];

export function CareersNews() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          CẬP NHẬT MỚI NHẤT
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Tin tức tuyển dụng
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Featured News (Left) */}
        <div className="lg:col-span-6 flex flex-col rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden group">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
            <Image
              src={featuredNews.image}
              alt={featuredNews.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-6 flex flex-col flex-1">
            <span className="text-xs text-slate-500 flex items-center gap-1 mb-2">
              <Calendar className="h-3 w-3" /> {featuredNews.date}
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {featuredNews.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 flex-1">
              {featuredNews.snippet}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                href="/about/news"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Đọc tiếp <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Small News Cards (Right) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {newsList.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl bg-white p-4 border border-slate-100 shadow-sm transition-all hover:shadow-md group"
            >
              <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-blue-600 mb-0.5">
                  {item.category} • {item.date}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
              </div>
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

### Task 4: Component Môi Trường Làm Việc Gallery (`careers-gallery.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/careers-gallery.tsx`

**Interfaces:**
- Consumes: Gallery image paths
- Produces: `CareersGallery` component function

- [ ] **Step 1: Khởi tạo file `careers-gallery.tsx`**

```tsx
import Image from 'next/image';

const photos = [
  { src: '/images/about/op-team.webp', alt: 'Không gian văn phòng hiện đại' },
  { src: '/images/about/kho.png', alt: 'Trung tâm kho bãi Hub Hà Nam' },
  { src: '/images/about/quality-lab.webp', alt: 'Phòng kiểm định chất lượng' },
  { src: '/images/about/op-wms.webp', alt: 'Vận hành công nghệ WMS' },
  { src: '/images/about/op-warehouse.webp', alt: 'Đóng gói sản phẩm chuẩn ISO' },
  { src: '/images/about/location-aerial.webp', alt: 'Vị trí kết nối thuận tiện' },
];

export function CareersGallery() {
  return (
    <section className="py-8 lg:py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          KHÔNG GIAN LÀM VIỆC
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Môi trường làm việc
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-xl">
          Trải nghiệm môi trường làm việc năng động, chuyên nghiệp và đầy cảm hứng tại ULink.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
        {photos.map((p, idx) => (
          <div
            key={idx}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-sm border border-slate-100 group"
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
              <span className="text-xs font-semibold text-white">{p.alt}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 5: Component Danh Sách Vị Trí Tuyển Dụng & Đãi Ngộ (`careers-job-list.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/careers-job-list.tsx`

**Interfaces:**
- Consumes: Search input state, dropdown selections, Lucide Icons (`Search`, `MapPin`, `Briefcase`, `Clock`, `CheckCircle2`)
- Produces: `CareersJobList` component function

- [ ] **Step 1: Khởi tạo file `careers-job-list.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Search, MapPin, Briefcase, Clock, CheckCircle2 } from 'lucide-react';

const jobsData = [
  {
    id: '1',
    title: 'Chuyên viên Quản lý Khách hàng (Account Manager)',
    type: 'Full-time',
    location: 'Hà Nội',
    department: 'Kinh doanh B2B',
  },
  {
    id: '2',
    title: 'Kỹ sư Vận hành & Bảo trì Kho (Warehouse Ops Engineer)',
    type: 'Full-time',
    location: 'Hà Nam',
    department: 'Vận hành Kho bãi',
  },
  {
    id: '3',
    title: 'Chuyên viên Mua hàng & Chuỗi cung ứng (Procurement Specialist)',
    type: 'Full-time',
    location: 'Hà Nội',
    department: 'Chuỗi cung ứng',
  },
];

const benefits = [
  'Thu nhập hấp dẫn & Thưởng hiệu suất công việc',
  'Cơ hội thăng tiến rõ ràng theo lộ trình cá nhân',
  'Môi trường chuyên nghiệp, đồng nghiệp hòa đồng',
  'Bảo hiểm sức khỏe cao cấp & Khám sức khỏe định kỳ',
  'Khóa đào tạo chuyên sâu về kỹ thuật & chuỗi cung ứng B2B',
];

export function CareersJobList() {
  const [search, setSearch] = useState('');

  const filteredJobs = jobsData.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="py-12" id="openings">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Job Search & List */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
              VỊ TRÍ TUYỂN DỤNG
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Gia nhập đội ngũ ULink</h2>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm vị trí tuyển dụng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600">
              <option value="">Tất cả phòng ban</option>
              <option value="k doanh">Kinh doanh B2B</option>
              <option value="van hanh">Vận hành Kho bãi</option>
              <option value="supply">Chuỗi cung ứng</option>
            </select>
            <select className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-600">
              <option value="">Tất cả địa điểm</option>
              <option value="hanoi">Hà Nội</option>
              <option value="hanam">Hà Nam</option>
            </select>
          </div>

          {/* Job List */}
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-sm border border-slate-100 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-blue-600" /> {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-600" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-blue-600" /> {job.type}
                    </span>
                  </div>
                </div>
                <button className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all">
                  Ứng tuyển
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              &lt;
            </button>
            <button className="h-8 w-8 rounded-lg bg-blue-600 text-xs font-bold text-white">
              1
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              2
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              3
            </button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              &gt;
            </button>
          </div>
        </div>

        {/* Right Column: Why Join ULink */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-50 p-6 sm:p-8 border border-slate-100 flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
              ĐÃI NGỘ HẤP DẪN
            </span>
            <h2 className="text-xl font-bold text-slate-900">Vì sao nên chọn ULink?</h2>
          </div>

          <ul className="space-y-4">
            {benefits.map((b, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 6: Component Newsletter Đăng Ký Việc Làm (`careers-newsletter.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/careers-newsletter.tsx`

**Interfaces:**
- Consumes: Lucide Icons (`Send`, `Mail`)
- Produces: `CareersNewsletter` component function

- [ ] **Step 1: Khởi tạo file `careers-newsletter.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export function CareersNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-8 lg:py-12">
      <div className="rounded-2xl bg-blue-600 p-8 lg:p-12 text-white shadow-xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold text-white border border-white/30">
              <Mail className="h-3.5 w-3.5" /> NẮM BẮT CƠ HỘI
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Đăng ký nhận tin tuyển dụng
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Nhận thông báo ngay khi có vị trí làm việc mới phù hợp với kỹ năng và định hướng phát triển của bạn.
            </p>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-6">
            {submitted ? (
              <div className="rounded-xl bg-white/20 p-4 text-center text-white backdrop-blur">
                <p className="font-bold text-sm">Cảm ơn bạn đã đăng ký!</p>
                <p className="text-xs mt-1">Chúng tôi sẽ gửi thông báo công việc mới tới email của bạn.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn..."
                  className="w-full flex-1 rounded-xl px-4 py-3 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
                >
                  <Send className="h-4 w-4" /> Đăng ký ngay
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 7: Component Liên Hệ HR & Bản Đồ (`careers-contact.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/careers-contact.tsx`

**Interfaces:**
- Consumes: Lucide Icons (`MapPin`, `Phone`, `Mail`)
- Produces: `CareersContact` component function

- [ ] **Step 1: Khởi tạo file `careers-contact.tsx`**

```tsx
import { MapPin, Phone, Mail } from 'lucide-react';

export function CareersContact() {
  return (
    <section className="py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
          LIÊN HỆ & ĐỊA CHỈ
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Phòng Nhân Sự ULink Industries
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: HR Contacts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">Trụ sở Hà Nội</span>
                <span className="text-xs font-bold text-slate-800">Tầng 8, Tòa nhà HL Building, Cầu Giấy, Hà Nội</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">Hotline tuyển dụng</span>
                <span className="text-xs font-bold text-slate-800">024 7300 9899</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500">Email nhận CV</span>
                <span className="text-xs font-bold text-slate-800">hr@ulink.vn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Map */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <iframe
              title="ULink Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814184964!2d105.78189631502444!3d21.02881188599839!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab868b5001e5%3A0x82f49d32d0f507b9!2zQ8CauIEdp4bqteSwgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 8: Lắp Ráp Trang Careers Page & Kiểm Tra Typecheck (`careers/page.tsx`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/about/careers/page.tsx`

**Interfaces:**
- Consumes: All 7 components created in Tasks 1-7
- Produces: Default Export `CareersPage`

- [ ] **Step 1: Khởi tạo file `careers/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { CareersHero } from '@/components/about/careers/careers-hero';
import { CareersCulture } from '@/components/about/careers/careers-culture';
import { CareersNews } from '@/components/about/careers/careers-news';
import { CareersGallery } from '@/components/about/careers/careers-gallery';
import { CareersJobList } from '@/components/about/careers/careers-job-list';
import { CareersNewsletter } from '@/components/about/careers/careers-newsletter';
import { CareersContact } from '@/components/about/careers/careers-contact';

export default async function CareersPage({
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
          <span className="text-blue-600 font-semibold">Cơ hội nghề nghiệp</span>
        </nav>

        {/* 7 Section chính */}
        <CareersHero />
        <CareersCulture />
        <CareersNews />
        <CareersGallery />
        <CareersJobList />
        <CareersNewsletter />
        <CareersContact />
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
- Truy cập `http://localhost:3000/vi/about/careers` trên trình duyệt để kiểm tra toàn bộ 7 section render đúng giao diện thiết kế mẫu.
