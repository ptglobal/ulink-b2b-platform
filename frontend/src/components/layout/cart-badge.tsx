'use client';

import { useEffect, useState } from 'react';

export function CartBadge() {
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

  if (count === 0) return null;

  return (
    <span className="absolute right-0.5 top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium leading-none text-primary-foreground sm:right-0.5 sm:top-1 animate-in zoom-in duration-200">
      {count}
    </span>
  );
}
