'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface MainNavProps {
  items: { href: string; label: string }[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="hidden h-10 min-w-0 flex-1 items-center gap-4 pl-7 pr-4 min-[1200px]:flex min-[1360px]:gap-6 min-[1440px]:w-[649px] min-[1440px]:shrink-0 min-[1440px]:gap-7 min-[1440px]:pl-[70px] min-[1440px]:pr-10"
    >
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex h-10 shrink-0 items-center whitespace-nowrap text-[13px] font-medium text-[#15233d] transition-colors hover:text-[#1769e2]',
              active &&
                'text-[#1769e2] after:absolute after:inset-x-0 after:-bottom-[13px] after:h-0.5 after:bg-[#1769e2]'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
