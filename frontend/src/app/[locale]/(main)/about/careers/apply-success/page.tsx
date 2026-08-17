import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ApplySuccessHero } from '@/components/about/careers/apply-success/apply-success-hero';
import { ApplySuccessRecap } from '@/components/about/careers/apply-success/apply-success-recap';
import { ApplySuccessSteps } from '@/components/about/careers/apply-success/apply-success-steps';
import { ApplySuccessRecommendations } from '@/components/about/careers/apply-success/apply-success-recommendations';

export default async function ApplySuccessPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-slate-50/50 min-h-screen py-4">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about/careers" className="hover:text-blue-600 transition-colors">
            Vị trí tuyển dụng
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Ứng tuyển thành công</span>
        </nav>

        {/* 4 Section chính */}
        <ApplySuccessHero />
        <ApplySuccessRecap />
        <ApplySuccessSteps />
        <ApplySuccessRecommendations />
      </div>
    </div>
  );
}
