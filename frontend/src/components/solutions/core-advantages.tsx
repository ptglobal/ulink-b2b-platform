import React from 'react';
import { ClipboardCheck, Globe, ShieldCheck, Award, CheckCircle2, Tag, BookOpen, Settings, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface CoreAdvantagesProps {
  locale: string;
}

export default async function CoreAdvantages({ locale }: CoreAdvantagesProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const summaryFeatures = [
    {
      icon: BookOpen,
      title: locale === 'vi' ? 'Đội ngũ chuyên môn' : locale === 'ja' ? '専門家チーム' : 'Expert Team',
      desc: locale === 'vi' ? 'Nhiều năm kinh nghiệm trong sản xuất và cung ứng cho nhiều ngành.' : locale === 'ja' ? 'さまざまな業界での多年にわたる製造と供給の実績。' : 'Years of experience in production & supply for various industries.'
    },
    {
      icon: Settings,
      title: locale === 'vi' ? 'Giải pháp tùy chỉnh' : locale === 'ja' ? 'カスタムソリューション' : 'Custom Solutions',
      desc: locale === 'vi' ? 'Sản xuất, tùy chỉnh linh hoạt theo yêu cầu đặc thù của từng Khách hàng.' : locale === 'ja' ? '各お客様の固有の要件に応じた柔軟な製造とカスタマイズ。' : 'Flexible manufacturing and customization tailored to each client.'
    },
    {
      icon: Globe,
      title: locale === 'vi' ? 'Chuỗi cung ứng quốc tế' : locale === 'ja' ? 'グローバル供給' : 'Global Supply Chain',
      desc: locale === 'vi' ? 'Nguồn hàng chất lượng, đạt chuẩn chất lượng theo tiêu chuẩn ISO.' : locale === 'ja' ? 'ISO規格に準拠した高品質な供給源。' : 'Quality sources conforming to ISO quality standards.'
    },
    {
      icon: Award,
      title: locale === 'vi' ? 'Chất lượng & tiêu chuẩn' : locale === 'ja' ? '品質と規格' : 'Quality & Standards',
      desc: locale === 'vi' ? 'Đầy đủ chứng nhận quốc tế ISO, GMP, RoHS.' : locale === 'ja' ? 'ISO、GMP、RoHSなどの主要な国際認証を取得。' : 'Full international certificates including ISO, GMP, RoHS.'
    }
  ];

  const advantages = [
    {
      icon: ClipboardCheck,
      title: t('coreAdvantages.card1Title'),
      desc: t('coreAdvantages.card1Desc')
    },
    {
      icon: Globe,
      title: t('coreAdvantages.card2Title'),
      desc: t('coreAdvantages.card2Desc')
    },
    {
      icon: ShieldCheck,
      title: t('coreAdvantages.card3Title'),
      desc: t('coreAdvantages.card3Desc')
    },
    {
      icon: Zap,
      title: t('coreAdvantages.card4Title'),
      desc: t('coreAdvantages.card4Desc')
    },
    {
      icon: CheckCircle2,
      title: t('coreAdvantages.card5Title'),
      desc: t('coreAdvantages.card5Desc')
    },
    {
      icon: Tag,
      title: t('coreAdvantages.card6Title'),
      desc: t('coreAdvantages.card6Desc')
    }
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 4-Column Summary Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 lg:divide-x divide-slate-100">
        {summaryFeatures.map((feat, idx) => {
          const IconComp = feat.icon;
          return (
            <div key={idx} className="flex items-start gap-4 pt-6 first:pt-0 md:pt-0 lg:px-4 lg:first:pl-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <IconComp className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {feat.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Advantages Heading */}
      <div className="flex flex-col items-start mt-16 lg:mt-24 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight leading-tight">
          {t('coreAdvantages.heading')}
        </h2>
        <p className="mt-3.5 text-sm text-slate-500 leading-relaxed font-medium">
          {t('coreAdvantages.subtitle')}
        </p>
      </div>

      {/* Core Advantages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {advantages.map((adv, idx) => {
          const IconComp = adv.icon;
          return (
            <div
              key={idx}
              className="group bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-start"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mb-6">
                <IconComp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F1E36] mb-3">
                {adv.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                {adv.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
