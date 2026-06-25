'use client';

import React from 'react';
import {
  Cpu,
  Activity,
  Utensils,
  Car,
  Sun,
  Shield,
  Settings,
  Globe,
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  Factory
} from 'lucide-react';
import { IndustryData } from './types';

const iconMap: Record<string, React.ComponentType<any>> = {
  Cpu,
  Activity,
  Utensils,
  Car,
  Sun,
  Shield,
  Settings,
  Globe,
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  Factory
};

interface IndustryChallengesProps {
  industryData: IndustryData;
  locale: string;
}

export function IndustryChallenges({ industryData, locale }: IndustryChallengesProps) {
  return (
    <section id="overview" className="scroll-mt-36 space-y-6">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
        {/* Left Content */}
        <div className="lg:w-[45%] space-y-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0F1E36]">
            {industryData.challengesIntro ? industryData.challengesIntro : `Thách thức trong ngành ${industryData.name}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
            {industryData.challengesIntro ? (
              locale === 'vi' 
                ? 'Các linh kiện điện tử có kích thước nhỏ, độ nhạy cao với tĩnh điện, hạt bụi và độ ẩm. Bất kỳ sai sót nhỏ nào trong sản xuất hoặc đóng gói cũng có thể dẫn đến lỗi sản phẩm hoặc giảm độ tin cậy.'
                : locale === 'ja'
                ? '電子部品はサイズが小さく、静電気、塵埃、湿度に対して非常に敏感です。製造や包装プロセスにおけるわずかなミスでも、製品不良や信頼性の低下につながる可能性があります。'
                : 'Electronic components are small in size and highly sensitive to static electricity, dust particles, and humidity. Any minor flaw in production or packaging can lead to product defects or reduced reliability.'
            ) : industryData.description}
          </p>
        </div>

        {/* Right Challenges List */}
        <div className="lg:w-[50%] grid grid-cols-1 sm:grid-cols-3 gap-4">
          {industryData.challenges.map((ch, idx) => {
            const ChIcon = iconMap[ch.iconName] || Zap;
            return (
              <div key={idx} className="flex items-center gap-3 p-4 border border-slate-100 bg-[#F8FAFC]/55 hover:border-slate-200 hover:shadow-sm transition-all">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-50 text-[#1769E2]">
                  <ChIcon className="h-5 w-5" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#0F1E36] leading-tight">
                  {ch.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
