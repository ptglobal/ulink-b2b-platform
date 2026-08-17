import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  Armchair,
  ClipboardCheck,
  Cpu,
  FileText,
  Package,
  Pill,
  Truck,
  Utensils,
  Warehouse,
  Wrench
} from '@/components/icons';
import { BrandedMedia } from '@/components/media/branded-media';
import { Link } from '@/i18n/navigation';
import type { HomePageContent } from '@/lib/directus';
import type { SiteSettings } from '@/lib/directus';
import type { IndustriesPresentationCopy, IndustryIconName } from '@/lib/industries-content';
import { PartnersCertifications } from './partners-certifications';
import { CaseStudies } from './case-studies';
import { WorkingProcess } from './working-process';
import { ResourcesNews } from './resources-news';
import { TargetSegments } from './target-segments';
import { AboutContact } from '@/components/about/about-contact';

const journeyIcons = {
  document: FileText,
  catalog: Package,
  quote: ClipboardCheck,
  delivery: Truck
};
const industryIcons: Record<IndustryIconName, React.ComponentType<{ className?: string }>> = {
  Armchair,
  Warehouse,
  Pill,
  Utensils,
  Wrench,
  Cpu
};
const legacyProductImages = [
  '/images/home/section2/product-cut-gloves.webp',
  '/images/home/section2/product-custom-pkg.webp',
  '/images/home/section2/product-hvac-tape.webp'
] as const;

