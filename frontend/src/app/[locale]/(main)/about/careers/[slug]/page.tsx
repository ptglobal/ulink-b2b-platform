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
