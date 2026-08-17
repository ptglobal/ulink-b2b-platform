'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Menu,
  X,
  UserRound,
  LogOut,
  FileText,
  Package,
  ClipboardList,
  ArrowRight
} from '@/components/icons';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  items: { href: string; label: string }[];
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { status, user, logout } = useAuth();
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      );
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);
  const drawerTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t('menu')}
        aria-controls="mobile-site-navigation"
        aria-expanded={open}
        className="ulink-pressable ml-1 flex h-11 w-11 items-center justify-center border border-[#dfe5ef] text-[#1769e2] hover:bg-[#edf5ff] min-[1200px]:hidden"
        onClick={() => setOpen((current) => !current)}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 flex justify-end min-[1200px]:hidden">
            <motion.button
              type="button"
              className="absolute inset-0 bg-[#0b1b3a]/58"
              aria-label={t('closeMenu')}
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            />
            <motion.div
              ref={panelRef}
              id="mobile-site-navigation"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-navigation-title"
              className="relative flex h-dvh w-[min(100vw,420px)] flex-col bg-white shadow-[-16px_0_48px_rgba(11,27,58,0.18)]"
              initial={{ transform: 'translateX(100%)' }}
              animate={{ transform: 'translateX(0%)' }}
              exit={{ transform: 'translateX(100%)' }}
              transition={drawerTransition}
            >
              <div className="ulink-safe-top flex min-h-16 items-center justify-between border-b border-white/15 bg-[#0b1b3a] pl-5 text-white">
                <div>
                  <p id="mobile-navigation-title" className="text-sm font-semibold">
                    ULink Industries
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-white/60">
                    B2B PROCUREMENT
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={t('closeMenu')}
                  onClick={close}
                  className="ulink-pressable flex h-14 w-14 items-center justify-center text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
                <nav className="grid" aria-label={t('menu')}>
                  {items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'ulink-pressable flex min-h-[54px] items-center justify-between border-b border-[#dfe5ef] px-3 text-[15px] font-medium text-[#536079] hover:bg-[#f5f8fc] hover:text-[#0b1b3a]',
                          active && 'bg-[#edf5ff] font-semibold text-[#1769e2]'
                        )}
                      >
                        {item.label}
                        <ArrowRight
                          className={cn('h-4 w-4 opacity-35', active && 'opacity-100')}
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
                </nav>

                {status === 'authenticated' && user ? (
                  <div className="mt-8 border-t border-[#dfe5ef] pt-6">
                    <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#6c7890]">
                      {t('account')}
                    </p>
                    <div className="grid">
                      <Link
                        href="/rfqs"
                        onClick={close}
                        className="flex min-h-12 items-center gap-3 px-3 text-sm hover:bg-[#f5f8fc]"
                      >
                        <FileText className="h-4 w-4 text-[#6c7890]" />
                        {t('rfqs')}
                      </Link>
                      <Link
                        href="/my-rfqs"
                        onClick={close}
                        className="flex min-h-12 items-center gap-3 px-3 text-sm hover:bg-[#f5f8fc]"
                      >
                        <ClipboardList className="h-4 w-4 text-[#6c7890]" />
                        {t('myRfqs')}
                      </Link>
                      <Link
                        href="/sample-requests"
                        onClick={close}
                        className="flex min-h-12 items-center gap-3 px-3 text-sm hover:bg-[#f5f8fc]"
                      >
                        <Package className="h-4 w-4 text-[#6c7890]" />
                        {t('sampleRequests')}
                      </Link>
                      <Link
                        href="/settings"
                        onClick={close}
                        className="flex min-h-12 items-center gap-3 px-3 text-sm hover:bg-[#f5f8fc]"
                      >
                        <UserRound className="h-4 w-4 text-[#6c7890]" />
                        {t('settings')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          logout();
                        }}
                        className="flex min-h-12 w-full items-center gap-3 px-3 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="ulink-safe-bottom border-t border-[#dfe5ef] bg-[#f5f8fc] p-4 sm:p-5">
                <Link
                  href="/quick-order"
                  onClick={close}
                  className="ulink-pressable flex min-h-12 w-full items-center justify-between bg-[#1769e2] px-5 text-sm font-semibold text-white hover:bg-[#0f57bd]"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t('quickOrder')}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {status !== 'authenticated' ? (
                  <Link
                    href="/login"
                    onClick={close}
                    className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 border border-[#d0d8e5] bg-white text-sm font-medium text-[#0b1b3a] hover:bg-[#edf5ff]"
                  >
                    <UserRound className="h-4 w-4" />
                    {t('login')}
                  </Link>
                ) : null}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
