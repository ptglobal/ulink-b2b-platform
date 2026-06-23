'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface FilterGroup {
  key: string;
  label: string;
  options: Array<{ slug: string; name: string; count?: number }>;
}

interface ProductFilterProps {
  groups: FilterGroup[];
}

export default function ProductFilter({ groups }: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(key: string, slug: string, checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      params.set(key, slug);
    } else {
      params.delete(key);
    }
    params.set('page', '1');

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={`space-y-6 ${isPending ? 'opacity-70' : ''}`}>
      {groups.map((group, index) => (
        <div key={group.key}>
          {index > 0 && <hr className="mb-4" />}
          <h3 className="font-semibold text-sm uppercase mb-2">
            {group.label}
          </h3>
          <div className="space-y-1">
            {group.options.map((option) => {
              const isChecked = searchParams.get(group.key) === option.slug;

              return (
                <label
                  key={option.slug}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      handleChange(group.key, option.slug, e.target.checked)
                    }
                    className="accent-primary h-4 w-4 rounded"
                  />
                  <span>
                    {option.name}
                    {option.count != null && (
                      <span className="text-muted-foreground ml-1">
                        ({option.count})
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
