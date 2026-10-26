import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap',
          'active:scale-[0.98]',
          {
            // Variants
            'bg-primary text-primary-foreground shadow-sm hover:brightness-105 active:brightness-95':
              variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80':
              variant === 'secondary',
            'border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground':
              variant === 'outline',
            'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground':
              variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90':
              variant === 'destructive',

            // Sizes
            'h-8 px-3 text-xs rounded-md gap-1.5': size === 'sm',
            'h-10 px-4 py-2 text-sm rounded-lg gap-2': size === 'md',
            'h-12 px-6 text-base rounded-lg gap-2.5': size === 'lg',
            'h-10 w-10 p-0 rounded-lg shrink-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
