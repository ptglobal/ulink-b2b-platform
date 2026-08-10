import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Search, ShoppingCart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';
import { MobileNav } from './mobile-nav';
import { HeaderAuthButton } from './header-auth-button';
import { CartBadge } from './cart-badge';

import { getCurrentUser, isAdminUser } from '@/lib/auth-helpers';

/**
 * Header trang chủ — bám sát thiết kế Figma (node 2071:1118):
 * logo · menu (có chevron) · tìm kiếm · giỏ hàng (badge) · Đặt hàng nhanh · Đăng nhập.
 */
export async function SiteHeader() {
  const t = await getTranslations('nav');
  const user = await getCurrentUser();
  const isAdmin = isAdminUser(user);

  const items = [
    { href: '/solutions', label: t('solutions') },
    { href: '/products', label: t('products') },
    { href: '/industries', label: t('industries') },
    { href: '/regional-hubs', label: t('hubs') },
    { href: '/resources', label: t('resources') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
    ...(isAdmin ? [{ href: '/admin', label: t('adminDashboard') }] : [])
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
              className="whitespace-nowrap text-[13px] font-semibold text-foreground transition-colors hover:text-brand"
            >
              {it.label}
            </Link>
          ))}
        </nav>

        {/* Hành động bên phải */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">




          <Link
            href="/quick-order"
            className="hidden h-[38px] items-center rounded-md bg-brand px-4 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand-strong lg:inline-flex"
          >
            {t('quickOrder')}
          </Link>

          <HeaderAuthButton />

          {/* Mobile nav — hiện dưới md */}
          <MobileNav items={items} />
        </div>
      </div>
    </header>
  );
}
