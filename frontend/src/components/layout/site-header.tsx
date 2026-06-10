import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ChevronDown, Search, ShoppingCart, ArrowRight, UserRound } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

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
      <div className="flex h-[88px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" aria-label="ULink Industries" className="flex shrink-0 items-center">
          <Image src={ASSETS.logo.full} alt="ULink Industries" width={196} height={54} priority />
        </Link>

        {/* Menu chính — trải đều trên không gian còn lại */}
        <nav className="hidden flex-1 items-center justify-evenly lg:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-center gap-1 whitespace-nowrap text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {it.label}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        {/* Hành động bên phải */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label={t('search')}
            className="flex h-10 w-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-muted"
          >
            <Search className="h-[22px] w-[22px]" aria-hidden="true" />
          </button>

          <Link
            href="/quick-order"
            aria-label={t('cart')}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-primary transition-colors hover:bg-muted"
          >
            <ShoppingCart className="h-[22px] w-[22px]" aria-hidden="true" />
            <span className="absolute right-0.5 top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium leading-none text-primary-foreground">
              2
            </span>
          </Link>

          <Link
            href="/quick-order"
            className="hidden h-[38px] items-center gap-2 rounded-[3px] border border-input bg-card px-4 text-[13px] text-foreground/70 transition-colors hover:border-brand hover:text-brand md:inline-flex"
          >
            {t('quickOrder')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <Link
            href="/login"
            className="inline-flex h-[38px] items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t('login')}
          </Link>
        </div>
      </div>
    </header>
  );
}
