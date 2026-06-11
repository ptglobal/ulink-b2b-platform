'use client';

import { ChevronRight } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const ROUTE_KEYS: { match: (p: string) => boolean; key: string }[] = [
  { match: (p) => p === '/about/quality' || p.startsWith('/about/quality/'), key: 'quality' },
  { match: (p) => p === '/about/sustainability' || p.startsWith('/about/sustainability/'), key: 'sustainability' },
  { match: (p) => p === '/about/capabilities' || p.startsWith('/about/capabilities/'), key: 'capabilities' },
  { match: (p) => p === '/about/news' || p.startsWith('/about/news/'), key: 'news' },
  { match: (p) => p === '/about/careers' || p.startsWith('/about/careers/'), key: 'careers' }
];

export function AboutBreadcrumb() {
  const t = useTranslations('aboutSidebar');
  const tNav = useTranslations('nav');
  const pathname = usePathname();

  const currentKey = ROUTE_KEYS.find((r) => r.match(pathname))?.key ?? 'hub';

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 py-4 text-[12px] text-muted-foreground"
    >
      <Link href="/" className="transition-colors hover:text-brand">
        {tNav('home')}
      </Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/about" className="transition-colors hover:text-brand">
        {tNav('about')}
      </Link>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-primary">{t(currentKey)}</span>
    </nav>
  );
}
