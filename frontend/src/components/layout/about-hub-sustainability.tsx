import { getTranslations } from 'next-intl/server';
import { Leaf, Zap, Recycle, Boxes, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export async function AboutHubSustainability() {
  const t = await getTranslations('aboutHub.sustainability');
  const tCta = await getTranslations('ctaBanner');

  const features = [
    { icon: <Zap className="h-4 w-4" strokeWidth={1.6} />, text: t('energy') },
    { icon: <Recycle className="h-4 w-4" strokeWidth={1.6} />, text: t('emission') },
    { icon: <Boxes className="h-4 w-4" strokeWidth={1.6} />, text: t('supplyChain') }
  ];

  return (
    <section className="flex flex-col gap-6 rounded-[0.25rem] border border-[#B8C0CC] bg-[#F5F5F5] px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      {/* Left: leaf icon + title + desc */}
      <div className="flex items-start gap-4 lg:max-w-[420px]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B8C0CC] text-brand">
          <Leaf className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[12px] font-bold text-[#1A2D49]">{t('title')}</p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[#141414]/60">{t('desc')}</p>
        </div>
      </div>

      {/* Middle: feature list — 3 equal columns */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-x-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-[#141414]/75">
            <span className="mt-0.5 shrink-0 text-brand">{f.icon}</span>
            {f.text}
          </li>
        ))}
      </ul>

      {/* Right: CTA */}
      <Link
        href="/about/sustainability"
        className="group inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-[0.25rem] border border-[#4a5582] bg-[#1769E2] px-6 text-[13px] font-semibold text-[#F5F5F5] transition-colors hover:bg-[#1257bd]"
      >
        {tCta('button')}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
