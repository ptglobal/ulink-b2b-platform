import Image from 'next/image';
import { ArrowRight, Package } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { SectionHeader } from './section-header';

export async function CaseStudies() {
  const t = await getTranslations('home');

  return (
    <section className="mx-auto w-full max-w-[1800px] px-4 py-12 lg:py-16">
      {/* ── SECTION HEADER BAR ── */}
      <SectionHeader
        title={t('caseStudy.sectionTitle')}
        subtitle={t('caseStudy.sectionSubTitle')}
        viewAllHref="/resources"
        viewAllLabel={t('caseStudy.viewAll')}
      />

      {/* ── 3 CASE STUDY CARDS GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {[1, 2, 3].map((num) => (
          <Link
            key={num}
            href={`/resources/case-study-${num}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            {/* Top Banner Image with ULINK Logo Watermark */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={ASSETS.home.solutionPackaging}
                alt="Case Study Production Line"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* ULINK Watermark Badge Top Right */}
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-black/40 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-brand" />
                ULINK
              </div>
            </div>

            {/* Middle Text Area */}
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[13px] font-bold text-[#4A6FA5] sm:text-[14px]">
                {t(`caseStudy.card${num}Category` as any)}
              </p>
              <h3 className="mt-3 text-[14px] font-bold leading-relaxed text-slate-800 sm:text-[15px]">
                {t(`caseStudy.card${num}Title` as any)}
              </h3>
            </div>

            {/* Card Footer Bar */}
            <div className="mt-auto flex items-center justify-between border-t border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Package className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-primary sm:text-[14px]">
                    {t(`caseStudy.card${num}Metric` as any)}
                  </p>
                  <p className="text-[11px] text-muted-foreground sm:text-[12px]">
                    {t(`caseStudy.card${num}Tag` as any)}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
