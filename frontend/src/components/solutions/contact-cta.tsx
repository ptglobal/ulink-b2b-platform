import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

interface ContactCtaProps {
  locale: string;
}

export default async function ContactCta({ locale }: ContactCtaProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  return (
    <section className="w-full border-b border-[#e6eaf1] bg-white py-10 sm:py-12">
      <div className="mx-auto flex w-[calc(100%_-_2rem)] max-w-[80rem] flex-col items-start justify-between gap-7 sm:w-[calc(100%_-_4rem)] md:flex-row md:items-center">
        {/* Left Content Side */}
        <div className="flex flex-col">
          <span className="text-[16px] font-semibold text-foreground sm:text-[18px]">
            {t('contactCta.label')}
          </span>
          <h2 className="mt-1 text-[20px] font-semibold text-foreground sm:text-[22px]">
            {t('contactCta.heading')}
          </h2>
          <p className="mt-2 text-[12px] leading-5 text-muted-foreground sm:text-[13px]">
            {t('contactCta.desc')}
          </p>
        </div>

        {/* Right Action Side */}
        <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">
          <Link
            href="/contact"
            className="inline-flex h-11 w-1/2 items-center justify-center border border-brand bg-white px-6 text-center text-[12px] font-semibold text-brand transition-colors hover:bg-blue-50 sm:w-auto"
          >
            {t('contactCta.callNow')}
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 w-1/2 items-center justify-center border border-brand bg-brand px-6 text-center text-[12px] font-semibold text-white transition-colors hover:bg-brand-strong sm:w-auto"
          >
            {t('contactCta.sendRequest')}
          </Link>
        </div>
      </div>
    </section>
  );
}
