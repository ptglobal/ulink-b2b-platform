# Implementation Plan: Trang Chi Tiết Vị Trí Tuyển Dụng (Job Detail Page)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang "Chi tiết vị trí tuyển dụng" (Job Detail Page) động cho ULink B2B Platform tại route `/about/careers/[slug]` với 5 UI components tái hiện chính xác 100% giao diện thiết kế mẫu.

**Architecture:** Tạo 5 UI components độc lập trong `frontend/src/components/about/careers/detail/`, sau đó lắp ráp toàn bộ vào trang chính `frontend/src/app/[locale]/(main)/about/careers/[slug]/page.tsx` kèm hệ thống Breadcrumbs chuẩn.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn `border-radius`: Container lớn dùng `rounded-2xl`, card/box dùng `rounded-xl`, icon/badge/button dùng `rounded-lg` hoặc `rounded-full`.
- Quy chuẩn màu sắc: ULink Primary Blue (`text-blue-600`, `bg-blue-600`), Slate Backgrounds.
- Tuân thủ quy chuẩn SEO (H1 cho Hero Title, H2 cho các Section Title).
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Component Header Banner & Quick Info (`job-detail-header.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/detail/job-detail-header.tsx`

**Interfaces:**
- Consumes: Job title, salary, experience, level, job type
- Produces: `JobDetailHeader` component function

- [ ] **Step 1: Khởi tạo file `job-detail-header.tsx`**

```tsx
import { Briefcase, MapPin, Clock, Calendar, DollarSign, Award, Share2 } from 'lucide-react';

export function JobDetailHeader() {
  return (
    <section className="py-6 border-b border-slate-100">
      {/* Title & Top Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-xl shadow-md">
            UL
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Chuyên viên Phát triển Kinh doanh B2B - Khu Công nghiệp
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-blue-700">Phòng Kinh doanh B2B</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">Hà Nội</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">Full-time</span>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-amber-700">Hạn nộp: 30/08/2026</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all">
            <Share2 className="h-4 w-4" /> Chia sẻ
          </button>
          <a
            href="#apply"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
          >
            Ứng tuyển ngay
          </a>
        </div>
      </div>

      {/* 4 Quick Info Cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3.5 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">Mức lương</span>
            <span className="text-sm font-bold text-slate-900">15 - 25 triệu</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">Kinh nghiệm</span>
            <span className="text-sm font-bold text-slate-900">1 - 3 năm</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">Cấp bậc</span>
            <span className="text-sm font-bold text-slate-900">Chuyên viên</span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-semibold text-slate-500">Hình thức</span>
            <span className="text-sm font-bold text-slate-900">Full-time</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 2: Component Nội Dung JD & Quyền Lợi (`job-detail-content.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/detail/job-detail-content.tsx`

**Interfaces:**
- Consumes: Job details, requirements, benefits cards list
- Produces: `JobDetailContent` component function

- [ ] **Step 1: Khởi tạo file `job-detail-content.tsx`**

```tsx
import { CheckCircle2, MapPin, Clock, ShieldCheck, Heart, TrendingUp, Gift, GraduationCap } from 'lucide-react';

const benefits = [
  { icon: Heart, title: 'Thu nhập hấp dẫn', desc: 'Lương cứng + Hoa hồng doanh số kinh doanh B2B không giới hạn.' },
  { icon: Gift, title: 'Thưởng định kỳ', desc: 'Thưởng Tháng 13 & thưởng hiệu suất Quý/Năm theo doanh số.' },
  { icon: ShieldCheck, title: 'Chế độ Bảo hiểm', desc: 'Đóng BHXH, BHYT, BHTN đầy đủ + Gói sức khỏe ULink Care.' },
  { icon: GraduationCap, title: 'Đào tạo bài bản', desc: 'Khóa học chuyên sâu về sản phẩm vật tư kỹ thuật & Sales B2B.' },
  { icon: TrendingUp, title: 'Lộ trình thăng tiến', desc: 'Đánh giá năng lực 6 tháng/lần, cơ hội lên Quản lý nhóm.' },
  { icon: Heart, title: 'Văn hóa & Du lịch', desc: 'Team building, du lịch nghỉ dưỡng hàng năm cùng công ty.' },
];

export function JobDetailContent() {
  return (
    <div className="flex flex-col gap-8 py-8">
      {/* 1. Mô tả công việc */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">
          Mô tả công việc
        </h2>
        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700 list-disc list-inside">
          <li>Tìm kiếm, tiếp cận và phát triển quan hệ hợp tác với các doanh nghiệp sản xuất trong các Khu công nghiệp.</li>
          <li>Tư vấn giải pháp vật tư kỹ thuật tổng thể (MRO, bao bì công nghiệp, trang thiết bị phòng sạch...).</li>
          <li>Lập báo giá, đàm phán thương lượng hợp đồng cung ứng và theo dõi tiến độ thực hiện đơn hàng.</li>
          <li>Phối hợp với bộ phận Vận tải & Kho bãi Hub Hà Nam đảm bảo tiến độ giao hàng đúng cam kết cho nhà máy.</li>
          <li>Báo cáo kết quả kinh doanh định kỳ và cập nhật dữ liệu khách hàng lên hệ thống CRM ULink.</li>
        </ul>
      </div>

      {/* 2. Yêu cầu ứng viên */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">
          Yêu cầu ứng viên
        </h2>
        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700 list-disc list-inside mb-4">
          <li>Tốt nghiệp Đại học chuyên ngành Kinh tế, Quản trị kinh doanh, Thương mại hoặc các ngành Kỹ thuật liên quan.</li>
          <li>Có từ 1 - 3 năm kinh nghiệm sales B2B, ưu tiên ứng viên từng bán hàng vào các nhà máy sản xuất tại KCN.</li>
          <li>Kỹ năng giao tiếp, đàm phán thương lượng và thuyết phục khách hàng doanh nghiệp tốt.</li>
          <li>Chủ động, có tinh thần trách nhiệm cao và chịu được áp lực doanh số.</li>
          <li>Sử dụng thành thạo máy tính văn phòng và phần mềm CRM.</li>
        </ul>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">#B2BSales</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">#KhuCongNghiep</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">#CungUngVatTu</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">#NhaMaySanXuat</span>
        </div>
      </div>

      {/* 3. Quyền lợi được hưởng */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-3">
          Quyền lợi được hưởng
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex flex-col rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">{b.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Địa điểm & Thời gian làm việc */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 border-l-4 border-blue-600 pl-3">
          Địa điểm & Thời gian làm việc
        </h2>
        <div className="rounded-xl bg-white p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>Địa chỉ:</strong> Tầng 8, Tòa nhà HL Building, Ngõ 82 Duy Tân, Cầu Giấy, Hà Nội</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <Clock className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span><strong>Thời gian:</strong> Thứ 2 - Thứ 6 (8h00 - 17h00), Thứ 7 (8h00 - 12h00)</span>
          </div>

          {/* Embedded Google Map */}
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-slate-200 mt-2">
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
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 3: Component Quy Trình Ứng Tuyển (`job-detail-process.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/detail/job-detail-process.tsx`

**Interfaces:**
- Consumes: Steps timeline array
- Produces: `JobDetailProcess` component function

- [ ] **Step 1: Khởi tạo file `job-detail-process.tsx`**

```tsx
import { Mail, Phone } from 'lucide-react';

const processSteps = [
  { num: '01', title: 'Ứng tuyển', desc: 'Gửi CV ứng tuyển trực tiếp tại website hoặc email HR.' },
  { num: '02', title: 'Sàng lọc hồ sơ', desc: 'Phòng HR tiếp nhận và phản hồi ứng viên trong 48h.' },
  { num: '03', title: 'Phỏng vấn', desc: 'Phỏng vấn chuyên môn 1-2 vòng với Trưởng phòng.' },
  { num: '04', title: 'Nhận việc', desc: 'Gửi Offer Letter và làm thủ tục Onboarding.' },
];

export function JobDetailProcess() {
  return (
    <section className="py-6 border-t border-slate-100" id="apply">
      <h2 className="text-lg font-bold text-slate-900 mb-4 border-l-4 border-blue-600 pl-3">
        Quy trình ứng tuyển
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((s, idx) => (
          <div key={idx} className="flex flex-col rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-xs font-extrabold text-blue-600 mb-1">{s.num}</span>
            <h3 className="text-xs font-bold text-slate-900">{s.title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* HR Support Note Box */}
      <div className="mt-6 rounded-xl bg-blue-50 p-5 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-900">Liên hệ trực tiếp Phòng Nhân sự ULink</span>
            <span className="text-xs text-slate-600">Email: hr@ulink.vn | Hotline: 024 7300 9899</span>
          </div>
        </div>

        <a
          href="mailto:hr@ulink.vn"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
        >
          Gửi CV qua Email
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 4: Component Sidebar Tổng Quan & Việc Làm Cùng Phòng Ban (`job-detail-sidebar.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/detail/job-detail-sidebar.tsx`

**Interfaces:**
- Consumes: Related jobs list, job metadata
- Produces: `JobDetailSidebar` component function

- [ ] **Step 1: Khởi tạo file `job-detail-sidebar.tsx`**

```tsx
import Link from 'next/link';
import { Share2, ArrowRight } from 'lucide-react';

const sameDeptJobs = [
  { id: '1', title: 'Account Manager B2B', location: 'Hà Nội' },
  { id: '2', title: 'Chuyên viên Phát triển Thị trường', location: 'Hà Nam' },
  { id: '3', title: 'Kỹ sư Tư vấn Giải pháp Kỹ thuật', location: 'Hà Nội' },
];

export function JobDetailSidebar() {
  return (
    <div className="flex flex-col gap-6 py-8">
      {/* 1. Job Summary Card */}
      <div className="rounded-xl bg-slate-50 p-6 border border-slate-100 flex flex-col gap-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
          Tổng quan vị trí
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Số lượng tuyển:</span>
            <span className="font-semibold text-slate-900">03 người</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Cấp bậc:</span>
            <span className="font-semibold text-slate-900">Chuyên viên</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Kinh nghiệm:</span>
            <span className="font-semibold text-slate-900">1 - 3 năm</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Giới tính:</span>
            <span className="font-semibold text-slate-900">Không yêu cầu</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Hạn nộp hồ sơ:</span>
            <span className="font-semibold text-amber-700">30/08/2026</span>
          </div>
        </div>

        <a
          href="#apply"
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
        >
          Ứng tuyển ngay
        </a>
      </div>

      {/* 2. Same Department Jobs */}
      <div className="rounded-xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Vị trí cùng phòng ban
        </h3>

        <div className="flex flex-col gap-3">
          {sameDeptJobs.map((item) => (
            <Link
              key={item.id}
              href="/about/careers/b2b-sales"
              className="flex flex-col p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">{item.location}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 5: Component Các Vị Trí Khác Đang Tuyển Dụng (`job-detail-related.tsx`)

**Files:**
- Create: `frontend/src/components/about/careers/detail/job-detail-related.tsx`

**Interfaces:**
- Consumes: Related jobs data list
- Produces: `JobDetailRelated` component function

- [ ] **Step 1: Khởi tạo file `job-detail-related.tsx`**

```tsx
import Link from 'next/link';
import { MapPin, Briefcase, Clock, ArrowRight } from 'lucide-react';

const relatedJobs = [
  {
    id: '1',
    title: 'Kỹ sư Vận hành & Bảo trì Kho (Warehouse Ops Engineer)',
    department: 'Vận hành Kho bãi',
    location: 'Hà Nam',
    type: 'Full-time',
  },
  {
    id: '2',
    title: 'Chuyên viên Mua hàng & Chuỗi cung ứng (Procurement)',
    department: 'Chuỗi cung ứng',
    location: 'Hà Nội',
    type: 'Full-time',
  },
  {
    id: '3',
    title: 'Chuyên viên Marketing B2B (B2B Marketing Specialist)',
    department: 'Marketing',
    location: 'Hà Nội',
    type: 'Full-time',
  },
];

export function JobDetailRelated() {
  return (
    <section className="py-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-900">Các vị trí khác đang tuyển dụng</h2>
        <Link href="/about/careers" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {relatedJobs.map((job) => (
          <div
            key={job.id}
            className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-blue-200"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{job.title}</h3>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3 text-blue-600" /> {job.department}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-600" /> {job.location}</span>
              </div>
            </div>
            <Link
              href="/about/careers/detail"
              className="inline-flex justify-center rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 6: Lắp Ráp Trang Job Detail Page & Kiểm Tra Typecheck (`careers/[slug]/page.tsx`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/about/careers/[slug]/page.tsx`

**Interfaces:**
- Consumes: All 5 detail components created in Tasks 1-5
- Produces: Default Export `JobDetailPage`

- [ ] **Step 1: Khởi tạo file `careers/[slug]/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { JobDetailHeader } from '@/components/about/careers/detail/job-detail-header';
import { JobDetailContent } from '@/components/about/careers/detail/job-detail-content';
import { JobDetailSidebar } from '@/components/about/careers/detail/job-detail-sidebar';
import { JobDetailProcess } from '@/components/about/careers/detail/job-detail-process';
import { JobDetailRelated } from '@/components/about/careers/detail/job-detail-related';

export default async function JobDetailPage({
  params: { locale },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-4">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            Về chúng tôi
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about/careers" className="hover:text-blue-600 transition-colors">
            Cơ hội nghề nghiệp
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold truncate max-w-[250px] sm:max-w-none">
            Chuyên viên Phát triển Kinh doanh B2B
          </span>
        </nav>

        {/* 1. Header Banner & Quick Info */}
        <JobDetailHeader />

        {/* 2. Main Content 2 Columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <JobDetailContent />
            <JobDetailProcess />
          </div>
          <div className="lg:col-span-4">
            <JobDetailSidebar />
          </div>
        </div>

        {/* 3. Related Jobs */}
        <JobDetailRelated />
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
- Truy cập `http://localhost:3000/vi/about/careers/b2b-sales` trên trình duyệt để kiểm tra toàn bộ 5 section render đúng giao diện thiết kế mẫu.
