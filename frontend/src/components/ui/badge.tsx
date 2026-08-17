import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'cds--tag inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-normal leading-none',
  {
    variants: {
      variant: {
        neutral: 'cds--tag--gray bg-muted text-muted-foreground',
        brand: 'cds--tag--blue bg-brand/10 text-brand',
        info: 'cds--tag--cyan bg-evidence/10 text-evidence',
        success: 'cds--tag--green bg-success/10 text-success',
        warning: 'cds--tag--warm-gray bg-warning/10 text-warning',
        danger: 'cds--tag--red bg-destructive/10 text-destructive'
      },
      dot: {
        true: 'before:h-1.5 before:w-1.5 before:rounded-full before:bg-current'
      }
    },
    defaultVariants: {
      variant: 'neutral',
      dot: false
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, dot, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, dot }), className)} {...props} />;
}
