'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Factory,
  FileDown,
  Download,
  X,
  Activity,
  Check,
  Clock
} from '@/components/icons';
import { IndustryData } from './types';

// Map icon names for certifications
const certIconMap: Record<string, React.ComponentType<any>> = {
  X,
  Activity,
  Check
};

interface IndustrySidebarProps {
  industryData: IndustryData;
  locale: string;
}

export function IndustrySidebar({ industryData, locale }: IndustrySidebarProps) {
  const [showToast, setShowToast] = useState(false);

  const handleCatalogueClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };
  const certifications = [
    { name: 'ISO 9001', detail: locale === 'vi' ? 'Quản lý chất lượng' : locale === 'ja' ? '品質管理' : 'Quality Management', type: 'icon', iconName: 'X' },
    { name: 'ISO 14001', detail: locale === 'vi' ? 'Quản lý môi trường' : locale === 'ja' ? '環境管理' : 'Environmental Mgmt', type: 'icon', iconName: 'Activity' },
    { name: 'RoHS', detail: locale === 'vi' ? 'Hạn chế chất nguy hại' : locale === 'ja' ? '有害物質制限' : 'Restricted Substances', type: 'text' },
    { name: 'REACH', detail: locale === 'vi' ? 'Đánh giá hóa chất & an toàn' : locale === 'ja' ? '化学物質安全' : 'Chemical Safety', type: 'icon', iconName: 'Check' }
  ];

  return (
    <div className="space-y-6">
      <div className="sticky top-[152px] space-y-6">

        {/* Sidebar Card: Vì sao chọn ULINK */}
        <div className="bg-background/60 border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground border-b pb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            {industryData.whyUsTitle}
          </h3>
          <ul className="space-y-3.5">
            {industryData.whyUsList.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs sm:text-sm text-slate-600 font-medium">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sidebar Card: Chứng nhận & tiêu chuẩn */}
        <div className="bg-background/60 border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground border-b pb-3 flex items-center gap-2">
            <Factory className="h-5 w-5 text-emerald-600" />
            {industryData.standardsTitle}
          </h3>

          <div className="grid grid-cols-2 gap-4 min-[420px]:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {certifications.map((cert: any, idx: number) => {
              const CertIcon = cert.type === 'icon' && cert.iconName ? certIconMap[cert.iconName] : null;
              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-brand flex flex-col items-center justify-center text-brand font-extrabold bg-white shadow-sm mb-2 select-none">
                    {cert.type === 'text' ? (
                      <span className="text-[9px] uppercase tracking-tighter">{cert.name}</span>
                    ) : CertIcon ? (
                      <CertIcon className="h-5 w-5 text-brand" />
                    ) : null}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-foreground leading-tight block">
                    {cert.name}
                  </span>
                  <span className="text-[8px] text-slate-400 font-semibold leading-tight mt-0.5 block max-w-[64px] mx-auto">
                    {cert.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Card: Tài liệu liên quan (Duplicate for high vis) */}
        <div className="bg-background/60 border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
          <h3 className="text-base sm:text-lg font-extrabold text-foreground border-b pb-3 flex items-center gap-2">
            <FileDown className="h-5 w-5 text-brand" />
            {locale === 'vi' ? 'Tài liệu liên quan' : locale === 'ja' ? '関連資料' : 'Related Resources'}
          </h3>
          <a
            href={industryData.catalogue.url}
            onClick={handleCatalogueClick}
            className="flex items-center gap-4 p-4 bg-white border border-slate-100 shadow-sm hover:border-brand transition-colors"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-blue-50 text-brand">
              <Download className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                {industryData.catalogue.title}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {industryData.catalogue.info}
              </p>
            </div>
          </a>
        </div>

      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/20">
          <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
          <span className="text-sm font-semibold">
            {locale === 'vi' ? 'Tài liệu đang chờ cập nhật' : locale === 'ja' ? 'カタログドキュメントは準備中です' : 'The document is pending update'}
          </span>
        </div>
      )}
    </div>
  );
}
