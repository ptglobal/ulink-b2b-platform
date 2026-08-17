'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Download, ArrowRight, Clock } from '@/components/icons';
import { ASSETS } from '@/lib/assets';

export function AboutQualityStandards() {
  const t = useTranslations('aboutQuality.standards');
  const [showToast, setShowToast] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

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
          <h2 className="text-[12px] font-bold text-foreground">{t('title')}</h2>
          <p className="mt-1.5 text-[9px] font-normal text-foreground/60">{t('subtitle')}</p>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-[9px] font-normal text-brand hover:underline"
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
            className="flex flex-col rounded-[6px] border border-border/40 bg-white px-5 py-5"
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
            <p className="mt-4 text-[10px] font-bold text-foreground">
              {t(`certs.${cert.key}.title`)}
            </p>

            {/* Subtitle */}
            <p className="mt-1 text-[9px] font-normal leading-[1.8] text-foreground/50">
              {t(`certs.${cert.key}.subtitle`)}
            </p>

            {/* Description */}
            <p className="mt-3 flex-1 text-[10px] leading-[1.8] text-foreground/70">
              {t(`certs.${cert.key}.desc`)}
            </p>

            {/* Download link */}
            <a
              href="#"
              onClick={handleDownloadClick}
              className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-normal text-brand hover:underline"
            >
              <Download className="h-3 w-3" strokeWidth={1.5} />
              {t('downloadCert')}
            </a>
          </div>
        ))}
      </div>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/20">
          <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
          <span className="text-sm font-semibold">{t('certPending')}</span>
        </div>
      )}
    </section>
  );
}
