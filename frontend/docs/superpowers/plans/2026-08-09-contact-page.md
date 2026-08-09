# Implementation Plan: Trang Liên Hệ Hub Hà Nam (Contact Page)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang "Liên hệ — Hub Hà Nam Trung tâm phân phối" (Contact Page) tại route `/contact` với 3 UI components chính tái hiện chính xác 100% giao diện thiết kế mẫu.

**Architecture:** Tạo 3 UI components độc lập trong `frontend/src/components/contact/`, sau đó lắp ráp toàn bộ vào trang chính `frontend/src/app/[locale]/(main)/contact/page.tsx` kèm hệ thống Breadcrumbs chuẩn.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS, Lucide React, TypeScript, next-intl.

## Global Constraints

- Mọi component phải được lập trình bằng TypeScript (`.tsx`) đảm bảo Type Safety 100%.
- Thiết kế chuẩn Responsive (Mobile, Tablet, Desktop 1440px).
- Quy chuẩn `border-radius`: Container lớn dùng `rounded-2xl`, card/box dùng `rounded-xl` hoặc `rounded-lg`, badge dùng `rounded-full`.
- Quy chuẩn màu sắc: ULink Primary Blue (`text-blue-600`, `bg-blue-600`), Slate Backgrounds.
- Tuân thủ quy chuẩn SEO (H1 cho Hero Title, H2 cho các Section Title).
- Chạy `npm run typecheck` thành công không có bất kỳ lỗi biên dịch nào.

---

### Task 1: Component Hero Section & 3 Điểm Nhấn Kho Bãi (`contact-hero.tsx`)

**Files:**
- Create: `frontend/src/components/contact/contact-hero.tsx`

**Interfaces:**
- Consumes: Lucide Icons (`MapPin`, `Building2`, `ShieldCheck`), Image
- Produces: `ContactHero` component function

- [ ] **Step 1: Khởi tạo file `contact-hero.tsx`**

```tsx
import Image from 'next/image';
import { MapPin, Building2, ShieldCheck } from 'lucide-react';

const valueProps = [
  {
    icon: MapPin,
    title: 'Vị trí chiến lược',
    desc: 'Kết nối nhanh đến các KCN và cảng biển lớn',
  },
  {
    icon: Building2,
    title: 'Kho vận hiện đại',
    desc: 'Hệ thống quản lý chuẩn quốc tế, tối ưu quy trình xử lý',
  },
  {
    icon: ShieldCheck,
    title: 'Vận hành tin cậy',
    desc: 'Quy trình kiểm soát, an toàn và minh bạch',
  },
];

export function ContactHero() {
  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            LIÊN HỆ
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            Hub Hà Nam - Trung tâm phân phối
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Trung tâm phân phối chiến lược tại cửa ngõ phía Nam Hà Nội, kết nối linh hoạt với các cụm công nghiệp trọng điểm và hệ thống logistics toàn quốc.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {valueProps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    <p className="text-[11px] text-slate-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Photo */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-900/10">
            <Image
              src="/images/about/kho.png"
              alt="Trung tâm phân phối ULink Hub Hà Nam"
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

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 2: Component Khối Thông Tin Liên Hệ, Form Yêu Cầu & Bản Đồ (`contact-info-cards.tsx`)

**Files:**
- Create: `frontend/src/components/contact/contact-info-cards.tsx`

**Interfaces:**
- Consumes: Form state, router, Lucide Icons (`MapPin`, `Phone`, `Mail`, `Clock`, `ArrowRight`)
- Produces: `ContactInfoCards` component function

- [ ] **Step 1: Khởi tạo file `contact-info-cards.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export function ContactInfoCards() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/about/contact-success');
  };

  return (
    <section className="py-8 lg:py-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Col 1: Thông tin liên hệ (4 Cols) */}
        <div className="lg:col-span-4 rounded-xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
            THÔNG TIN LIÊN HỆ
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-slate-900 mb-0.5">Địa chỉ</span>
                <span className="text-slate-600 leading-relaxed">Lô CN05, KCN Đồng Văn IV, Xã Đại Cường, Huyện Kim Bảng, Tỉnh Hà Nam, Việt Nam</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-slate-900 mb-0.5">Điện thoại</span>
                <span className="text-slate-600 font-semibold">(+84) 226 3 888 908</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-slate-900 mb-0.5">Email</span>
                <span className="text-slate-600 font-semibold">contact@ulinkindustries.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-slate-900 mb-0.5">Giờ làm việc</span>
                <span className="block text-slate-600">Thứ 2 - Thứ 6: 08:00 - 17:00</span>
                <span className="block text-slate-600">Thứ 7: 08:00 - 12:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Form gửi yêu cầu liên hệ (5 Cols) */}
        <div className="lg:col-span-5 rounded-xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
              GỬI YÊU CẦU LIÊN HỆ
            </h2>
            <p className="text-[11px] text-slate-500">
              Vui lòng điền thông tin, đội ngũ của chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ và tên"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Công ty *</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="(+84) 123 456 789"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chủ đề *</label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-600"
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="baogiao">Báo giá vật tư MRO</option>
                  <option value="hop tac">Hợp tác cung ứng</option>
                  <option value="kythuat">Tư vấn giải pháp kỹ thuật</option>
                  <option value="khac">Yêu cầu khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nội dung yêu cầu *</label>
              <textarea
                rows={3}
                required
                placeholder="Nhập nội dung yêu cầu của bạn..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-all"
            >
              Gửi đi <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Col 3: Vị trí trung tâm & Map (3 Cols) */}
        <div className="lg:col-span-3 rounded-xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              VỊ TRÍ TRUNG TÂM
            </h2>
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 mt-3">
              <iframe
                title="ULink Hub Ha Nam Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.473595677843!2d105.975765!3d20.650228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135c345a5555555%3A0x1!2zS0NOIMSQ4buTbmcgVsSDbiwgRHV5IFRpw6puLCBIw6AgTmFt!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>
          </div>

          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Xem bản đồ trên Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Kiểm tra biên dịch component**

