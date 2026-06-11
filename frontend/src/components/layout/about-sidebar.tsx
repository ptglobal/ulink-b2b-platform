'use client';

import { Briefcase } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

type NavItem = { key: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { key: 'hub', href: '/about' },
  { key: 'quality', href: '/about/quality' },
  { key: 'sustainability', href: '/about/sustainability' },
  { key: 'capabilities', href: '/about/capabilities' },
  { key: 'news', href: '/about/news' }
];

export function AboutSidebar() {
  const t = useTranslations('aboutSidebar');
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/about'
      ? pathname === '/about'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="w-full shrink-0 border-r border-[#B8C0CC] lg:w-[228px]">
      <nav className="flex flex-col py-6 pr-3">
        {/* Heading */}
        <h2 className="mb-4 px-4 text-[12px] font-bold tracking-wide text-primary">
          {t('heading')}
        </h2>

        {/* Nav items */}
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative block overflow-hidden rounded-[0.25rem] px-4 py-2.5 text-[11px] font-bold transition-all duration-200 ${
                    active
                      ? 'bg-[#ECF3FD] text-brand'
                      : 'text-primary/65 hover:bg-muted hover:text-primary'
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-[3px] rounded-l-[0.25rem] bg-brand transition-transform duration-200 ${
                      active ? 'translate-x-0' : '-translate-x-full'
                    }`}
                  />
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-4 mx-4 h-px bg-[#B8C0CC]" />

        {/* Careers — separated with icon */}
        <Link
          href="/about/careers"
          aria-current={isActive('/about/careers') ? 'page' : undefined}
          className={`relative flex items-center gap-2 overflow-hidden rounded-[0.25rem] px-4 py-2.5 text-[11px] font-bold transition-all duration-200 ${
            isActive('/about/careers')
              ? 'bg-[#ECF3FD] text-brand'
              : 'text-primary/65 hover:bg-muted hover:text-primary'
          }`}
        >
          <span
            className={`absolute inset-y-0 left-0 w-[3px] rounded-l-[0.25rem] bg-brand transition-transform duration-200 ${
              isActive('/about/careers') ? 'translate-x-0' : '-translate-x-full'
            }`}
          />
          <Briefcase className="h-[15px] w-[15px]" strokeWidth={1.6} />
          {t('careers')}
        </Link>
      </nav>
    </aside>
  );
}
