import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ChevronDown, Search, ShoppingCart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { MobileNav } from './mobile-nav';
import { CartBadge } from './cart-badge';
import { HeaderAuthButton } from './header-auth-button';

/**
 * Header trang chủ — bám sát thiết kế Figma (node 2071:1118):
 * logo · menu (có chevron) · tìm kiếm · giỏ hàng (badge) · Đặt hàng nhanh · Đăng nhập.
 */
export async function SiteHeader() {
  const t = await getTranslations('nav');

  const items = [
    { href: '/regional-hubs', label: t('hubs') },
    { href: '/solutions', label: t('solutions') },
    { href: '/industries', label: t('industries') },
    { href: '/resources', label: t('resources') },
    { href: '/about', label: t('about') }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-8 md:h-[88px] lg:px-16">
        {/* Logo */}
        <Link href="/" aria-label="ULink Industries" className="flex shrink-0 items-center">
          <Image
            src={ASSETS.logo.full}
            alt="ULink Industries"
            width={196}
            height={54}
            priority
            className="h-10 w-auto sm:h-12 md:h-[54px]"
          />
        </Link>

        {/* Menu chính — ẩn dưới md, hiện từ md trở lên */}
        <nav className="hidden flex-1 items-center justify-evenly md:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-center gap-1 whitespace-nowrap text-[13px] text-primary transition-colors hover:text-brand"
            >
              {it.label}
              <ChevronDown className="h-3.5 w-3.5 text-primary/60" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        {/* Hành động bên phải */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <button
            type="button"
            aria-label={t('search')}
            className="flex h-9 w-9 items-center justify-center text-primary transition-colors hover:bg-muted sm:h-10 sm:w-10"
          >
            <Search className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden="true" />
          </button>

          <Link
            href="/quick-order"
            aria-label={t('cart')}
            className="relative flex h-9 w-9 items-center justify-center text-primary transition-colors hover:bg-muted sm:h-10 sm:w-10"
          >
            <ShoppingCart className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden="true" />
            <CartBadge />
          </Link>

          <HeaderAuthButton />

          {/* Mobile nav — hiện dưới md */}
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}
