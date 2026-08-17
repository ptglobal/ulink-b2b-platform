import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { QualityHero } from '@/components/about/standards/quality-hero';
import { QualityStandardsGrid } from '@/components/about/standards/quality-standards-grid';
import { QualityBadges } from '@/components/about/standards/quality-badges';
import { QualityProcess } from '@/components/about/standards/quality-process';
import { QualityCommitments } from '@/components/about/standards/quality-commitments';
import { getPagePresentation } from '@/lib/page-presentation';

export default async function QualityStandardsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const presentation = await getPagePresentation('about-standards', locale);

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
          <span className="text-blue-600 font-semibold">Chất lượng & Tiêu chuẩn</span>
        </nav>

        {/* Các section chính */}
        <QualityHero media={presentation?.heroMedia} />
        <QualityStandardsGrid />
        <QualityBadges />
        <QualityProcess />
        <QualityCommitments />
      </div>
    </div>
  );
}
