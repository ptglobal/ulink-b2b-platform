import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ASSETS } from '@/lib/assets';
import { cn } from '@/lib/utils';

export async function PartnersCertifications({
  variant = 'default'
}: {
  variant?: 'default' | 'industries';
} = {}) {
  const t = await getTranslations('home');
  const isIndustries = variant === 'industries';

  return (
    <section
      className={cn(
        'mx-auto w-full bg-white px-4 py-12',
        isIndustries ? 'max-w-[1344px] sm:px-8 lg:py-14' : 'max-w-[1440px] lg:py-16'
      )}
    >
      {/* ── SECTION HEADER BAR ── */}
      <div className="flex items-start gap-3">
        {/* 3 dots cyan accent indicator */}
        <div className="mt-1.5 flex flex-col gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand" />
          <span className="h-2 w-2 rounded-full bg-brand/60" />
          <span className="h-2 w-2 rounded-full bg-brand/30" />
        </div>
        <div>
          <h2
            className={cn(
              'tracking-tight text-primary',
              isIndustries
                ? 'text-[22px] font-semibold sm:text-2xl'
                : 'text-[24px] font-extrabold sm:text-[28px] lg:text-[32px]'
            )}
          >
            {t('partners.sectionTitle')}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
            {t('partners.sectionSubTitle')}
          </p>
        </div>
      </div>

      {/* ── PARTNERS LOGO GRID (6 COLS x 2 ROWS) ── */}
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
          isIndustries
            ? 'mt-9 gap-x-6 gap-y-4 [&>div]:!h-20 [&_img]:!h-12 [&_img]:!max-h-12 lg:gap-x-8'
            : 'mt-12 gap-8 lg:gap-12'
        )}
      >
        {/* 1. Samsung */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerSamsung}
            alt="Samsung"
            width={260}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>
        {/* 2. Canon */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerCanon}
            alt="Canon"
            width={260}
            height={120}
            className="h-20 w-auto max-h-[90px] object-contain sm:h-24 lg:max-h-[105px]"
          />
        </div>
        {/* 3. Panasonic */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerPanasonic}
            alt="Panasonic"
            width={260}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>
        {/* 4. IBM */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerIbm}
            alt="IBM"
            width={240}
            height={120}
            className="h-20 w-auto max-h-[90px] object-contain sm:h-24 lg:max-h-[105px]"
          />
        </div>
        {/* 5. Traphaco */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerTraphaco}
            alt="Traphaco"
            width={260}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>
        {/* 6. Coca-Cola */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerCocaCola}
            alt="Coca-Cola"
            width={260}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>

        {/* 7. VinFast */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerVinfast}
            alt="VinFast"
            width={260}
            height={120}
            className="h-22 w-auto max-h-[105px] object-contain sm:h-26 lg:max-h-[120px]"
          />
        </div>
        {/* 8. LG */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerLg}
            alt="LG"
            width={240}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>
        {/* 9. Amkor */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerAmkor}
            alt="Amkor Technology"
            width={260}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>
        {/* 10. Vinamilk */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerVinamilk}
            alt="Vinamilk"
            width={260}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>
        {/* 11. 3M */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partner3m}
            alt="3M"
            width={240}
            height={120}
            className="h-20 w-auto max-h-[96px] object-contain sm:h-24 lg:max-h-[110px]"
          />
        </div>
        {/* 12. BYD */}
        <div className="flex h-32 items-center justify-center p-2 transition-transform hover:scale-105 sm:h-36">
          <Image
            src={ASSETS.home.partnerByd}
            alt="BYD"
            width={240}
            height={120}
            className="h-16 w-auto max-h-[80px] object-contain sm:h-20 lg:max-h-[96px]"
          />
        </div>
      </div>

      {/* ── CERTIFICATIONS & ISO STANDARDS ROW (5 COLUMNS) ── */}
      <div className={cn(isIndustries ? 'mt-11 pt-8' : 'mt-16 border-border pt-12')}>
        <div
          className={cn(
            'grid grid-cols-1 items-center sm:grid-cols-2 lg:grid-cols-5',
            isIndustries
              ? 'gap-5 [&>div:not(:first-child)]:!h-24 [&_img]:!h-20 [&_img]:!max-h-20 lg:gap-7'
              : 'gap-8'
          )}
        >
          {/* Col 1: Title & Desc */}
          <div className="flex flex-col justify-center pr-4">
            <h3
              className={cn(
                'text-primary',
                isIndustries ? 'text-[17px] font-semibold' : 'text-[18px] font-bold sm:text-[20px]'
              )}
            >
              {t('partners.isoTitle')}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
              {t('partners.isoDesc')}
            </p>
          </div>

          {/* Col 2: ISO 9001:2015 / QUACERT / JAS-ANZ */}
          <div className="flex h-36 items-center justify-center p-2 sm:h-40">
            <Image
              src={ASSETS.home.certIso9001}
              alt="ISO 9001:2015 QUACERT JAS-ANZ"
              width={320}
              height={140}
              className="h-28 w-auto max-h-[128px] object-contain sm:h-32"
            />
          </div>

          {/* Col 3: SGS */}
          <div className="flex h-36 items-center justify-center p-2 sm:h-40">
            <Image
              src={ASSETS.home.certSgs}
              alt="SGS Certification"
              width={300}
              height={140}
              className="h-26 w-auto max-h-[116px] object-contain sm:h-30"
            />
          </div>

          {/* Col 4: RoHS compliant */}
          <div className="flex h-36 items-center justify-center p-2 sm:h-40">
            <Image
              src={ASSETS.home.certRohs}
              alt="RoHS Compliant"
              width={320}
              height={140}
              className="h-28 w-auto max-h-[128px] object-contain sm:h-32"
            />
          </div>

          {/* Col 5: MSDS Material Safety Data Sheet */}
          <div className="flex h-36 items-center justify-center p-2 sm:h-40">
            <Image
              src={ASSETS.home.certMsds}
              alt="MSDS Material Safety Data Sheet"
              width={340}
              height={160}
              className="h-30 w-auto max-h-[136px] object-contain sm:h-34"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
