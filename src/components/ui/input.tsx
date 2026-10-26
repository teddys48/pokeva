import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, clearable, onClear, value, disabled, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          value={value}
          disabled={disabled}
          className={cn(
            'flex h-11 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground shadow-sm transition-colors',
            'placeholder:text-muted-foreground/70',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            clearable && value && 'pr-9',
            className
          )}
          {...props}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className="absolute right-3 flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
