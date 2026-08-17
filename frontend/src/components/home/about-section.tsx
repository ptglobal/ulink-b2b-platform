import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { SectionHeader } from './section-header';

export async function AboutSection() {
  const t = await getTranslations('home');

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-8 lg:py-12">
      {/* ── SECTION HEADER BAR ── */}
      <SectionHeader
        title={t('about.sectionTitle')}
        subtitle={t('about.sectionSubTitle')}
        viewAllHref="/about"
        viewAllLabel={t('about.viewDetail')}
      />

      {/* ── 2 COLUMNS CONTENT GRID ── */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
        {/* Left Column: Factory Building Photo & Caption */}
        <div className="flex flex-col lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 shadow-sm sm:aspect-[16/11]">
            <Image
              src={ASSETS.home.companyFactory}
              alt="ULINK Industries Ha Nam Factory Hub"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-102"
            />
          </div>
          {/* Photo Caption Bar */}
          <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground sm:text-[13px]">
            <span>{t('about.captionHub')}</span>
            <span>{t('about.captionStatus')}</span>
          </div>
        </div>

        {/* Right Column: Text Content & 4 Key Metric Items */}
        <div className="flex flex-col lg:col-span-6">
          <h3 className="text-[20px] font-bold leading-tight text-primary sm:text-[22px] lg:text-[24px]">
            {t('about.mainTitle')}
          </h3>

          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
            {t('about.mainDesc')}
          </p>

          <div className="my-6 border-b border-border" />

          {/* Bullet Points */}
          <ul className="space-y-2.5 text-[14px] text-foreground sm:text-[15px]">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{t('about.bullet1')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{t('about.bullet2')}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{t('about.bullet3')}</span>
            </li>
          </ul>

          {/* 4 Metric Items Grid with Dividers & 32x32 Icons */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-border">
            {/* Metric 1 */}
            <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
              <Image
                src={ASSETS.home.iconSlack}
                alt="Experience"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                {t('about.metric1')}
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
              <Image
                src={ASSETS.home.iconShield}
                alt="Quality"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                {t('about.metric2')}
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
              <Image
                src={ASSETS.home.iconTag}
                alt="SKU Count"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                {t('about.metric3')}
              </span>
            </div>

            {/* Metric 4 */}
            <div className="flex flex-col items-center p-3 text-center sm:px-2 sm:py-3">
              <Image
                src={ASSETS.home.iconTruck}
                alt="Fast Delivery"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="mt-3 text-[13px] font-medium text-foreground sm:text-[14px]">
                {t('about.metric4')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
