import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvolutionChain } from '@/services/pokeapi/queries';
import {
  parseEvolutionChain,
  hasEvolutions,
  EvolutionTreeNode,
} from '@/services/pokeapi/evolution';
import { formatPokemonId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { GitFork, ArrowRight, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePokemonImage } from '@/features/pokemon/usePokemonImage';

interface EvolutionCardProps {
  node: EvolutionTreeNode;
  isCurrent: boolean;
}

function EvolutionCard({ node, isCurrent }: EvolutionCardProps) {
  const {
    currentImgSrc,
    isLoaded,
    imageError,
    imgRef,
    onLoad,
    onError,
  } = usePokemonImage({
    primarySrc: node.artworkUrl,
    fallbackSrc: node.spriteUrl,
    identifier: node.speciesId ?? node.speciesName,
  });

  const formattedId = node.speciesId ? formatPokemonId(node.speciesId) : '';

  return (
    <Link
      to={`/pokemon/${node.speciesId ?? node.speciesName}`}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-2xl border p-3.5 sm:p-4 transition-all w-36 sm:w-44 text-center shrink-0',
        isCurrent
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
          : 'border-border/80 bg-card hover:-translate-y-0.5 hover:border-border hover:shadow-md'
      )}
      aria-label={`View ${node.displayName}${formattedId ? `, ${formattedId}` : ''}${isCurrent ? ' (Current Pokémon)' : ''}`}
    >
      {isCurrent && (
        <span className="absolute -top-2.5 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          <span>Current</span>
        </span>
      )}

      {/* Artwork container */}
      <div className="relative my-1 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-xl bg-muted/30 p-2 overflow-hidden border border-border/40">
        {!isLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-muted/40 rounded-xl">
            <Sparkles className="h-5 w-5 text-muted-foreground/30" />
          </div>
        )}

        {!imageError ? (
          <img
            ref={imgRef}
            src={currentImgSrc}
            alt={node.displayName}
            width={96}
            height={96}
            loading="lazy"
            decoding="async"
            onLoad={onLoad}
            onError={onError}
            className={cn(
              'relative z-10 h-20 w-20 sm:h-24 sm:w-24 object-contain transition-transform duration-200 group-hover:scale-105',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-2 z-10">
            <span className="font-mono text-xs font-bold text-muted-foreground">
              {formattedId || '#???'}
            </span>
          </div>
        )}
      </div>

      {/* Meta text */}
      <span className="font-mono text-[11px] font-semibold text-muted-foreground mt-1">
        {formattedId}
      </span>
      <h4 className="text-xs sm:text-sm font-bold text-foreground capitalize truncate max-w-[130px] group-hover:text-primary transition-colors">
        {node.displayName}
      </h4>

      {node.isBaby && (
        <Badge variant="outline" size="sm" className="mt-1 text-[9px] py-0 px-1.5 text-muted-foreground">
          Baby
        </Badge>
      )}
    </Link>
  );
}

interface EvolutionConditionBadgeProps {
  conditions: string[];
}

function EvolutionConditionBadge({ conditions }: EvolutionConditionBadgeProps) {
  const text = conditions.length > 0 ? conditions.join(' or ') : 'Evolves';

  return (
    <div className="flex flex-col md:flex-row items-center gap-1 text-center py-2 md:py-0 shrink-0">
      {/* Mobile Down Arrow */}
      <ArrowDown className="h-4 w-4 text-muted-foreground/60 md:hidden" aria-hidden="true" />

      {/* Condition label pill */}
      <div className="px-2.5 py-1 rounded-full bg-muted/70 border border-border/60 text-[11px] font-medium text-foreground max-w-[180px] sm:max-w-[200px] leading-tight shadow-2xs">
        {text}
      </div>

      {/* Desktop Right Arrow */}
      <ArrowRight className="h-4 w-4 text-muted-foreground/60 hidden md:block" aria-hidden="true" />
    </div>
  );
}

export interface PokemonEvolutionChainProps {
  evolutionChainUrl?: string | null;
  currentPokemonId: number;
  currentPokemonName: string;
}

export function PokemonEvolutionChain({
  evolutionChainUrl,
  currentPokemonId,
  currentPokemonName,
}: PokemonEvolutionChainProps) {
  const { data: rawChain, isLoading, isError } = useEvolutionChain(evolutionChainUrl || '');

  const tree = rawChain?.chain ? parseEvolutionChain(rawChain.chain) : null;
  const isMultiStage = tree ? hasEvolutions(tree) : false;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-6">
            <Skeleton className="h-44 w-36 rounded-2xl" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-44 w-36 rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !tree || !isMultiStage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <GitFork className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>Evolution Chain</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-sm text-muted-foreground">
            {isError ? (
              <p>Unable to load evolution chain data at this time.</p>
            ) : (
              <p>This Pokémon does not evolve.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCurrentMatch = (node: EvolutionTreeNode): boolean => {
    if (node.speciesId && node.speciesId === currentPokemonId) return true;
    return node.speciesName.toLowerCase() === currentPokemonName.toLowerCase();
  };

  const renderEvolutionBranch = (node: EvolutionTreeNode) => {
    return (
      <div key={node.speciesName} className="flex flex-col md:flex-row items-center gap-3">
        <EvolutionCard node={node} isCurrent={isCurrentMatch(node)} />

        {node.evolvesTo.length > 0 && (
          <div className="flex flex-col gap-4 items-center">
            {node.evolvesTo.map((child) => (
              <div
                key={child.speciesName}
                className="flex flex-col md:flex-row items-center gap-3"
              >
                <EvolutionConditionBadge conditions={child.conditions} />
                {renderEvolutionBranch(child)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <GitFork className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Evolution Chain</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-4">
        <div className="min-w-fit flex justify-center py-4">
          {renderEvolutionBranch(tree)}
        </div>
      </CardContent>
    </Card>
  );
}
