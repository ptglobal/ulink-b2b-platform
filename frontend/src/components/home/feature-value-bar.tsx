import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ASSETS } from '@/lib/assets';

export async function FeatureValueBar() {
  const t = await getTranslations('home');

  return (
    <section className="mx-auto mt-8 w-full max-w-[1440px] px-4 py-6 sm:mt-10">
      <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-y-0">
        {/* Card 1 */}
        <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:border-r lg:border-border lg:p-7">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src={ASSETS.home.iconNation}
              alt="Nationwide"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
              {t('features.nationwideTitle')}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
              {t('features.nationwideDesc')}
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:border-r lg:border-border lg:p-7">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src={ASSETS.home.iconAdapter}
              alt="Flexible"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
              {t('features.flexibleTitle')}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
              {t('features.flexibleDesc')}
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:border-r lg:border-border lg:p-7">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src={ASSETS.home.iconFile}
              alt="Cost Optimization"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
              {t('features.costTitle')}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
              {t('features.costDesc')}
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-6 lg:p-7">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <Image
              src={ASSETS.home.iconSecurity}
              alt="Quality Assurance"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <p className="text-[16px] font-bold leading-snug text-primary sm:text-[18px]">
              {t('features.qualityTitle')}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground sm:text-[14px]">
              {t('features.qualityDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
