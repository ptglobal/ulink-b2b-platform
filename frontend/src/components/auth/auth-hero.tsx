import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, PackageCheck, HeartHandshake } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

/**
 * Panel thương hiệu (trái) của các trang auth — Server Component, tĩnh, đa ngôn ngữ.
 * Ảnh nền rõ nét (không làm mờ). Kích thước CỐ ĐỊNH, không co giãn theo viewport.
 * Bố cục: cụm logo + headline + mô tả nhóm ở trên; badge + footer ở dưới.
 */
export async function AuthHero() {
  const t = await getTranslations('auth');

  const features = [
    { icon: ShieldCheck, title: t('featureSafe'), desc: t('featureSafeDesc') },
    { icon: PackageCheck, title: t('featureEfficient'), desc: t('featureEfficientDesc') },
    { icon: HeartHandshake, title: t('featurePartner'), desc: t('featurePartnerDesc') }
  ];

  return (
    <aside className="relative hidden h-screen flex-1 flex-col overflow-hidden lg:flex">
      {/* Ảnh nền — rõ nét, phủ kín */}
      <div className="absolute inset-0 bg-muted" />
      <Image
        src={ASSETS.banners.loginHero}
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-14 pb-8 pt-12">
        {/* Cụm trên: logo + headline + mô tả (nhóm sát nhau) */}
        <div>
          <Link href="/" aria-label="ULink Industries" className="inline-flex">
            <Image
              src={ASSETS.logo.full}
              alt="ULink — Growth platform with logistics"
              width={160}
              height={45}
              priority
            />
          </Link>

          <h1 className="mt-10 max-w-lg whitespace-pre-line text-5xl font-bold leading-[1.15] tracking-tight text-primary">
            {t('heroTitle')} <span className="text-brand">{t('heroHighlight')}</span>
          </h1>
          <div className="mt-5 h-1 w-12 bg-brand" />
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            {t('heroDescription')}
          </p>
        </div>

        {/* Cụm dưới: badge + footer — màu sáng để nổi trên ảnh nền */}
        <div>
          <ul className="flex flex-wrap gap-x-8 gap-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex max-w-[22ch] items-start gap-2.5">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-semibold text-brand">{title}</span>
                  <span className="block text-xs leading-snug text-white/70">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-8 font-mono text-xs tracking-wider text-white/50">2026 ULINK INDUSTRIES.</p>
        </div>
      </div>
    </aside>
  );
}
