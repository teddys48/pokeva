import { useState } from 'react';
import { PokeApiPokemonMove } from '@/types/pokeapi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMoveDetail } from '@/services/pokeapi/queries';
import {
  processPokemonMoves,
  filterAndSortMoves,
  MoveLearnCategory,
  ProcessedPokemonMove,
} from './moveUtils';
import { cn } from '@/lib/utils';
import { PokemonTypeName } from '@/styles/typeColors';
import {
  Swords,
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldAlert,
  Flame,
  Layers,
} from 'lucide-react';

interface MoveDetailRowProps {
  move: ProcessedPokemonMove;
}

function MoveDetailRow({ move }: MoveDetailRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: moveDetail, isLoading } = useMoveDetail(move.name, {
    enabled: isExpanded,
  });

  const englishEffect =
    moveDetail?.effect_entries?.find((e) => e.language.name === 'en')?.short_effect ||
    moveDetail?.flavor_text_entries?.find((f) => f.language.name === 'en')?.flavor_text;

  const cleanedEffect = englishEffect
    ? englishEffect.replace(/[\f\n\r]/g, ' ').replace(/\s+/g, ' ').trim()
    : 'No detailed description available.';

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden transition-all hover:border-border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between p-3 sm:p-3.5 text-left cursor-pointer hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="font-bold text-xs sm:text-sm text-foreground truncate">
            {move.displayName}
          </span>

          {move.levelLearnedAt !== null ? (
            <Badge
              variant="outline"
              size="sm"
              className="text-[10px] font-mono px-2 py-0.5 shrink-0 bg-primary/10 text-primary border-primary/20"
            >
              Lv. {move.levelLearnedAt}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              size="sm"
              className="text-[10px] capitalize px-2 py-0.5 shrink-0 text-muted-foreground"
            >
              {move.primaryMethod}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {isExpanded ? 'Hide info' : 'View info'}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
      </button>

      {/* On-demand expanded details */}
      {isExpanded && (
        <div className="border-t border-border/50 bg-muted/20 p-3 sm:p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-full rounded-md" />
            </div>
          ) : moveDetail ? (
            <div className="space-y-2.5">
              {/* Type, Damage Class, Power, Accuracy, PP */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {moveDetail.type?.name && (
                  <Badge
                    pokemonType={moveDetail.type.name.toLowerCase() as PokemonTypeName}
                    size="sm"
                  />
                )}

                {moveDetail.damage_class?.name && (
                  <Badge variant="outline" size="sm" className="capitalize gap-1">
                    {moveDetail.damage_class.name === 'physical' && (
                      <Swords className="h-3 w-3 text-orange-500" aria-hidden="true" />
                    )}
                    {moveDetail.damage_class.name === 'special' && (
                      <Zap className="h-3 w-3 text-blue-500" aria-hidden="true" />
                    )}
                    {moveDetail.damage_class.name === 'status' && (
                      <ShieldAlert className="h-3 w-3 text-emerald-500" aria-hidden="true" />
                    )}
                    <span>{moveDetail.damage_class.name}</span>
                  </Badge>
                )}

                <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                  <span>
                    Power: <strong className="text-foreground">{moveDetail.power ?? '—'}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Acc: <strong className="text-foreground">{moveDetail.accuracy != null ? `${moveDetail.accuracy}%` : '—'}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    PP: <strong className="text-foreground">{moveDetail.pp ?? '—'}</strong>
                  </span>
                </div>
              </div>

              {/* Move Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cleanedEffect}
              </p>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Unable to load move details at this time.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export interface PokemonMovesProps {
  moves?: PokeApiPokemonMove[] | null;
  className?: string;
}

const PAGE_SIZE = 12;

export function PokemonMoves({ moves, className }: PokemonMovesProps) {
  const [activeCategory, setActiveCategory] = useState<MoveLearnCategory>('level-up');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const processedMoves = processPokemonMoves(moves);
  const filteredMoves = filterAndSortMoves(processedMoves, activeCategory, searchQuery);
  const displayedMoves = filteredMoves.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMoves.length;

  const countForCategory = (cat: MoveLearnCategory) => {
    if (cat === 'all') return processedMoves.length;
    return processedMoves.filter((m) => m.methods.includes(cat)).length;
  };

  const handleTabChange = (cat: MoveLearnCategory) => {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg font-bold">Moves</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">
              ({processedMoves.length} total)
            </span>
          </div>

          {/* Quick move search input */}
          <div className="w-full sm:w-60">
            <Input
              type="search"
              placeholder="Filter moves..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              icon={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Learn Method Tabs */}
        <div
          role="tablist"
          aria-label="Move learn methods"
          className="flex flex-wrap items-center gap-1.5 pt-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'level-up'}
            onClick={() => handleTabChange('level-up')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'level-up'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Flame className="h-3 w-3" aria-hidden="true" />
            <span>Level Up</span>
            <span className="font-mono text-[10px] opacity-80">({countForCategory('level-up')})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'machine'}
            onClick={() => handleTabChange('machine')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'machine'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Layers className="h-3 w-3" aria-hidden="true" />
            <span>Machine (TM)</span>
            <span className="font-mono text-[10px] opacity-80">({countForCategory('machine')})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'egg'}
            onClick={() => handleTabChange('egg')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'egg'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>Egg</span>
            <span className="font-mono text-[10px] opacity-80">({countForCategory('egg')})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'tutor'}
            onClick={() => handleTabChange('tutor')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'tutor'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>Tutor</span>
            <span className="font-mono text-[10px] opacity-80">({countForCategory('tutor')})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'all'}
            onClick={() => handleTabChange('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer',
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground shadow-2xs'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <span>All Moves</span>
            <span className="font-mono text-[10px] opacity-80">({countForCategory('all')})</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {filteredMoves.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No moves found matching the selected filter.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {displayedMoves.map((m) => (
                <MoveDetailRow key={`${m.name}-${m.primaryMethod}`} move={m} />
              ))}
            </div>

            {hasMore && (
              <div className="pt-3 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="text-xs"
                >
                  Show More Moves ({filteredMoves.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
