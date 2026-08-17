import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, PackageCheck, HeartHandshake } from '@/components/icons';

export async function LoginHeroCard() {
  const t = await getTranslations('auth');
  const features = [
    { icon: ShieldCheck, title: t('featureSafe'), description: t('featureSafeDesc') },
    { icon: PackageCheck, title: t('featureEfficient'), description: t('featureEfficientDesc') },
    { icon: HeartHandshake, title: t('featurePartner'), description: t('featurePartnerDesc') }
  ];

  return (
    <aside className="flex h-full min-h-[760px] flex-col bg-[#345cc8] p-8 text-white sm:p-10 lg:min-h-[900px] lg:p-12">
      <h1 className="max-w-[12ch] whitespace-pre-line text-[34px] font-extrabold leading-[1.08] tracking-[-.035em] text-white sm:text-[42px]">
        {t('heroTitle')} <span className="text-[#c6d4ff]">{t('heroHighlight')}</span>
      </h1>
      <p className="mt-5 max-w-[46ch] text-[14px] leading-6 text-white/82">{t('heroDescription')}</p>
      <div className="relative my-8 min-h-[390px] overflow-hidden border border-white/30 bg-[#254aa9] shadow-[0_16px_35px_rgba(16,38,92,.22)]">
        <Image src="/images/about/kho_1.png" alt="Hệ thống kho ULink Industries" fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#173d99]/35 to-transparent" aria-hidden="true" />
      </div>
      <div className="mt-auto grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="min-w-0">
            <Icon className="h-5 w-5 text-[#c6d4ff]" aria-hidden="true" />
            <p className="mt-3 text-[12px] font-bold text-white">{title}</p>
            <p className="mt-1 text-[10px] leading-4 text-white/65">{description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
