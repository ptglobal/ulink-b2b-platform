'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from '@/components/icons';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';

function FlagVN({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#da251d" />
      <polygon
        points="320,80 365,220 500,220 390,300 420,440 320,360 220,440 250,300 140,220 275,220"
        fill="#ff0"
      />
    </svg>
  );
}

function FlagUS({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#fff" />
      <g fill="#b22234">
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect key={i} y={i * 37} width="640" height="37" />
        ))}
      </g>
      <rect width="256" height="259" fill="#3c3b6e" />
    </svg>
  );
}

function FlagJP({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#fff" />
      <circle cx="320" cy="240" r="120" fill="#bc002d" />
    </svg>
  );
}

const locales: {
  code: Locale;
  flag: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { code: 'vi', flag: FlagVN, label: 'Tiếng Việt' },
  { code: 'en', flag: FlagUS, label: 'English' },
  { code: 'ja', flag: FlagJP, label: '日本語' }
];

/** Compact locale switcher for the light Figma footer. */
export function FooterLocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = locales.find((l) => l.code === locale) || locales[0];

  function switchLocale(next: Locale) {
    setOpen(false);
    if (next !== locale) router.replace(pathname, { locale: next });
  }

  return (
    <div ref={ref} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2.5 border border-[#d7dfeb] bg-white px-4 text-sm font-medium text-[#26344d] hover:border-[#1769e2] hover:bg-[#edf5ff] md:w-auto md:min-w-44"
      >
        <current.flag className="h-4 w-6 object-cover" />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#68758c] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute bottom-full left-0 z-50 mb-2 w-full overflow-hidden border border-[#d7dfeb] bg-white py-1 shadow-overlay md:left-auto md:right-0 md:w-44"
        >
          {locales.map(({ code, flag: Flag, label }) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                onClick={() => switchLocale(code)}
                className={`flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm transition-colors ${
                  code === locale
                    ? 'bg-[#edf5ff] font-semibold text-[#1769e2]'
                    : 'text-[#536079] hover:bg-[#f5f8fc] hover:text-[#172540]'
                }`}
              >
                <Flag className="h-4 w-6 object-cover" />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
