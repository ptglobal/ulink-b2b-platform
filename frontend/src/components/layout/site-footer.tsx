import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Facebook, Linkedin, Youtube, Send } from 'lucide-react';
import { ASSETS } from '@/lib/assets';
import { FooterLocaleSwitcher } from './footer-locale-switcher';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();

  const aboutLinks = [
    { label: t('about.intro'), href: '/about' },
    { label: t('about.team'), href: '/about' },
    { label: t('about.certifications'), href: '/about' },
    { label: t('about.news'), href: '/resources' },
    { label: t('about.careers'), href: '/about' },
    { label: t('about.contact'), href: '/about' },
  ];

  const productLinks = [
    { label: t('products.gloves'), href: '/products/gloves' },
    { label: t('products.wipes'), href: '/products/wipes' },
    { label: t('products.tape'), href: '/products/tape' },
    { label: t('products.packaging'), href: '/products/packaging' },
    { label: t('products.accessories'), href: '/products/accessories' },
    { label: t('products.custom'), href: '/solutions' },
  ];

  const serviceLinks = [
    { label: t('services.scheduled'), href: '/solutions' },
    { label: t('services.reorder'), href: '/quick-order' },
    { label: t('services.buffer'), href: '/solutions' },
    { label: t('services.consolidation'), href: '/solutions' },
    { label: t('services.emergency'), href: '/solutions' },
  ];

  const supportLinks = [
    { label: t('support.documents'), href: '/resources' },
    { label: t('support.specs'), href: '/resources' },
    { label: t('support.certStandards'), href: '/resources' },
    { label: t('support.guides'), href: '/resources' },
    { label: t('support.faq'), href: '/resources' },
  ];

  return (
    <footer className="bg-primary text-white">
      {/* Main footer content */}
      <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-8 lg:px-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {/* Logo & description */}
          <div>
            <Image
              src={ASSETS.logo.main}
              alt="ULink Industries"
              width={140}
              height={58}
              className="brightness-0 invert"
            />
            <p className="mt-3 max-w-[200px] text-[11px] leading-normal text-white/60">
              {t('description')}
            </p>
            {/* Social icons */}
            <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="text-white/60 transition-colors hover:text-white">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-white/60 transition-colors hover:text-white">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" aria-label="YouTube" className="text-white/60 transition-colors hover:text-white">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Contact info */}
          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-white/90">
              {t('contactTitle')}
            </h3>
            <ul className="mt-2 space-y-0.5">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/50" />
                <span className="text-[11px] leading-normal text-white/60">{t('contact.address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/50" />
                <span className="text-[11px] text-white/60">{t('contact.phone')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-white/50" />
                <span className="text-[11px] text-white/60">{t('contact.email')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-white/50" />
                <span className="text-[11px] text-white/60">{t('contact.hours')}</span>
              </li>
            </ul>
          </div>

          {/* About us */}
          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-white/90">
              {t('aboutTitle')}
            </h3>
            <ul className="mt-2 space-y-0">
              {aboutLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[11px] leading-relaxed text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products & Solutions */}
          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-white/90">
              {t('productsTitle')}
            </h3>
            <ul className="mt-2 space-y-0">
              {productLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[11px] leading-relaxed text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-white/90">
              {t('servicesTitle')}
            </h3>
            <ul className="mt-2 space-y-0">
              {serviceLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[11px] leading-relaxed text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <h3 className="text-[12px] font-semibold uppercase tracking-wide text-white/90">
              {t('supportTitle')}
            </h3>
            <ul className="mt-2 space-y-0">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[11px] leading-relaxed text-white/60 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              {t('newsletterTitle')}
            </h3>
            <p className="mt-2 text-[11px] leading-normal text-white/60 line-clamp-2">
              {t('newsletterDesc')}
            </p>
            <form className="mt-2 flex items-stretch overflow-hidden rounded-lg bg-white">
              <input
                type="email"
                placeholder={t('newsletterPlaceholder')}
                className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center bg-transparent text-brand transition-colors hover:text-brand-strong"
                aria-label={t('newsletterSubmit')}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto w-full max-w-[1440px] border-t border-white/10 px-4 py-4 sm:px-8 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
          <p className="text-[11px] text-white/50">
            © {year} ULink Industries. {t('rights')}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/about" className="text-[11px] text-white/50 transition-colors hover:text-white">
              {t('privacy')}
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/about" className="text-[11px] text-white/50 transition-colors hover:text-white">
              {t('terms')}
            </Link>
            <span className="text-white/20">|</span>
            <Link href="/about" className="text-[11px] text-white/50 transition-colors hover:text-white">
              {t('refund')}
            </Link>
          </div>
          <FooterLocaleSwitcher />
        </div>
      </div>
    </footer>
  );
}
