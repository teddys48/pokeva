import * as React from 'react';
import { cn } from '@/lib/utils';
import { getTypeStyle, PokemonTypeName } from '@/styles/typeColors';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'pokemonType';
  pokemonType?: PokemonTypeName;
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  pokemonType,
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  if (variant === 'pokemonType' || pokemonType) {
    const style = getTypeStyle(pokemonType || 'normal');
    return (
      <span
        className={cn(
          'inline-flex items-center font-semibold uppercase tracking-wider border transition-colors select-none',
          style.badgeBg,
          style.badgeText,
          style.badgeBorder,
          size === 'sm' ? 'px-2 py-0.5 text-[10px] rounded-md gap-1' : 'px-2.5 py-1 text-xs rounded-md gap-1.5',
          className
        )}
        {...props}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: style.bgHex }}
          aria-hidden="true"
        />
        {children || style.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border select-none transition-colors',
        {
          'bg-primary text-primary-foreground border-transparent': variant === 'default',
          'bg-secondary text-secondary-foreground border-transparent': variant === 'secondary',
          'bg-transparent text-foreground border-border': variant === 'outline',
          'px-2 py-0.5 text-[10px] rounded-md': size === 'sm',
          'px-2.5 py-1 text-xs rounded-md': size === 'md',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