---

### Task 3: Component Thanh Năng Lực & Cam Kết 5 Badge (`contact-capabilities.tsx`)

**Files:**
- Create: `frontend/src/components/contact/contact-capabilities.tsx`

**Interfaces:**
- Consumes: Lucide Icons (`Truck`, `Boxes`, `ShieldCheck`, `Cpu`, `Leaf`)
- Produces: `ContactCapabilities` component function

- [ ] **Step 1: Khởi tạo file `contact-capabilities.tsx`**

```tsx
import { Truck, Boxes, ShieldCheck, Cpu, Leaf } from 'lucide-react';

const capabilities = [
  { icon: Truck, title: 'Giao hàng nhanh', desc: 'Mạng lưới toàn quốc, tối ưu' },
  { icon: Boxes, title: 'Năng lực lưu trữ lớn', desc: 'Diện tích kho > 10,000 m²' },
  { icon: ShieldCheck, title: 'An toàn & Bảo mật', desc: 'Chuẩn ISO 9001, 14001' },
  { icon: Cpu, title: 'Công nghệ hiện đại', desc: 'WMS, TMS tự động hóa' },
  { icon: Leaf, title: 'Phát triển bền vững', desc: 'Hướng tới Logistics xanh' },
];

export function ContactCapabilities() {
  return (
    <section className="py-8 border-t border-slate-100">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {capabilities.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
                <p className="text-[10px] text-slate-500">{c.desc}</p>
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

### Task 4: Lắp Ráp Trang Contact Page & Kiểm Tra Typecheck (`contact/page.tsx`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/contact/page.tsx`

**Interfaces:**
- Consumes: All 3 contact components created in Tasks 1-3
- Produces: Default Export `ContactPage`

- [ ] **Step 1: Khởi tạo file `contact/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ContactHero } from '@/components/contact/contact-hero';
import { ContactInfoCards } from '@/components/contact/contact-info-cards';
import { ContactCapabilities } from '@/components/contact/contact-capabilities';

export default async function ContactPage({
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
          <Link href="/contact" className="hover:text-blue-600 transition-colors">
            Liên hệ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Hub Hà Nam - Trung tâm phân phối</span>
        </nav>

        {/* 3 Section chính */}
        <ContactHero />
        <ContactInfoCards />
        <ContactCapabilities />
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
- Truy cập `http://localhost:3000/vi/contact` trên trình duyệt để kiểm tra toàn bộ trang Liên hệ Hub Hà Nam render đúng giao diện thiết kế mẫu.
