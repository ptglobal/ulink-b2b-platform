'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface MobileNavProps {
  items: { href: string; label: string }[];
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible below md */}
      <button
        type="button"
        aria-label="Menu"
        className="flex h-10 w-10 items-center justify-center text-primary md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay + Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Sheet from bottom */}
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto bg-background pb-safe animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-sm font-semibold text-primary">Menu</span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col px-5 py-3">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-border py-3 text-sm text-primary transition-colors hover:text-brand"
                >
                  {it.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
