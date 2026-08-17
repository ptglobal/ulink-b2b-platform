import * as React from 'react';
import { cn } from '@/lib/utils';

export const Surface = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('cds--tile rounded-none border-0 bg-card text-card-foreground', className)} {...props} />
  )
);
Surface.displayName = 'Surface';

export function SurfaceHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 border-b border-border px-5 py-4 sm:px-6', className)} {...props} />;
}

export function SurfaceTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-medium leading-tight', className)} {...props} />;
}

export function SurfaceDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('max-w-[68ch] text-sm leading-6 text-muted-foreground', className)} {...props} />;
}

export function SurfaceContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props} />;
}

export function SurfaceFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-3 border-t border-border px-5 py-4 sm:px-6', className)} {...props} />;
}
