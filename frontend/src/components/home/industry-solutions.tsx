import Image from 'next/image';
import { ArrowUpRight } from '@/components/icons';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { SectionHeader } from './section-header';

export async function IndustrySolutions() {
  const t = await getTranslations('home');

  const cards = [
    {
      title: t('industries.card1Title'),
      desc: t('industries.card1Desc'),
      iconSrc: ASSETS.home.indElectronics,
      href: '/industries/electronics'
    },
    {
      title: t('industries.card2Title'),
      desc: t('industries.card2Desc'),
      iconSrc: ASSETS.home.indFood,
      href: '/industries/food-beverage'
    },
    {
      title: t('industries.card3Title'),
      desc: t('industries.card3Desc'),
      iconSrc: ASSETS.home.indLogistics,
      href: '/industries/logistics'
    },
    {
      title: t('industries.card4Title'),
      desc: t('industries.card4Desc'),
      iconSrc: ASSETS.home.indPharma,
      href: '/industries/pharma-medical'
    },
    {
      title: t('industries.card5Title'),
      desc: t('industries.card5Desc'),
      iconSrc: ASSETS.home.indFurniture,
      href: '/industries/furniture-wood'
    },
    {
      title: t('industries.card6Title'),
      desc: t('industries.card6Desc'),
      iconSrc: ASSETS.home.indConstruction,
      href: '/industries/construction-hvac'
    }
  ];

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-8 lg:py-12">
      {/* ── SECTION HEADER BAR ── */}
      <SectionHeader
        title={t('industries.sectionTitle')}
        subtitle={t('industries.sectionSubTitle')}
        viewAllHref="/industries"
        viewAllLabel={t('industries.viewDetail')}
      />

      {/* ── LƯỚI 6 THẺ NGÀNH NGHỀ (GRID 6 CARDS: 3 COLUMNS x 2 ROWS) ── */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className="group flex flex-col justify-between rounded-xl border border-border p-6 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:border-brand/50 hover:shadow-md sm:p-7"
          >
            <div>
              <h3 className="text-[18px] font-bold text-primary transition-colors group-hover:text-brand sm:text-[20px]">
                {card.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                {card.desc}
              </p>
            </div>

            {/* Bottom Row: Left 60x60 PNG Icon & Right Up-Arrow */}
            <div className="mt-8 flex items-end justify-between pt-2">
              <div className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center">
                <Image
                  src={card.iconSrc}
                  alt="Industry Icon"
                  width={60}
                  height={60}
                  className="h-[60px] w-[60px] object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <ArrowUpRight
                className="h-7 w-7 text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
