import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageIntroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}

export function PageIntro({ eyebrow, title, description, actions, meta, className, ...props }: PageIntroProps) {
  return (
    <header className={cn('border-b border-border bg-card', className)} {...props}>
      <div className="grid gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:py-10">
        <div>
          {eyebrow ? <div className="mb-3 font-mono text-xs text-brand">{eyebrow}</div> : null}
          <h1 className="max-w-4xl text-3xl font-light leading-[1.08] sm:text-4xl lg:text-5xl">{title}</h1>
          {description ? <p className="mt-4 max-w-[68ch] text-base leading-7 text-muted-foreground sm:text-lg">{description}</p> : null}
          {meta ? <div className="mt-5">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
