import * as React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-64 flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-12 text-center', className)} {...props}>
      {icon ? <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-muted text-muted-foreground">{icon}</div> : null}
      <h3 className="text-base font-semibold tracking-[-0.015em]">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
