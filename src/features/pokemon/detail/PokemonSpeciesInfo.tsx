import { Pokemon } from '@/types/pokemon';
import { PokeApiSpecies } from '@/types/pokeapi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatHeight, formatWeight } from '@/lib/utils';
import { formatPokemonName } from '@/services/pokeapi/utils';
import { cn } from '@/lib/utils';
import {
  Ruler,
  Weight,
  Sparkles,
  Egg,
  Heart,
  Target,
  Compass,
  Smile,
  Layers,
} from 'lucide-react';

export interface PokemonSpeciesInfoProps {
  pokemon: Pokemon;
  species?: PokeApiSpecies | null;
  className?: string;
}

export function PokemonSpeciesInfo({
  pokemon,
  species,
  className,
}: PokemonSpeciesInfoProps) {
  // Gender Ratio calculation
  const formatGenderRatio = () => {
    if (!species || species.gender_rate === undefined) return 'Unavailable';
    if (species.gender_rate === -1) return 'Genderless';

    const femalePct = ((species.gender_rate / 8) * 100).toFixed(1);
    const malePct = (((8 - species.gender_rate) / 8) * 100).toFixed(1);
    return `♂ ${malePct}% • ♀ ${femalePct}%`;
  };

  // Egg groups
  const eggGroups =
    species?.egg_groups && species.egg_groups.length > 0
      ? species.egg_groups.map((g) => formatPokemonName(g.name)).join(', ')
      : 'None';

  // Hatch cycles
  const hatchText =
    species?.hatch_counter != null
      ? `${species.hatch_counter} cycles (~${species.hatch_counter * 256} steps)`
      : 'Unavailable';

  // Growth rate
  const growthRateText = species?.growth_rate?.name
    ? formatPokemonName(species.growth_rate.name)
    : 'Unavailable';

  // Base XP
  const baseExpText =
    pokemon.base_experience != null
      ? `${pokemon.base_experience} XP`
      : 'Unavailable';

  // Base Happiness/Friendship
  const baseFriendshipText =
    species?.base_happiness != null
      ? `${species.base_happiness} / 255`
      : 'Unavailable';

  // Capture rate
  const captureRateText =
    species?.capture_rate != null
      ? `${species.capture_rate} / 255`
      : 'Unavailable';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg font-bold">Physical & Species Data</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Physical Characteristics Grid */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Physical Characteristics
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Height */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Height</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-semibold text-foreground">
                {formatHeight(pokemon.height)}
              </div>
            </div>

            {/* Weight */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Weight className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Weight</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-semibold text-foreground">
                {formatWeight(pokemon.weight)}
              </div>
            </div>

            {/* Base XP */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Base Yield</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-semibold text-foreground">
                {baseExpText}
              </div>
            </div>

            {/* Growth Rate */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Growth Rate</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {growthRateText}
              </div>
            </div>
          </div>
        </div>

        {/* Breeding & Training Grid */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Breeding & Training
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Gender Ratio */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
                <span>Gender Ratio</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                {formatGenderRatio()}
              </div>
            </div>

            {/* Egg Groups */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Egg className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                <span>Egg Groups</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {eggGroups}
              </div>
            </div>

            {/* Hatch Cycles */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Egg className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                <span>Hatch Steps</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {hatchText}
              </div>
            </div>

            {/* Base Friendship */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Smile className="h-3.5 w-3.5 text-blue-500" aria-hidden="true" />
                <span>Base Friendship</span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-foreground">
                {baseFriendshipText}
              </div>
            </div>

            {/* Capture Rate */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Target className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                <span>Capture Rate</span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-foreground">
                {captureRateText}
              </div>
            </div>

            {/* Habitat / Color */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Habitat / Color</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {species?.habitat?.name ? formatPokemonName(species.habitat.name) : 'Various'}
                {species?.color?.name ? ` (${formatPokemonName(species.color.name)})` : ''}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
