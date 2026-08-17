import Link from 'next/link';
import { Briefcase, MapPin, Clock, Calendar, DollarSign, Award, Share2 } from '@/components/icons';

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
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-blue-700">
                Phòng Kinh doanh B2B
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">Hà Nội</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">Full-time</span>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-amber-700">
                Hạn nộp: 30/08/2026
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-[color,background-color,border-color,box-shadow,opacity,transform]">
            <Share2 className="h-4 w-4" /> Chia sẻ
          </button>
          <Link
            href="/about/careers/b2b-sales/apply"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
          >
            Ứng tuyển ngay
          </Link>
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
