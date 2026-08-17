'use client';

import { useTranslations } from 'next-intl';
import {
  UserRound,
  LogOut,
  ChevronDown,
  FileText,
  Package,
  ClipboardList
} from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';

export function HeaderAuthButton() {
  const t = useTranslations('nav');
  const { status, user, logout } = useAuth();

  // Still loading — render placeholder to avoid layout shift
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex h-[45px] w-[135px] items-center justify-center gap-2.5 rounded-[3px] border-[1.25px] border-[#1769e2] bg-white px-4 text-[#1769e2]">
        <UserRound className="h-4 w-4" aria-hidden="true" />
        <span className="text-[13px] font-medium">{t('login')}</span>
      </div>
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
          className="flex h-[45px] w-[135px] items-center justify-center gap-2.5 rounded-[3px] border-[1.25px] border-[#1769e2] bg-white px-4 text-[#1769e2] hover:bg-[#edf3ff]"
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span className="max-w-[82px] truncate text-[13px] font-medium">{displayName}</span>
          <ChevronDown
            className="h-3.5 w-3.5 text-[#5f6b82]"
            aria-hidden="true"
          />
        </button>

        {/* Dropdown */}
        <div className="invisible absolute right-0 top-[calc(100%+8px)] z-50 min-w-[240px] border border-[#dfe5ef] bg-white p-1 text-[#0f1e36] shadow-overlay opacity-0 transition-[opacity,visibility,transform] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <Link
            href="/rfqs"
            className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-[#edf2ff]"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {t('rfqs')}
          </Link>
          <Link
            href="/my-rfqs"
            className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-[#edf2ff]"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            {t('myRfqs')}
          </Link>
          <Link
            href="/sample-requests"
            className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-[#edf2ff]"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            {t('sampleRequests')}
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-[#edf2ff]"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
            {t('settings')}
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-2 px-3 py-3 text-sm text-destructive hover:bg-destructive/10"
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
      className="flex h-[45px] w-[135px] items-center justify-center gap-2.5 rounded-[3px] border-[1.25px] border-[#1769e2] bg-white px-4 text-[#1769e2] transition-colors hover:bg-[#edf3ff]"
    >
      <UserRound className="h-4 w-4" aria-hidden="true" />
      <span className="text-[13px] font-medium">{t('login')}</span>
    </Link>
  );
}
