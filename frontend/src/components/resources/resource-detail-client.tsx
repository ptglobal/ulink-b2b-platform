'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
    Share2,
  FileText,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

export interface ResourceData {
  slug: string;
  type: 'news' | 'case-study' | 'doc';
  category: string;
  title: string;
  description: string;
  date: string;
  author: string;
  readTime: string;
  coverImage: string;
  pdfUrl?: string;
  pdfSize?: string;
  contentHtml: string;
  highlights?: string[];
}

interface ResourceDetailClientProps {
  data: ResourceData;
  locale: string;
}

export function ResourceDetailClient({ data }: ResourceDetailClientProps) {
  return (
    <article suppressHydrationWarning className="min-h-screen bg-slate-50/50 pb-16 pt-8">
      {/* ── BREADCRUMB HEADER ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/resources" className="hover:text-brand transition-colors">
            Tài nguyên
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{data.category}</span>
        </div>

        {/* Back Button */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Danh mục Tài nguyên
        </Link>
      </div>

      {/* ── ARTICLE HERO SECTION ── */}
      <header className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          {/* Category & Type Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              {data.category}
            </span>
            {data.type === 'doc' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold">
                <ShieldCheck className="h-3.5 w-3.5" />
                Tài liệu Kỹ thuật
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0F1E36] tracking-tight leading-snug">
            {data.title}
          </h1>

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {data.description}
          </p>

          {/* Meta Info Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-6 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand" />
              <span>{data.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand" />
              <span>{data.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand" />
              <span>{data.readTime}</span>
            </div>
          </div>

          {/* Cover Image Banner */}
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-100 shadow-md">
            <Image
              src={data.coverImage}
              alt={data.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1000px"
              className="object-cover object-center"
            />
          </div>
        </div>
      </header>

      {/* ── ARTICLE MAIN CONTENT BODY ── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            

            {/* Highlights list if any */}
            {data.highlights && data.highlights.length > 0 && (
              <div className="mb-8 p-6 rounded-2xl bg-blue-50/60 border border-blue-100">
                <h3 className="text-xs font-extrabold text-[#0D4397] uppercase tracking-wider mb-3">
                  Điểm nổi bật của giải pháp
                </h3>
                <ul className="space-y-2.5">
                  {data.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* HTML Prose Content */}
            <div
              suppressHydrationWarning
              className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 font-normal space-y-4"
              dangerouslySetInnerHTML={{ __html: data.contentHtml }}
            />

            {/* Share / Footer */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Chủ đề: <strong className="text-slate-800">{data.category}</strong>
              </span>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Đã sao chép đường dẫn bài viết!');
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                Chia sẻ bài viết
              </button>
            </div>
          </div>

          {/* Sidebar Right Column */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Contact Widget */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <h3 className="text-base font-extrabold text-[#0F1E36]">Cần tư vấn giải pháp?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
                Đội ngũ kỹ sư phòng sạch ULink sẵn sàng tư vấn mẫu sản phẩm và gửi báo giá chi tiết trong 24h.
              </p>
              <Link
                href="/quick-order"
                className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand text-white text-xs font-bold shadow transition-colors hover:bg-brand-strong"
              >
                Yêu cầu Báo giá Ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Hub Support Banner */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest block mb-1">
                Hệ thống Kho vận
              </span>
              <h4 className="text-sm font-extrabold text-white">Giao hàng 2H tại các KCN</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Các Hub sẵn kho tại Bắc Ninh, Hải Phòng, Đồng Nai và Bình Dương hỗ trợ giao nhanh 24/7.
              </p>
              <Link
                href="/regional-hubs"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-white transition-colors"
              >
                Tra cứu vị trí Hubs <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

        </div>
      </main>
    </article>
  );
}