export async function CarbonHomepage({
  content,
  settings,
  industries
}: {
  content: HomePageContent;
  settings: SiteSettings;
  industries: IndustriesPresentationCopy;
}) {
  const t = await getTranslations('home');
  return (
    <div className="w-full bg-white text-[#111827]">
      <section className="relative mx-auto w-full max-w-[1440px] overflow-hidden bg-[#eef3f9] sm:min-h-[585px]">
        <BrandedMedia
          src={content.hero.image.path}
          alt={content.hero.image.alt}
          priority
          sizes="(max-width: 639px) 100vw, (max-width: 1440px) 100vw, 1440px"
          className="ulink-hero-media relative h-[17rem] w-full sm:absolute sm:inset-0 sm:h-auto"
          imageClassName="object-[70%_center] sm:object-center"
        />
        <div
          className="absolute inset-0 hidden bg-gradient-to-r from-white/25 via-white/5 to-transparent sm:block"
          aria-hidden="true"
        />
        <div className="relative flex items-center px-4 pb-5 sm:min-h-[585px] sm:px-8 sm:py-6 xl:px-20">
          <div className="ulink-hero-panel flex w-full max-w-[672px] flex-col justify-center bg-white px-5 py-7 shadow-[0_4px_8px_rgba(11,27,58,0.08)] sm:min-h-[538px] sm:bg-white/[0.94] sm:px-10 sm:py-9 sm:shadow-none sm:backdrop-blur-sm lg:px-12">
            <p className="max-w-[576px] text-[12px] font-bold uppercase leading-5 tracking-[0.035em] text-brand">
              {content.hero.kicker}
            </p>
            <h1 className="mt-4 max-w-[576px] text-[clamp(2rem,9.5vw,2.75rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-[#0b1b3a] sm:mt-5 sm:text-[48px] lg:text-[56px] lg:leading-[64px]">
              {content.hero.title}
            </h1>
            <p className="mt-5 max-w-[576px] text-[15px] leading-7 text-[#4b5563] sm:text-[16px] lg:text-[18px]">
              {content.hero.description}
            </p>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href={content.hero.primaryAction.href}
                className="ulink-pressable inline-flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[3px] bg-brand px-6 text-[15px] font-semibold text-white shadow-[0_4px_8px_rgba(65,105,225,0.18)] hover:bg-brand-strong sm:min-h-[60px] sm:w-[227px] sm:px-8"
              >
                {content.hero.primaryAction.label}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href={content.hero.secondaryAction.href}
                className="ulink-pressable inline-flex min-h-[52px] w-full items-center justify-between gap-3 rounded-[3px] border border-brand bg-white px-6 text-[15px] font-semibold text-brand hover:bg-brand-soft sm:min-h-[60px] sm:w-[207px] sm:px-8"
              >
                {content.hero.secondaryAction.label}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-8 xl:px-20">
        <div className="grid min-h-[154px] border border-[#e5e7eb] bg-white sm:grid-cols-2 lg:grid-cols-4">
          {content.journey.items.map((item, index) => {
            const Icon = journeyIcons[item.icon];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`ulink-pressable group flex min-h-[136px] items-start gap-5 border-[#e5e7eb] p-5 hover:bg-[#f5f8fc] sm:min-h-[152px] sm:p-6 ${
                  index > 0 ? 'border-t sm:border-t-0 sm:border-l' : ''
                } ${index === 2 ? 'sm:border-l-0 lg:border-l' : ''}`}
              >
                <Icon className="mt-1 h-8 w-8 shrink-0 text-brand" aria-hidden="true" />
                <span>
                  <span className="block text-[17px] font-bold text-[#17213a]">{item.title}</span>
                  <span className="mt-2 block text-[13px] leading-5 text-[#59667c]">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-8 lg:py-20 xl:px-20">
        <FigmaHeading
          title={content.materials.title}
          description={content.materials.description}
          href="/products"
          label={t('categories.viewAll')}
        />
        <div className="mt-9 grid gap-5 py-10 md:grid-cols-6">
          {content.materials.groups.map((group, index) => (
            <Link
              key={group.title}
              href={group.href}
              className={`ulink-pressable ulink-media-zoom group flex min-h-[460px] flex-col overflow-hidden border border-[#dce3ef] border-t-[3px] border-t-brand bg-white shadow-[0_4px_8px_rgba(11,27,63,0.05)] sm:min-h-[510px] ${index < 2 ? 'md:col-span-3' : 'md:col-span-2'}`}
            >
              <BrandedMedia
                src={group.image?.path ?? legacyProductImages[index % legacyProductImages.length]}
                alt={group.image?.alt ?? group.title}
                sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw"
                className={`shrink-0 bg-[#f5f8fc] ${index < 2 ? 'h-[250px] sm:h-[300px]' : 'h-[210px] sm:h-[238px]'}`}
                brandPresentation="rail"
              />
              <h3 className="flex min-h-[72px] items-center border-t border-[#dce3ef] px-5 py-5 text-[20px] font-bold leading-7 text-[#0b1b3a]">
                {group.title}
              </h3>
              <p className="flex-1 px-5 py-5 text-[14px] leading-6 text-[#4b5563]">
                {group.description}
              </p>
              <div className="flex min-h-[72px] items-center border-t border-[#e5e7eb] px-5">
                <span className="flex w-full items-center justify-between text-[14px] font-bold text-brand">
                  {t('categories.viewDetail')}
                  <ArrowRight
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-8 lg:py-20 xl:px-20">
        <FigmaHeading
          title={industries.sectionTitle}
          description={industries.sectionDescription}
          href="/industries"
          label={industries.viewDetails}
        />
        <div className="mt-9 grid border-l border-t border-[#d7dfeb] md:grid-cols-2 lg:grid-cols-3">
          {industries.industries.map((industry) => {
            const Icon = industryIcons[industry.icon] ?? Cpu;
            const href = `/industries/${industry.slug}`;
            return (
              <Link
                key={href}
                href={href}
                className="ulink-pressable group flex min-h-[220px] flex-col border-b border-r border-[#d7dfeb] p-6 hover:bg-[#f5f8fc] sm:min-h-[258px] sm:p-8"
              >
                <h3 className="text-[19px] font-bold text-[#10192d]">{industry.name}</h3>
                <p className="mt-2 max-w-[36ch] text-[13px] leading-5 text-[#536078]">
                  {industry.description}
                </p>
                <div className="mt-auto flex items-end justify-between">
                  <Icon className="h-10 w-10 text-brand" aria-hidden="true" />
                  <ArrowRight
                    className="h-7 w-7 -rotate-45 text-brand transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] px-4 py-14 sm:px-8 lg:grid-cols-2 lg:py-20 xl:px-20">
        <BrandedMedia
          src={content.materials.image.path}
          alt={content.materials.image.alt}
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="min-h-[300px] bg-[#edf2f8] sm:min-h-[430px]"
        />
        <div className="flex flex-col justify-center bg-[#f5f8fc] p-7 sm:p-10 lg:p-12">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-brand">
            ULINK INDUSTRIES
          </p>
          <h2 className="mt-4 text-[32px] font-extrabold leading-[1.16] tracking-[-0.025em] text-[#17213a] sm:text-[40px]">
            {content.proof.title}
          </h2>
          <p className="mt-5 text-[15px] leading-7 text-[#59667c]">{content.proof.description}</p>
          <dl className="mt-8 grid grid-cols-2 border-l border-t border-[#d7dfeb] bg-white">
            {content.proof.items.map((item) => (
              <div
                key={item.label}
                className="min-h-[132px] border-b border-r border-[#d7dfeb] p-5"
              >
                <dd className="text-3xl font-extrabold text-brand">{item.value}</dd>
                <dt className="mt-3 text-[12px] font-bold text-[#17213a]">{item.label}</dt>
                <p className="mt-1 text-[11px] leading-4 text-[#68758c]">{item.detail}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <TargetSegments content={content.audiences} />

      <PartnersCertifications />
      <CaseStudies />
      <WorkingProcess />
      <ResourcesNews />

      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 xl:px-20">
        <AboutContact settings={settings} />
      </div>

      <section className="bg-brand text-white" aria-label={content.cta.title}>
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-16 xl:px-20">
          <h2 className="max-w-[17ch] text-[34px] font-extrabold leading-[1.14] tracking-[-0.025em] sm:text-[44px]">
            {content.cta.title}
          </h2>
          <div>
            <p className="max-w-[58ch] text-[15px] leading-7 text-white/90">
              {content.cta.description}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={content.cta.primaryAction.href}
                className="ulink-pressable inline-flex min-h-12 items-center justify-between gap-3 bg-white px-6 text-[14px] font-bold text-brand"
              >
                {content.cta.primaryAction.label}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href={content.cta.secondaryAction.href}
                className="ulink-pressable inline-flex min-h-12 items-center justify-between gap-3 border border-white px-6 text-[14px] font-bold text-white hover:bg-white/10"
              >
                {content.cta.secondaryAction.label}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FigmaHeading({
  title,
  description,
  href,
  label
}: {
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="flex min-w-0 gap-4">
        <span className="mt-1 flex flex-col gap-1.5" aria-hidden="true">
          <i className="h-2 w-2 rounded-full bg-brand" />
          <i className="h-2 w-2 rounded-full bg-brand/55" />
          <i className="h-2 w-2 rounded-full bg-brand/25" />
        </span>
        <div>
          <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-[#17213a] sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-2 max-w-[65ch] text-[14px] leading-6 text-[#59667c]">{description}</p>
        </div>
      </div>
      <Link
        href={href}
        className="hidden shrink-0 items-center gap-3 text-[13px] font-bold text-brand sm:inline-flex"
      >
        {label}
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>
    </div>
  );
}
