'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderRfqButtonProps {
  label: string;
}

export function HeaderRfqButton({ label }: HeaderRfqButtonProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      try {
        const raw = localStorage.getItem('rfq-cart');
        if (raw) {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            setCount(items.length);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to parse rfq-cart count', err);
      }
      setCount(0);
    }

    updateCount();

    window.addEventListener('storage', updateCount);
    window.addEventListener('rfq-cart-changed', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('rfq-cart-changed', updateCount);
    };
  }, []);

  return (
    <Link
      href="/quick-order"
      className={cn(buttonVariants({ size: 'sm' }), 'hidden h-12 border-l border-white/15 xl:inline-flex')}
    >
      <ShoppingCart className="h-4 w-4 shrink-0" />
      <span>{label}</span>
      {count > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 animate-in items-center justify-center bg-white px-1 font-mono text-[10px] font-semibold text-brand zoom-in duration-200">
          {count}
        </span>
      )}
    </Link>
  );
}
