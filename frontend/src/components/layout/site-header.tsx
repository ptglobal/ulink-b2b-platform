import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export async function SiteHeader() {
  const t = await getTranslations('nav');

  const items = [
    { href: '/regional-hubs', label: t('hubs') },
    { href: '/solutions', label: t('solutions') },
    { href: '/industries', label: t('industries') },
    { href: '/resources', label: t('resources') },
    { href: '/quick-order', label: t('quickOrder') },
    { href: '/about', label: t('about') }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-lg font-semibold tracking-tight">
          ULink<span className="text-accent">.</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 font-mono text-xs uppercase">
          {routing.locales.map((l) => (
            <Link
              key={l}
              href="/"
              locale={l}
              className="text-muted-foreground hover:text-foreground"
            >
              {l}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
