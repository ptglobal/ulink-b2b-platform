import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Mail, MapPin, Phone } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { FALLBACK_SITE_SETTINGS, getSiteSettings } from '@/lib/site-settings';
import { FooterLocaleSwitcher } from './footer-locale-switcher';

const footerLink =
  'inline-flex min-h-11 items-center text-[13px] leading-5 text-[#536079] hover:text-[#1769e2] lg:min-h-8';

export async function SiteFooter() {
  const [t, settings] = await Promise.all([getTranslations('footer'), getSiteSettings()]);
  const address = settings.address || FALLBACK_SITE_SETTINGS.address || '';
  const email = settings.contact_email || FALLBACK_SITE_SETTINGS.contact_email || '';
  const phone = settings.contact_phone || FALLBACK_SITE_SETTINGS.contact_phone || '';
  const groups = [
    {
      title: t('aboutTitle'),
      href: '/about',
      links: [
        [t('aboutHub'), '/regional-hubs'],
        [t('aboutQuality'), '/about/quality'],
        [t('aboutSustainability'), '/about/sustainability'],
        [t('aboutSupply'), '/about/standards'],
        [t('aboutCareers'), '/about/careers']
      ]
    },
    {
      title: t('industriesTitle'),
      href: '/industries',
      links: [
        [t('indElectronics'), '/industries/electronics'],
        [t('indPharma'), '/industries/pharmaceutical-cosmetics'],
        [t('indFood'), '/industries/food-beverage'],
        [t('indLogistics'), '/industries/logistics'],
        [t('indFurniture'), '/industries/furniture'],
        [t('indHvac'), '/industries/construction']
      ]
    },
    {
      title: t('productsTitle'),
      href: '/products',
      links: [
        [t('prodCleanroom'), '/products/categories/cleanroom-consumables'],
        [t('prodPackaging'), '/products/categories/industrial-packaging'],
        [t('prodHvac'), '/products/categories/esd-supplies']
      ]
    }
  ] as const;
  const socials = [
    ['LinkedIn', 'https://linkedin.com', ASSETS.footer.linkedin],
    ['Facebook', 'https://facebook.com', ASSETS.footer.facebook],
    ['TikTok', 'https://tiktok.com', ASSETS.footer.tiktok],
    ['YouTube', 'https://youtube.com', ASSETS.footer.youtube]
  ] as const;

  const renderGroupExtras = (href: string, compact = false) => {
    if (href === '/about') {
      return (
        <div className={compact ? 'mt-5 border-t border-[#dfe5ef] pt-5' : 'mt-7'}>
          <p className="text-[12px] font-semibold text-[#26344d]">{t('becomeDistributor')}</p>
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="mt-1 flex min-h-11 items-center gap-2 text-base font-bold text-[#1769e2] lg:mt-2 lg:text-lg"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            {phone}
          </a>
          <Image
            src={ASSETS.footer.boCongThuong}
            alt="Registered with the Ministry of Industry and Trade"
            width={174}
            height={60}
            className="mt-3 h-11 w-auto object-contain lg:mt-5 lg:h-12"
          />
        </div>
      );
    }

    if (href === '/products') {
      return (
        <div className={compact ? 'mt-5 border-t border-[#dfe5ef] pt-5' : 'mt-7'}>
          <FooterLocaleSwitcher />
        </div>
      );
    }

    return null;
  };

  return (
    <footer
      id="site-footer"
      className="w-full border-t border-[#dfe5ef] bg-[#f5f8fc] text-[#0f1e36]"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 pt-10 sm:px-8 lg:pt-14 xl:px-20">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_.9fr_.9fr_.75fr_.7fr] lg:gap-9">
          <div>
            <Link
              href="/"
              aria-label="ULink Industries"
              className="inline-flex min-h-11 items-center"
            >
              <Image
                src={ASSETS.logo.full}
                alt="ULink Industries"
                width={174}
                height={48}
                className="h-11 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-[40ch] text-[13px] leading-5 text-[#536079] lg:mt-5">
              {t('descLine1')}
            </p>
            <p className="mt-3 max-w-[42ch] text-[12px] leading-5 text-[#6c7890]">
              {t('descLine2')}
            </p>
            <div className="mt-5 space-y-1 text-[13px] text-[#536079] lg:mt-6 lg:space-y-3">
              <Link
                href="/regional-hubs"
                className="flex min-h-11 items-start gap-3 py-2 hover:text-[#1769e2]"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <strong className="block text-[#26344d]">{t('hubTitle')}</strong>
                  {address}
                </span>
              </Link>
              <a
                href={`mailto:${email}`}
                className="flex min-h-11 items-center gap-3 hover:text-[#1769e2]"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {email}
              </a>
            </div>
            <p className="mt-5 text-[12px] font-semibold text-[#26344d] lg:mt-6">
              {t('connectSocials')}
            </p>
            <div className="mt-2 flex items-center gap-1 lg:mt-3 lg:gap-3">
              {socials.map(([label, href, src]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="ulink-pressable inline-flex h-11 w-11 items-center justify-center hover:bg-white"
                >
                  <Image
                    src={src}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.href}>
              <nav aria-label={group.title} className="hidden lg:block">
                <Link
                  href={group.href}
                  className="text-[13px] font-bold uppercase tracking-[.04em] text-[#15233d] hover:text-[#1769e2]"
                >
                  {group.title}
                </Link>
                <ul className="mt-5 space-y-1">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className={footerLink}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {renderGroupExtras(group.href)}
              </nav>

              <details className="group border-t border-[#dfe5ef] lg:hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-[13px] font-bold uppercase tracking-[.04em] text-[#15233d] [&::-webkit-details-marker]:hidden">
                  {group.title}
                  <span
                    className="flex h-11 w-11 items-center justify-center text-xl font-light text-[#1769e2] transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <nav aria-label={group.title} className="pb-5">
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {group.links.map(([label, href]) => (
                      <li key={href}>
                        <Link href={href} className={footerLink}>
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {renderGroupExtras(group.href, true)}
                </nav>
              </details>
            </div>
          ))}

          <div className="flex items-center gap-5 border-t border-[#dfe5ef] pt-6 lg:block lg:justify-self-end lg:border-0 lg:pt-0">
            <p className="max-w-[12rem] text-[13px] font-bold text-[#15233d] lg:text-center">
              {t('downloadApp')}
            </p>
            <div className="bg-white p-2 lg:mt-3 lg:p-3">
              <Image
                src={ASSETS.footer.qrCode}
                alt="ULink application download QR code"
                width={150}
                height={150}
                className="h-[92px] w-[92px] object-contain lg:h-[132px] lg:w-[132px]"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="ulink-safe-bottom mt-10 border-t border-[#dfe5ef] bg-[#edf3fa] px-4 py-6 text-center text-[12px] text-[#6c7890] lg:mt-12">
        {t('copyright')}
      </div>
    </footer>
  );
}
