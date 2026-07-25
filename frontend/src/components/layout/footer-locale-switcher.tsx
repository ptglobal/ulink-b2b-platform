'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';

function FlagVN({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="640" height="480" fill="#da251d" />
      <polygon points="320,80 365,220 500,220 390,300 420,440 320,360 220,440 250,300 140,220 275,220" fill="#ff0" />
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

const locales: { code: Locale; flag: React.ComponentType<{ className?: string }>; label: string }[] = [
  { code: 'vi', flag: FlagVN, label: 'Tiếng Việt' },
  { code: 'en', flag: FlagUS, label: 'English' },
  { code: 'ja', flag: FlagJP, label: '日本語' },
];

/** Footer dropdown locale switcher — styled matching light-theme footer */
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:text-[15px]"
      >
        <current.flag className="h-4 w-6 rounded-sm object-cover shadow-xs" />
        <span>{current.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute bottom-full right-0 z-50 mb-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl transition-all"
        >
          {locales.map(({ code, flag: Flag, label }) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                onClick={() => switchLocale(code)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left text-[14px] transition-colors ${
                  code === locale
                    ? 'bg-brand/10 font-bold text-brand'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Flag className="h-4 w-6 rounded-sm object-cover shadow-xs" />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
