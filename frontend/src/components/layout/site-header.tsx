import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Search, ShoppingCart } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { MobileNav } from './mobile-nav';
import { HeaderAuthButton } from './header-auth-button';
import { CartBadge } from './cart-badge';
import { MainNav } from './main-nav';

/** Shared 1440px navigation frame from the approved Figma file. */
export async function SiteHeader() {
  const t = await getTranslations('nav');
  const items = [
    { href: '/regional-hubs', label: t('hubs') },
    { href: '/products', label: t('products') },
    { href: '/industries', label: t('industries') },
    { href: '/resources', label: t('resources') },
    { href: '/about', label: t('about') }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e3e8f0] bg-white text-[#0f1e36] min-[1440px]:border-b-0">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 sm:h-20 sm:px-8 min-[1200px]:gap-2 min-[1440px]:h-[100px] min-[1440px]:gap-2.5 min-[1440px]:px-20">
        <Link href="/" aria-label="ULink Industries" className="flex shrink-0 items-center">
          <Image
            src={ASSETS.logo.full}
            alt="ULink Industries"
            width={173}
            height={72}
            priority
            className="h-9 w-auto sm:h-10 min-[1200px]:h-12 min-[1440px]:h-[72px] min-[1440px]:w-[173px]"
          />
        </Link>

        <MainNav items={items} />

        <div className="ml-auto flex h-full items-center min-[1200px]:ml-0 min-[1200px]:h-[45px] min-[1200px]:shrink-0 min-[1200px]:justify-end min-[1200px]:gap-3 min-[1440px]:w-[439px] min-[1440px]:gap-5">
          <Link
            href="/products"
            aria-label={t('search')}
            className="hidden h-11 w-11 shrink-0 items-center justify-center text-[#1769e2] transition-colors hover:bg-[#edf3ff] min-[1200px]:inline-flex"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/cart"
            aria-label={t('quickOrder')}
            className="relative hidden h-11 w-11 shrink-0 items-center justify-center text-[#1769e2] transition-colors hover:bg-[#edf3ff] min-[1200px]:inline-flex"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <CartBadge />
          </Link>
          <Link
            href="/quick-order"
            className="hidden h-[45px] w-[112px] shrink-0 items-center justify-center rounded-[3px] bg-[#1769e2] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#0f57bd] min-[1200px]:inline-flex min-[1440px]:w-[120px] min-[1440px]:px-4"
          >
            {t('quickOrder')}
          </Link>
          <div className="hidden shrink-0 min-[1200px]:block">
            <HeaderAuthButton />
          </div>
          <Link
            href="/cart"
            aria-label={t('quickOrder')}
            className="ulink-pressable relative inline-flex h-11 w-11 shrink-0 items-center justify-center text-[#1769e2] hover:bg-[#edf5ff] min-[1200px]:hidden"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            <CartBadge />
          </Link>
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}
