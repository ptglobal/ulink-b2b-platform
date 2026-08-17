import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  context?: React.ReactNode;
  action?: React.ReactNode;
  align?: 'left' | 'center';
}

export function SectionHeading({
  title,
  description,
  context,
  action,
  align = 'left',
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'mx-auto max-w-3xl text-center md:block',
        className
      )}
      {...props}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {context ? <div className="mb-4 font-mono text-xs font-medium text-brand">{context}</div> : null}
        <h2 className="text-3xl font-semibold leading-[1.04] tracking-[-0.03em] sm:text-4xl lg:text-5xl">{title}</h2>
        {description ? <p className="mt-5 max-w-[68ch] text-base leading-7 text-muted-foreground sm:text-lg">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
