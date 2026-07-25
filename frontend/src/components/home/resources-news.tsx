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
  Zap
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

export async function ResourcesNews() {
  const t = await getTranslations('home');

  return (
    <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16">
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
            {t('resourcesSection.sectionTitle')}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
            {t('resourcesSection.sectionSubTitle')}
          </p>
        </div>
      </div>

      {/* ── 2. SUB-SECTION HEADER BAR (TIN TỨC MỚI NHẤT) ── */}
      <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 rounded bg-brand" />
          <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
            {t('resourcesSection.newsSectionTitle')}
          </h3>
        </div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-strong sm:text-[15px]"
        >
          {t('resourcesSection.viewAllNews')}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* ── 3. 3 NEWS CARDS GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {[1, 2, 3].map((num) => (
          <Link
            key={num}
            href={`/resources/news-${num}`}
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
              {t(`resourcesSection.card${num}Date` as any)}
            </p>

            {/* News Article Title */}
            <h4 className="mt-2 text-[14px] font-bold leading-relaxed text-[#4A6FA5] transition-colors group-hover:text-brand sm:text-[15px] lg:text-[16px]">
              {t(`resourcesSection.card${num}Title` as any)}
            </h4>

            {/* Card Footer "Read More" */}
            <div className="mt-6 mt-auto flex items-center justify-between border-t border-slate-200/80 pt-4">
              <span className="text-[14px] font-semibold text-brand transition-colors group-hover:text-brand-strong sm:text-[15px]">
                {t('resourcesSection.readMore')}
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
          {t('resourcesSection.docsTitle')}
        </h3>
      </div>

      {/* ── 4 DOCUMENT CARDS GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { num: 1, icon: Download },
          { num: 2, icon: FileText },
          { num: 3, icon: Settings },
          { num: 4, icon: FileCheck }
        ].map(({ num, icon: IconComp }) => (
          <Link
            key={num}
            href={`/resources/docs-${num}`}
            className="group flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            {/* Tầng 1: Icon & Top Right ArrowUpRight */}
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center text-brand">
                <IconComp className="h-8 w-8" aria-hidden="true" />
              </div>
              <ArrowUpRight className="h-6 w-6 text-brand transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </div>

            {/* Tầng 2: Nội dung chính */}
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-[13px] font-medium text-slate-500 sm:text-[14px]">
                {t(`resourcesSection.doc${num}Category` as any)}
              </p>
              <h4 className="mt-2 text-[15px] font-bold text-slate-800 transition-colors group-hover:text-brand sm:text-[16px]">
                {t(`resourcesSection.doc${num}Title` as any)}
              </h4>
            </div>

            {/* Tầng 3: Footer Metadata */}
            <div className="mt-6 mt-auto border-t border-border pt-4">
              <p className="text-[12px] font-medium text-slate-500 sm:text-[13px]">
                {t(`resourcesSection.doc${num}Meta` as any)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── 5. SUB-SECTION HEADER BAR (TƯ VẤN & HỖ TRỢ) ── */}
      <div className="mt-12 flex items-center gap-3 border-t border-border pt-8 sm:mt-16">
        <div className="h-5 w-1 rounded bg-brand" />
        <h3 className="text-[18px] font-bold text-primary sm:text-[20px] lg:text-[22px]">
          {t('resourcesSection.supportTitle')}
        </h3>
      </div>

      {/* ── 4 SUPPORT CARDS GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { num: 1, icon: CheckSquare },
          { num: 2, icon: Shield },
          { num: 3, icon: TrendingUp },
          { num: 4, icon: Zap }
        ].map(({ num, icon: IconComp }) => (
          <div
            key={num}
            className="flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-start text-brand">
              <IconComp className="h-9 w-9" aria-hidden="true" />
            </div>
            <h4 className="mt-6 text-[16px] font-bold text-slate-800 sm:text-[18px]">
              {t(`resourcesSection.supp${num}Title` as any)}
            </h4>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">
              {t(`resourcesSection.supp${num}Desc` as any)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
