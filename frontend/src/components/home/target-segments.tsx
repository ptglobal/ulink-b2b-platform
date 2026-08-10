import { ArrowRight, Check, Building2, Factory } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function TargetSegments() {
  const t = await getTranslations('home');

  return (
    <section className="w-full py-8 lg:py-12">
      {/* ── SECTION HEADER BAR ── */}
      <div className="mx-auto w-full max-w-[1800px] px-4">
        <div className="flex items-start gap-3">
          {/* 3 dots cyan accent indicator */}
          <div className="mt-1.5 flex flex-col gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span className="h-2 w-2 rounded-full bg-brand/60" />
            <span className="h-2 w-2 rounded-full bg-brand/30" />
          </div>
          <div>
            <h2 className="text-[24px] font-extrabold tracking-tight text-primary sm:text-[28px] lg:text-[32px]">
              {t('targetSegments.sectionTitle')}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
              {t('targetSegments.sectionSubTitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ── 2 CARDS GRID FULL-WIDTH (FDI vs SME) ── */}
      <div className="mt-8 grid w-full grid-cols-1 lg:grid-cols-2">
        {/* CARD 1: DOANH NGHIỆP FDI (Dark Blue Theme) */}
        <div className="flex flex-col justify-between bg-[#4A6FA5] text-white shadow-sm">
          {/* ROW 1: TEXT CONTENT (With Left Padding Inset) */}
          <div className="p-6 sm:p-10 lg:pb-6 lg:pt-12 lg:pl-32 lg:pr-16 xl:pl-48">
            {/* Header: Circle Icon & Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#4A6FA5] sm:h-14 sm:w-14">
                <Building2 className="h-7 w-7 text-[#4A6FA5]" aria-hidden="true" />
              </div>
              <h3 className="text-[20px] font-bold text-white sm:text-[22px] lg:text-[24px]">
                {t('targetSegments.fdiTitle')}
              </h3>
            </div>

            {/* Checklist */}
            <ul className="mt-8 space-y-4 text-[14px] text-white/95 sm:text-[15px] lg:text-[16px]">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                <span>{t('targetSegments.fdiCheck1')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                <span>{t('targetSegments.fdiCheck2')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                <span>{t('targetSegments.fdiCheck3')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-white" aria-hidden="true" />
                <span>{t('targetSegments.fdiCheck4')}</span>
              </li>
            </ul>
          </div>

          {/* ROW 2: BUTTON ROW (Full Width Centered, Unaffected by Text Padding) */}
          <div className="flex w-full items-center justify-center px-6 pb-8 pt-4 sm:pb-10">
            <Link
              href="/solutions/categories/cleanroom-consumables"
              className="inline-flex items-center gap-2 rounded bg-white px-8 py-3 text-[14px] font-bold text-[#4A6FA5] shadow transition-transform hover:scale-102 hover:bg-white/95 sm:text-[15px]"
            >
              {t('targetSegments.viewDetail')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* CARD 2: DOANH NGHIỆP SME (Light Blue Pastel Theme) */}
        <div className="flex flex-col justify-between bg-[#D8E6FC] text-slate-800 shadow-sm">
          {/* ROW 1: TEXT CONTENT (With Left Padding Inset) */}
          <div className="p-6 sm:p-10 lg:pb-6 lg:pt-12 lg:pl-32 lg:pr-16 xl:pl-48">
            {/* Header: Icon & Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center text-brand sm:h-14 sm:w-14">
                <Factory className="h-8 w-8 text-brand" aria-hidden="true" />
              </div>
              <h3 className="text-[20px] font-bold text-slate-900 sm:text-[22px] lg:text-[24px]">
                {t('targetSegments.smeTitle')}
              </h3>
            </div>

            {/* Checklist */}
            <ul className="mt-8 space-y-4 text-[14px] text-slate-800 sm:text-[15px] lg:text-[16px]">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span>{t('targetSegments.smeCheck1')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span>{t('targetSegments.smeCheck2')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span>{t('targetSegments.smeCheck3')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span>{t('targetSegments.smeCheck4')}</span>
              </li>
            </ul>
          </div>

          {/* ROW 2: BUTTON ROW (Full Width Centered, Unaffected by Text Padding) */}
          <div className="flex w-full items-center justify-center px-6 pb-8 pt-4 sm:pb-10">
            <Link
              href="/solutions/categories/cleanroom-consumables"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-3 text-[14px] font-bold text-white shadow transition-transform hover:scale-102 hover:bg-brand-strong sm:text-[15px]"
            >
              {t('targetSegments.viewDetail')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
