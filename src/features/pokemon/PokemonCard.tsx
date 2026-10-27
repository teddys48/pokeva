import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Pokemon } from '@/types/pokemon';
import { Badge } from '@/components/ui/badge';
import { formatPokemonId, formatHeight, formatWeight } from '@/lib/utils';
import { getTypeStyle } from '@/styles/typeColors';
import { cn } from '@/lib/utils';
import { Shield, Zap, Sparkles, ArrowUpRight } from 'lucide-react';
import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import { usePokemonImage } from './usePokemonImage';
import { queryClient } from '@/lib/queryClient';
import { pokemonQueries } from '@/services/pokeapi/queries';

export interface PokemonCardProps {
  pokemon: Pokemon;
  className?: string;
  priority?: boolean;
}

export const PokemonCard = memo(function PokemonCard({
  pokemon,
  className,
  priority = false,
}: PokemonCardProps) {
  const {
    currentImgSrc,
    isLoaded,
    imageError,
    imgRef,
    onLoad,
    onError,
  } = usePokemonImage({
    primarySrc: pokemon.artworkUrl,
    fallbackSrc: pokemon.imageUrl,
    identifier: pokemon.id,
  });

  const primaryType = pokemon.types[0] || 'normal';
  const typeStyle = getTypeStyle(primaryType);

  // Intent-based prefetching for instantaneous detail page transitions
  const handlePrefetch = useCallback(() => {
    if (pokemon.name) {
      queryClient.prefetchQuery(pokemonQueries.detail(pokemon.name));
      queryClient.prefetchQuery(pokemonQueries.species(pokemon.name));
    }
  }, [pokemon.name]);

  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      tabIndex={0}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      aria-label={`View details for ${pokemon.displayName}, #${formatPokemonId(pokemon.id)}, ${pokemon.types.join(' and ')} type`}
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 cursor-pointer',
        'hover:-translate-y-1 hover:border-border hover:shadow-lg',
        typeStyle.cardGlow,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Top Meta: ID, Genus, Favorite Toggle & Detail Navigation Affordance */}
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-mono font-semibold tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
          {formatPokemonId(pokemon.id)}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground/80 truncate max-w-[100px]">
            {pokemon.genus}
          </span>
          <FavoriteButton
            pokemonId={pokemon.id}
            pokemonName={pokemon.displayName}
            size="sm"
            variant="outline"
          />
          <ArrowUpRight
            className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Pokémon Image Container with Type Backdrop & Anti-Layout-Shift Bounds */}
      <div
        className={cn(
          'relative my-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 transition-colors',
          typeStyle.cardSurfaceLight,
          typeStyle.cardSurfaceDark
        )}
      >
        {/* Subtle radial glow matching primary type */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-25 transition-opacity group-hover:opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${typeStyle.bgHex} 0%, transparent 70%)` as string,
          }}
          aria-hidden="true"
        />

        {/* Loading placeholder skeleton */}
        {!isLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-muted/40">
            <Sparkles className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}

        {/* Pokémon Official Artwork with Sprite Fallback */}
        {!imageError ? (
          <img
            ref={imgRef}
            src={currentImgSrc}
            alt={pokemon.displayName}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            width={180}
            height={180}
            onLoad={onLoad}
            onError={onError}
            className={cn(
              'relative z-10 h-36 w-36 object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        ) : (
          /* Graceful Fallback if image fails to load */
          <div className="flex flex-col items-center justify-center text-center p-3 z-10">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center mb-2 shadow-inner"
              style={{ backgroundColor: `${typeStyle.bgHex}25` }}
            >
              <span className="text-sm font-bold font-mono" style={{ color: typeStyle.bgHex }}>
                #{pokemon.id}
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">Artwork unavailable</span>
          </div>
        )}
      </div>

      {/* Identity & Type Badges */}
      <div className="mt-2 space-y-2">
        <h3
          className="text-base sm:text-lg font-bold tracking-tight text-foreground capitalize truncate group-hover:text-primary transition-colors"
          title={pokemon.displayName}
        >
          {pokemon.displayName}
        </h3>

        <div className="flex flex-wrap gap-1.5" aria-label="Elemental types">
          {pokemon.types.map((type) => (
            <Badge key={type} pokemonType={type} size="sm" />
          ))}
        </div>
      </div>

      {/* Bottom Physical & Combat Stat Preview */}
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{formatHeight(pokemon.height)}</span>
          <span className="text-border">·</span>
          <span>{formatWeight(pokemon.weight)}</span>
        </div>

        {/* Key combat stats */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span
            className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400"
            title="Attack stat"
          >
            <Zap className="h-3 w-3" />
            {pokemon.stats.find((s) => s.name === 'attack')?.base_stat ?? '-'}
          </span>
          <span
            className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400"
            title="Defense stat"
          >
            <Shield className="h-3 w-3" />
            {pokemon.stats.find((s) => s.name === 'defense')?.base_stat ?? '-'}
          </span>
        </div>
      </div>
    </Link>
  );
});
