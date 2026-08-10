'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  FileText,
  Settings,
  FileCheck,
  CheckSquare,
  Shield,
  TrendingUp,
  Zap,
  X,
  Clock
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

export function ResourcesNews() {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedDocTitle, setSelectedDocTitle] = useState('');

  const handleDocClick = (e: React.MouseEvent, title: string) => {
    e.preventDefault();
    setSelectedDocTitle(title);
    setShowComingSoon(true);
  };

  const docsData = [
    {
      num: 1,
      icon: Download,
      category: 'Catalogue',
      title: 'Danh mục sản phẩm 2026',
      meta: 'PDF - 18MB / 20 Trang'
    },
    {
      num: 2,
      icon: FileText,
      category: 'Tài liệu kỹ thuật',
      title: 'Hướng dẫn lựa chọn găng tay Nitrile cho phòng sạch',
      meta: 'PDF - 8MB / 3 Trang'
    },
    {
      num: 3,
      icon: Settings,
      category: 'Tài liệu kỹ thuật',
      title: 'Tiêu chuẩn màng co PE',
      meta: 'PDF - 6.5MB / 3 Trang'
    },
    {
      num: 4,
      icon: FileCheck,
      category: 'Profile - Doanh nghiệp',
      title: 'Hồ sơ năng lực ULink Industries',
      meta: 'PDF - 18MB / 20 Trang'
    }
  ];

  return (
    <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16 relative">
      {/* ── 1. MASTER SECTION HEADER BAR ── */}
      <div className="flex items-start gap-3">
        {/* 3 dots cyan accent indicator */}
        <div className="mt-1.5 flex flex-col gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand" />
          <span className="h-2 w-2 rounded-full bg-brand/60" />
          <span className="h-2 w-2 rounded-full bg-brand/30" />
        </div>
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
            Tài nguyên & Thông tin
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
            Cập nhật tin tức thị trường, tiêu chuẩn kỹ thuật và tài liệu sản phẩm B2B
          </p>
        </div>
      </div>

      {/* ── 2. SUB-SECTION HEADER BAR (TIN TỨC MỚI NHẤT) ── */}
      <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded bg-brand" />
          <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
            Tin tức mới nhất
          </h3>
        </div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong sm:text-[15px]"
        >
          Xem tất cả tin tức
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* ── 3. 3 NEWS CARDS GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {[
          { num: 1, date: '10 Tháng 8, 2026', title: 'Xu hướng phòng sạch sản xuất bán dẫn 2026' },
          { num: 2, date: '08 Tháng 8, 2026', title: 'Quy trình kiểm định chất lượng màng PE quấn Pallet' },
          { num: 3, date: '05 Tháng 8, 2026', title: 'Giải pháp bảo vệ linh kiện chống tĩnh điện ESD' }
        ].map((news) => (
          <Link
            key={news.num}
            href={`/resources/news-${news.num}`}
            className="group flex flex-col transition-all"
          >
            {/* Top Article Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={ASSETS.about.qualityLab}
                alt="News Article Production Lab"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Publish Date */}
            <p className="mt-4 text-[13px] font-bold text-brand sm:text-[14px]">
              {news.date}
            </p>

            {/* News Article Title */}
            <h4 className="mt-2 text-[14px] font-bold leading-relaxed text-[#4A6FA5] transition-colors group-hover:text-brand sm:text-[15px] lg:text-[16px]">
              {news.title}
            </h4>

            {/* Card Footer "Read More" */}
            <div className="mt-6 mt-auto flex items-center justify-between border-t border-slate-200/80 pt-4">
              <span className="text-[14px] font-semibold text-brand transition-colors group-hover:text-brand-strong sm:text-[15px]">
                Đọc tiếp
              </span>
              <ArrowRight className="h-5 w-5 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── 4. SUB-SECTION HEADER BAR (TÀI LIỆU & CATALOGUE) ── */}
      <div className="mt-12 flex items-center gap-3 border-t border-border pt-8 sm:mt-16">
        <div className="h-5 w-1 rounded bg-brand" />
        <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
          Tài liệu & Catalogue
        </h3>
      </div>

      {/* ── 4 DOCUMENT CARDS GRID (With Coming Soon Click Handler) ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {docsData.map((doc) => {
          const IconComp = doc.icon;
          return (
            <div
              key={doc.num}
              onClick={(e) => handleDocClick(e, doc.title)}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-blue-500/50"
            >
              {/* Tầng 1: Icon & Top Right ArrowUpRight */}
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center text-brand">
                  <IconComp className="h-8 w-8 text-blue-600" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-6 w-6 text-blue-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </div>

              {/* Tầng 2: Nội dung chính */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-[13px] font-medium text-slate-400 sm:text-[14px]">
                  {doc.category}
                </p>
                <h4 className="mt-2 text-[15px] font-bold text-slate-800 transition-colors group-hover:text-blue-600 sm:text-[16px]">
                  {doc.title}
                </h4>
              </div>

              {/* Tầng 3: Footer Metadata */}
              <div className="mt-6 mt-auto border-t border-slate-100 pt-4">
                <p className="text-[12px] font-medium text-slate-400 sm:text-[13px]">
                  {doc.meta}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 5. SUB-SECTION HEADER BAR (TƯ VẤN & HỖ TRỢ) ── */}
      <div className="mt-12 flex items-center gap-3 border-t border-border pt-8 sm:mt-16">
        <div className="h-5 w-1 rounded bg-brand" />
        <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
          Tư vấn & Hỗ trợ kỹ thuật
        </h3>
      </div>

      {/* ── 4 SUPPORT CARDS GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { num: 1, icon: CheckSquare, title: 'Yêu cầu mẫu thử', desc: 'Đăng ký nhận mẫu thử vật tư phòng sạch test trực tiếp tại nhà máy.' },
          { num: 2, icon: Shield, title: 'Hồ sơ năng lực CO/CQ', desc: 'Cung cấp chứng nhận nguồn gốc xuất xứ và kiểm định phòng sạch.' },
          { num: 3, icon: TrendingUp, title: 'Tối ưu hóa chi phí B2B', desc: 'Tư vấn giải pháp vật tư giúp tiết kiệm từ 15% - 25% chi phí sản xuất.' },
          { num: 4, icon: Zap, title: 'Hỗ trợ kỹ thuật 24/7', desc: 'Đội ngũ kỹ sư tư vấn giải pháp phòng sạch và bảo hộ chuyên sâu.' }
        ].map((supp) => {
          const IconComp = supp.icon;
          return (
            <div
              key={supp.num}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-start text-brand">
                <IconComp className="h-9 w-9 text-blue-600" aria-hidden="true" />
              </div>
              <h4 className="mt-6 text-[16px] font-bold text-slate-800 sm:text-[18px]">
                {supp.title}
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
                {supp.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════
          COMING SOON MODAL DIALOG
         ════════════════════════════════════════════════════════════ */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-4">
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1.5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="h-7 w-7 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Coming Soon
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 pt-1">
                Tính năng Tải Tài liệu đang cập nhật
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Tài liệu <strong className="text-slate-800 font-bold">&quot;{selectedDocTitle}&quot;</strong> đang trong quá trình chuẩn bị bản PDF chính thức. Vui lòng liên hệ hotline hỗ trợ kinh doanh B2B để nhận tệp trực tiếp!
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Đã hiểu & Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
