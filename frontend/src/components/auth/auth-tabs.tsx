'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// Standalone auth pages hide the login/register tabs — they have their own
// navigation pattern (back link, breadcrumb, etc).
const STANDALONE_PREFIXES = [
  '/forgot-password',
  '/reset-password',
  '/change-password',
  '/verify-otp',
  '/register/confirm'
];

/** Tab điều hướng giữa Đăng nhập / Đăng ký (route-based, tốt cho SEO & deep-link). */
export function AuthTabs() {
  const t = useTranslations('auth');
  const pathname = usePathname();

  const isStandalone = STANDALONE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isStandalone) return null;

  const tabs = [
    { href: '/login', label: t('tabLogin') },
    { href: '/register', label: t('tabRegister') }
  ];

  return (
    <div className="mb-6 flex border-b border-border">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex-1 pb-3 text-center text-sm font-medium transition-colors',
              active
                ? 'border-b-2 border-brand text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
