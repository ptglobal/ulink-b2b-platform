import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

export async function HeroBanner() {
  const t = await getTranslations('home');

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 aspect-[1440/579] min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[579px]">
      {/* Full-width background image */}
      <div className="absolute inset-0 w-full h-full select-none">
        <Image
          src={ASSETS.home.hero}
          alt="ULINK Industrial Consumable Materials"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-start py-4 pl-4 sm:pl-4 lg:pl-4">
        {/* Outer Translucent Glass Wrapper */}
        <div className="relative flex h-full aspect-square items-center justify-center rounded-3xl border border-white/40 bg-white/35 p-3 shadow-2xl backdrop-blur-md sm:p-5 lg:p-6">
          {/* Inner White Glass Card */}
          <div className="flex h-full w-full flex-col justify-center rounded-2xl border border-white/75 bg-white/85 p-6 shadow-lg backdrop-blur-lg sm:p-8 md:p-10 lg:p-12">
            <div>
              <p className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground/90 sm:text-[16px]">
                {t('hero.eyebrowTop')}
              </p>

              <p className="mt-2 text-[15px] font-bold uppercase tracking-wider text-brand sm:text-[17px]">
                {t('hero.eyebrowSub')}
              </p>

              <h1 className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-tight text-primary sm:text-[44px] md:text-[52px] lg:text-[58px]">
                {t('hero.title')}
              </h1>

              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-[18px] lg:text-[20px]">
                {t('hero.description')}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="/quick-order"
                className="inline-flex h-13 items-center gap-3 rounded-lg bg-brand px-8 text-[16px] font-semibold text-brand-foreground shadow-md transition-all hover:bg-brand-strong sm:h-14 sm:px-10 sm:text-[18px]"
              >
                {t('hero.ctaRfq')}
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </Link>
              <Link
                href="/resources"
                className="inline-flex h-13 items-center gap-3 text-[16px] font-semibold text-brand transition-colors hover:text-brand-strong hover:bg-brand/5 px-5 sm:h-14 sm:text-[18px]"
              >
                {t('hero.ctaCatalogue')}
                <Image
                  src={ASSETS.home.iconSend}
                  alt="Catalogue"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain sm:h-7 sm:w-7"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
