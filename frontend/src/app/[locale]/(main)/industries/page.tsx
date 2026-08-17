import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  Armchair,
  ArrowRight,
  Check,
  Cpu,
  Pill,
  Utensils,
  Warehouse,
  Wrench
} from '@/components/icons';
import { TargetSegments, PartnersCertifications, WorkingProcess } from '@/components/home';
import { BrandedMedia } from '@/components/media/branded-media';
import AboutUsHub from '@/components/solutions/about-us-hub';
import ContactCta from '@/components/solutions/contact-cta';
import CoreAdvantages from '@/components/solutions/core-advantages';
import FaqSection from '@/components/solutions/faq-section';
import MarketNews from '@/components/solutions/market-news';
import { Link } from '@/i18n/navigation';
import { getHomePageContent } from '@/lib/brand-content';
import { getIndustriesPresentationCopy, type IndustryIconName } from '@/lib/industries-content';
import { getPagePresentation } from '@/lib/page-presentation';

type Props = { params: { locale: string } };

const INDUSTRY_ICONS: Record<IndustryIconName, React.ComponentType<{ className?: string }>> = {
  Armchair,
  Warehouse,
  Pill,
  Utensils,
  Wrench,
  Cpu
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const presentation = await getPagePresentation('industries', locale);
  const copy = getIndustriesPresentationCopy(presentation);
  return {
    title: copy ? `${copy.sectionTitle} | ULink B2B` : 'Industry Solutions | ULink B2B',
    description: copy?.sectionDescription
  };
}

export default async function IndustriesPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [presentation, homepageContent, customerSegments] = await Promise.all([
    getPagePresentation('industries', locale),
    getHomePageContent(locale),
    getTranslations({ locale, namespace: 'solutions.customerSegments' })
  ]);
  const copy = getIndustriesPresentationCopy(presentation);
  if (!presentation || !copy) notFound();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <section className="relative isolate flex min-h-[26rem] overflow-hidden bg-brand-deep text-white lg:min-h-[35rem]">
        <BrandedMedia
          src={presentation.heroMedia?.path}
          alt={presentation.heroMedia?.alt || copy.heroAlt}
          className="pointer-events-none absolute inset-0"
          imageClassName="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,27,78,.86),rgba(7,27,78,.58)_52%,rgba(7,27,78,.18))]" />
        <div className="relative z-10 mx-auto flex w-[calc(100%_-_2rem)] max-w-[80rem] flex-col py-7 sm:w-[calc(100%_-_4rem)] sm:py-9 lg:py-10">
          <nav className="flex min-h-11 items-center gap-2 text-xs text-cyan-100/80">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-white">
              {copy.breadcrumbHome}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-white">{copy.breadcrumbCurrent}</span>
          </nav>
          <div className="my-auto max-w-[44rem] py-7 sm:py-8">
            <h1 className="text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[2.65rem] lg:text-[3rem]">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-[42rem] text-sm leading-6 text-white/82 sm:text-[15px] sm:leading-7">
              {copy.heroDescription}
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex min-h-11 items-center gap-3 border border-white bg-white px-5 text-[13px] font-semibold text-brand-deep transition-colors hover:bg-cyan-50"
            >
              {copy.heroCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14 lg:py-16">
        <div className="mx-auto w-[calc(100%_-_2rem)] max-w-[80rem] sm:w-[calc(100%_-_4rem)]">
          <header className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-[-0.025em] sm:text-[1.75rem]">
              {copy.sectionTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {copy.sectionDescription}
            </p>
          </header>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {copy.industries.map((industry) => {
              const Icon = INDUSTRY_ICONS[industry.icon] ?? Cpu;
              return (
                <article
                  key={industry.slug}
                  className="ulink-media-zoom group flex min-w-0 flex-col overflow-hidden rounded-[3px] border border-[#dfe5ef] bg-white transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/45 hover:shadow-[0_12px_30px_rgba(20,42,92,.08)]"
                >
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="relative block aspect-[2/1] overflow-hidden bg-muted"
                  >
                    <BrandedMedia
                      src={industry.image}
                      alt={industry.name}
                      className="absolute inset-0"
                      imageClassName="object-cover"
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      compactBrand
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-[18px] w-[18px] shrink-0 text-brand" aria-hidden="true" />
                      <h3 className="text-[17px] font-semibold leading-tight group-hover:text-brand">
                        {industry.name}
                      </h3>
                    </div>
                    <p className="mt-3 text-[13px] leading-[1.6] text-muted-foreground">
                      {industry.description}
                    </p>
                    <ul className="mt-4 space-y-2.5 border-t border-[#e7ebf2] pt-4">
                      {industry.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-[12px] leading-5 text-foreground/76"
                        >
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/industries/${industry.slug}`}
                      className="mt-auto flex min-h-11 items-center gap-2 pt-4 text-[12px] font-semibold text-brand"
                    >
                      {copy.viewDetails}
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CoreAdvantages locale={locale} />
      <AboutUsHub locale={locale} />
      {homepageContent?.audiences ? (
        <TargetSegments
          content={homepageContent.audiences}
          variant="industries"
          sectionTitle={customerSegments('sectionTitle')}
          sectionSubtitle={customerSegments('sectionSubtitle')}
        />
      ) : null}
      <PartnersCertifications variant="industries" />
      <WorkingProcess variant="industries" />
      <ContactCta locale={locale} />
      <MarketNews locale={locale} />
      <FaqSection locale={locale} />
    </div>
  );
}
