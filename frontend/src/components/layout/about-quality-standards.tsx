import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Download, ArrowRight } from 'lucide-react';
import { ASSETS } from '@/lib/assets';

export async function AboutQualityStandards() {
  const t = await getTranslations('aboutQuality.standards');

  const certs = [
    { key: 'iso9001', image: ASSETS.about.iso9001 },
    { key: 'iso14001', image: ASSETS.about.iso14001 },
    { key: 'iso45001', image: ASSETS.about.iso45001 },
    { key: 'esd', image: ASSETS.about.isoEsd },
    { key: 'iso13485', image: ASSETS.about.iso13485 }
  ];

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[12px] font-bold text-[#1A2D49]">
            {t('title')}
          </h2>
          <p className="mt-1.5 text-[9px] font-normal text-[#141414]/60">
            {t('subtitle')}
          </p>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-[9px] font-normal text-[#1769E2] hover:underline"
        >
          {t('viewAll')}
          <ArrowRight className="h-2 w-2" strokeWidth={1.8} />
        </a>
      </div>

      {/* Cards grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {certs.map((cert) => (
          <div
            key={cert.key}
            className="flex flex-col rounded-[6px] border border-[#B8C0CC]/40 bg-white px-5 py-5"
          >
            {/* Cert icon */}
            <div className="relative h-[51px] w-[56px]">
              <Image
                src={cert.image}
                alt={t(`certs.${cert.key}.title`)}
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>

            {/* Title */}
            <p className="mt-4 text-[10px] font-bold text-[#1A2D49]">
              {t(`certs.${cert.key}.title`)}
            </p>

            {/* Subtitle */}
            <p className="mt-1 text-[9px] font-normal leading-[1.8] text-[#141414]/50">
              {t(`certs.${cert.key}.subtitle`)}
            </p>

            {/* Description */}
            <p className="mt-3 flex-1 text-[10px] leading-[1.8] text-[#141414]/70">
              {t(`certs.${cert.key}.desc`)}
            </p>

            {/* Download link */}
            <a
              href="#"
              className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-normal text-[#1769E2] hover:underline"
            >
              <Download className="h-3 w-3" strokeWidth={1.5} />
              {t('downloadCert')}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
