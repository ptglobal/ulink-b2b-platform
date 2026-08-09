'use client';

import { useTranslations } from 'next-intl';
import { UserRound, LogOut, ChevronDown, FileText, Package, ClipboardList, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import { isAdminUser } from '@/lib/auth';

export function HeaderAuthButton() {
  const t = useTranslations('nav');
  const { status, user, logout } = useAuth();
  const isAdmin = isAdminUser(user);

  // Still loading — render placeholder to avoid layout shift
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-9 w-9 animate-pulse rounded-lg bg-muted sm:h-[38px] sm:w-[100px]" />
    );
  }

  // Authenticated — show user info
  if (status === 'authenticated' && user) {
    const displayName = user.first_name
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
      : user.email.split('@')[0];

    return (
      <div className="group relative flex">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-foreground transition-colors hover:border-brand hover:text-brand sm:h-[38px] sm:w-auto sm:px-3"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span className="hidden max-w-[120px] truncate sm:inline">{displayName}</span>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:inline" aria-hidden="true" />
        </button>

        {/* Dropdown */}
        <div className="invisible absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0D4397] transition-colors hover:bg-blue-50 border-b border-slate-100"
            >
              <ShieldCheck className="h-4 w-4 text-[#0D4397]" aria-hidden="true" />
              {t('adminDashboard')}
            </Link>
          )}
          <Link
            href="/rfqs"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {t('rfqs')}
          </Link>
          <Link
            href="/my-rfqs"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            {t('myRfqs')}
          </Link>
          <Link
            href="/sample-requests"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            {t('sampleRequests')}
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t('settings')}
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
      className="flex h-9 w-9 items-center justify-center gap-1.5 rounded-md border border-brand bg-background text-brand transition-colors hover:bg-brand/10 sm:h-[38px] sm:w-auto sm:px-4"
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline text-[13px] font-medium">{t('login')}</span>
    </Link>
  );
}
