import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from '@/components/icons';

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
    <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-[calc(100%_-_2rem)] max-w-[80rem] sm:w-[calc(100%_-_4rem)]">
        <header className="mx-auto mb-9 max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-foreground">
            {t('marketNews.sectionTitle')}
          </p>
          <h2 className="mt-2 text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[28px]">
            {t('marketNews.sectionSubtitle')}
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {newsList.map((item, idx) => (
            <article
              key={idx}
              className="group flex flex-col justify-between overflow-hidden rounded-[3px] border border-[#dfe5ef] bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-[0_12px_28px_rgba(20,42,92,.08)]"
            >
              <div>
                <div className="relative aspect-[16/8.5] w-full overflow-hidden bg-slate-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-102 duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="p-5 pb-4">
                  <span className="block text-[10px] font-semibold text-muted-foreground">
                    {item.category}
                  </span>
                  <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[12px] leading-5 text-muted-foreground">{item.desc}</p>
                </div>
              </div>

              <div className="mx-5 mb-5 mt-auto flex items-center gap-3 border-t border-[#e7ebf2] pt-4">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50">
                  <Image src={item.avatar} alt={item.author} fill className="object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold leading-tight text-foreground">
                    {item.author}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">{item.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/resources"
            className="inline-flex min-h-11 items-center gap-3 bg-brand px-6 text-[12px] font-semibold text-white hover:bg-brand-strong"
          >
            {t('marketNews.viewMore')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
