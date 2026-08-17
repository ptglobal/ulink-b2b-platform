import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'cds--btn ulink-pressable inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-normal focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'cds--btn--primary',
        secondary: 'cds--btn--secondary',
        dark: 'cds--btn--primary',
        ghost: 'cds--btn--ghost',
        quiet: 'cds--btn--tertiary',
        danger: 'cds--btn--danger',
        link: 'cds--btn--ghost h-auto min-h-0 p-0 text-brand'
      },
      size: {
        sm: 'cds--btn--sm',
        default: 'cds--btn--md',
        lg: 'cds--btn--lg',
        icon: 'cds--btn--sm h-11 w-11 min-w-11 p-0'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingLabel?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, loadingLabel, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-2 w-2 animate-pulse bg-current" aria-hidden="true" />
            <span>{loadingLabel ?? children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
