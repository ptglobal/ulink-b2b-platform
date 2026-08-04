import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

interface MarketNewsProps {
  locale: string;
}

export default async function MarketNews({ locale }: MarketNewsProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const newsList = [
    {
      image: '/images/solutions/smart_factory.png',
      category: t('marketNews.card1Category'),
      title: t('marketNews.card1Title'),
      desc: t('marketNews.card1Desc'),
      author: t('marketNews.card1Author'),
      role: t('marketNews.card1Role'),
      avatar: '/images/about/op-team.webp'
    },
    {
      image: '/images/solutions/plastic_granules.png',
      category: t('marketNews.card2Category'),
      title: t('marketNews.card2Title'),
      desc: t('marketNews.card2Desc'),
      author: t('marketNews.card2Author'),
      role: t('marketNews.card2Role'),
      avatar: '/images/about/op-team.webp'
    },
    {
      image: '/images/solutions/nitrile_gloves.png',
      category: t('marketNews.card3Category'),
      title: t('marketNews.card3Title'),
      desc: t('marketNews.card3Desc'),
      author: t('marketNews.card3Author'),
      role: t('marketNews.card3Role'),
      avatar: '/images/about/op-team.webp'
    }
  ];

  return (
    <section className="w-full mt-16 lg:mt-24 border-t border-slate-100 pt-16">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
          {t('marketNews.sectionTitle')}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-2.5">
          {t('marketNews.sectionSubtitle')}
        </h2>
      </div>

      {/* Grid of 3 News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {newsList.map((item, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Top Image */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-6 bg-slate-50 border border-slate-100/60">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-102 duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Category & Title */}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {item.category}
              </span>
              <h3 className="text-base font-extrabold text-[#0F1E36] leading-snug group-hover:text-blue-600 transition-colors mb-3">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium mb-6">
                {item.desc}
              </p>
            </div>

            {/* Author details */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
              <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                <Image
                  src={item.avatar}
                  alt={item.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0F1E36] leading-tight">
                  {item.author}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {item.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="flex justify-center mt-12">
        <Link
          href="/resources"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          {t('marketNews.viewMore')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
