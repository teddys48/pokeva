import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from './useFavorites';
import { cn } from '@/lib/utils';

export interface FavoriteButtonProps {
  pokemonId: number;
  pokemonName: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  variant?: 'subtle' | 'outline' | 'solid';
}

export function FavoriteButton({
  pokemonId,
  pokemonName,
  size = 'md',
  showLabel = false,
  className,
  variant = 'outline',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(pokemonId);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Crucial: Stop event bubbling and prevent default to avoid triggering parent Link navigation
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ id: pokemonId, name: pokemonName });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Intercept Enter/Space keydown to prevent triggering parent card navigation
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
    }
  };

  const accessibleLabel = favorited
    ? `Remove ${pokemonName} from favorites`
    : `Add ${pokemonName} to favorites`;

  const sizeClasses = {
    sm: showLabel ? 'h-7 px-2.5 text-xs gap-1.5' : 'h-7 w-7 p-0',
    md: showLabel ? 'h-9 px-3 text-sm gap-2' : 'h-8 w-8 p-0',
    lg: showLabel ? 'h-11 px-4 text-sm sm:text-base gap-2.5' : 'h-10 w-10 p-0',
  }[size];

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  const variantStyles = {
    subtle: favorited
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent',
    outline: favorited
      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-400/30 hover:bg-rose-500/20 shadow-2xs'
      : 'bg-background/80 backdrop-blur-xs text-muted-foreground border border-border/80 hover:bg-secondary hover:text-foreground shadow-2xs',
    solid: favorited
      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={accessibleLabel}
      aria-pressed={favorited}
      title={accessibleLabel}
      className={cn(
        'group/fav inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'active:scale-95 cursor-pointer select-none',
        sizeClasses,
        variantStyles,
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes,
          'transition-all duration-200 shrink-0',
          favorited
            ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400 scale-105'
            : 'text-muted-foreground group-hover/fav:text-rose-500 group-hover/fav:scale-110'
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="truncate">
          {favorited ? 'In Favorites' : 'Favorite'}
        </span>
      )}
    </button>
  );
}
