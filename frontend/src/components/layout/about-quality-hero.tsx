import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, BadgeCheck, TrendingUp, Scale, Download, ExternalLink } from 'lucide-react';
import { ASSETS } from '@/lib/assets';

export async function AboutQualityHero() {
  const t = await getTranslations('aboutQuality.hero');

  const pillars = [
    {
      key: 'safety',
      icon: <ShieldCheck className="h-6 w-6" strokeWidth={1.4} />
    },
    {
      key: 'reliability',
      icon: <BadgeCheck className="h-6 w-6" strokeWidth={1.4} />
    },
    {
      key: 'improvement',
      icon: <TrendingUp className="h-6 w-6" strokeWidth={1.4} />
    },
    {
      key: 'compliance',
      icon: <Scale className="h-6 w-6" strokeWidth={1.4} />
    }
  ];

  return (
    <section className="relative overflow-hidden rounded-[6px] border border-[#B8C0CC]/40">
      {/* Background image */}
      <Image
        src={ASSETS.about.qualityLab}
        alt="Quality control laboratory — ULink Industries"
        fill
        sizes="100vw"
        className="object-cover object-right"
      />
      {/* Fade overlay — solid on text side, fully transparent on image side */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to right, #F8F9FC 0%, #F8F9FC 35%, rgba(248,249,252,0) 55%)'
        }}
      />

      {/* Content on top */}
      <div className="relative z-10 px-6 py-8 sm:px-8 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Text content */}
          <div className="flex flex-col lg:max-w-[480px]">
            {/* Eyebrow */}
            <p className="text-[12px] font-normal tracking-wide text-[#1769E2]">
              {t('eyebrow')}
            </p>

            {/* Heading */}
            <h1 className="mt-4 text-[28px] font-bold leading-[1.35] text-[#1A2D49]">
              <span className="block">{t('titleLine1')}</span>
              <span className="block">{t('titleLine2')}</span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-[420px] text-[11px] leading-[1.7] text-[#141414]/60">
              {t('desc1')}
            </p>
            <p className="mt-2 max-w-[420px] text-[11px] leading-[1.7] text-[#141414]/50">
              {t('desc2')}
            </p>

            {/* Download button */}
            <a
              href="#"
              className="mt-6 inline-flex w-fit items-center gap-2.5 rounded-[2px] border border-[#B8C0CC] bg-white px-5 py-2.5 text-[11px] font-normal text-[#1769E2] transition-colors hover:bg-[#F5F5F5]"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.6} />
              {t('downloadBtn')}
              <ExternalLink className="h-3 w-3 opacity-60" strokeWidth={1.5} />
            </a>
          </div>

          {/* Right: 2x2 Pillar grid card */}
          <div className="w-full rounded-[6px] border border-[#B8C0CC]/40 bg-white p-6 lg:w-[360px]">
            <div className="grid h-full grid-cols-2 gap-x-6 gap-y-6">
              {pillars.map((pillar) => (
                <div key={pillar.key} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#B8C0CC]/40 bg-[#F5F5F5] text-[#1769E2]">
                    {pillar.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#1A2D49]">
                      {t(`pillars.${pillar.key}.title`)}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-[1.6] text-[#141414]/50">
                      {t(`pillars.${pillar.key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
