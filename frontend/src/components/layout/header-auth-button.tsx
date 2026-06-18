'use client';

import { useTranslations } from 'next-intl';
import { UserRound, LogOut, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';

export function HeaderAuthButton() {
  const t = useTranslations('nav');
  const { status, user, logout } = useAuth();

  // Still loading — render placeholder to avoid layout shift
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="hidden h-[38px] w-[100px] animate-pulse rounded-lg bg-muted sm:inline-flex" />
    );
  }

  // Authenticated — show user info
  if (status === 'authenticated' && user) {
    const displayName = user.first_name
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
      : user.email.split('@')[0];

    return (
      <div className="group relative hidden sm:inline-flex">
        <button
          type="button"
          className="flex h-[38px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-medium text-foreground transition-colors hover:border-brand hover:text-brand"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span className="max-w-[120px] truncate">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>

        {/* Dropdown */}
        <div className="invisible absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100">
          <Link
            href="/account"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t('account')}
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {t('logout')}
          </button>
        </div>
      </div>
    );
  }

  // Unauthenticated — show login button
  return (
    <Link
      href="/login"
      className="hidden h-[38px] items-center gap-1.5 rounded-lg border border-brand bg-brand px-4 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand/90 hover:border-brand sm:inline-flex"
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      {t('login')}
    </Link>
  );
}
