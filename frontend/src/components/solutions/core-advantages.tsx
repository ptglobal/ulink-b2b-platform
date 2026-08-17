import React from 'react';
import {
  ClipboardCheck,
  Globe,
  ShieldCheck,
  Award,
  CheckCircle2,
  Tag,
  BookOpen,
  Settings,
  Zap
} from '@/components/icons';
import { getTranslations } from 'next-intl/server';

interface CoreAdvantagesProps {
  locale: string;
}

export default async function CoreAdvantages({ locale }: CoreAdvantagesProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const summaryFeatures = [
    {
      icon: BookOpen,
      title:
        locale === 'vi' ? 'Đội ngũ chuyên môn' : locale === 'ja' ? '専門家チーム' : 'Expert Team',
      desc:
        locale === 'vi'
          ? 'Nhiều năm kinh nghiệm trong sản xuất và cung ứng cho nhiều ngành.'
          : locale === 'ja'
            ? 'さまざまな業界での多年にわたる製造と供給の実績。'
            : 'Years of experience in production & supply for various industries.'
    },
    {
      icon: Settings,
      title:
        locale === 'vi'
          ? 'Giải pháp tùy chỉnh'
          : locale === 'ja'
            ? 'カスタムソリューション'
            : 'Custom Solutions',
      desc:
        locale === 'vi'
          ? 'Sản xuất, tùy chỉnh linh hoạt theo yêu cầu đặc thù của từng Khách hàng.'
          : locale === 'ja'
            ? '各お客様の固有の要件に応じた柔軟な製造とカスタマイズ。'
            : 'Flexible manufacturing and customization tailored to each client.'
    },
    {
      icon: Globe,
      title:
        locale === 'vi'
          ? 'Chuỗi cung ứng quốc tế'
          : locale === 'ja'
            ? 'グローバル供給'
            : 'Global Supply Chain',
      desc:
        locale === 'vi'
          ? 'Nguồn hàng chất lượng, đạt chuẩn chất lượng theo tiêu chuẩn ISO.'
          : locale === 'ja'
            ? 'ISO規格に準拠した高品質な供給源。'
            : 'Quality sources conforming to ISO quality standards.'
    },
    {
      icon: Award,
      title:
        locale === 'vi'
          ? 'Chất lượng & tiêu chuẩn'
          : locale === 'ja'
            ? '品質と規格'
            : 'Quality & Standards',
      desc:
        locale === 'vi'
          ? 'Đầy đủ chứng nhận quốc tế ISO, GMP, RoHS.'
          : locale === 'ja'
            ? 'ISO、GMP、RoHSなどの主要な国際認証を取得。'
            : 'Full international certificates including ISO, GMP, RoHS.'
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
    <>
      <section className="border-y border-[#e5e9f0] bg-white">
        <div className="mx-auto grid w-[calc(100%_-_2rem)] max-w-[80rem] grid-cols-1 divide-y divide-[#e5e9f0] sm:w-[calc(100%_-_4rem)] md:grid-cols-2 md:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {summaryFeatures.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="flex min-h-[8.25rem] items-start gap-4 px-1 py-7 md:px-6 lg:first:pl-0 lg:last:pr-0"
              >
                <IconComp className="mt-0.5 h-5 w-5 shrink-0 text-[#27364f]" />
                <div>
                  <h3 className="text-[14px] font-semibold leading-snug text-[#17243b]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-[12px] leading-5 text-[#66738a]">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#f4f6fa] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto w-[calc(100%_-_2rem)] max-w-[80rem] sm:w-[calc(100%_-_4rem)]">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold leading-tight tracking-[-0.025em] sm:text-[1.75rem]">
              {t('coreAdvantages.heading')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t('coreAdvantages.subtitle')}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((adv, idx) => {
              const IconComp = adv.icon;
              return (
                <article
                  key={idx}
                  className="group min-h-[12.5rem] rounded-[3px] border border-[#e0e5ee] bg-white p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_10px_26px_rgba(20,42,92,.07)] sm:p-6"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[3px] bg-[#f0f3f9] text-[#283851]">
                    <IconComp className="h-[18px] w-[18px]" />
                  </span>
                  <h3 className="mt-5 text-[15px] font-semibold text-foreground">{adv.title}</h3>
                  <p className="mt-2 text-[12px] leading-5 text-muted-foreground">{adv.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
