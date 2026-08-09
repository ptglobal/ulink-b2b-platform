import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ApplyHeader } from '@/components/about/careers/apply/apply-header';
import { ApplyForm } from '@/components/about/careers/apply/apply-form';
import { ApplySidebar } from '@/components/about/careers/apply/apply-sidebar';

export default async function ApplyJobPage({
  params: { locale },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-slate-50/50 min-h-screen py-4">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about/careers" className="hover:text-blue-600 transition-colors">
            Tuyển dụng
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about/careers/b2b-sales" className="hover:text-blue-600 transition-colors">
            Kinh doanh
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Nộp đơn ứng tuyển</span>
        </nav>

        {/* Header */}
        <ApplyHeader />

        {/* Main 2 Columns Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ApplyForm />
          </div>
          <div className="lg:col-span-4">
            <ApplySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
