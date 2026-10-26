import { PokeApiPokemonAbility } from '@/types/pokeapi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAbilityDetail } from '@/services/pokeapi/queries';
import { formatPokemonName } from '@/services/pokeapi/utils';
import { cn } from '@/lib/utils';
import { Sparkles, EyeOff, ShieldCheck } from 'lucide-react';

interface AbilityCardProps {
  item: PokeApiPokemonAbility;
}

function AbilityCard({ item }: AbilityCardProps) {
  const { data: abilityData, isLoading } = useAbilityDetail(item.ability.name);

  // Extract English description
  const description =
    abilityData?.effect_entries.find((e) => e.language.name === 'en')?.short_effect ||
    abilityData?.effect_entries.find((e) => e.language.name === 'en')?.effect ||
    abilityData?.flavor_text_entries.find((f) => f.language.name === 'en')?.flavor_text;

  const cleanedDescription = description
    ? description.replace(/[\f\n\r]/g, ' ').replace(/\s+/g, ' ').trim()
    : 'Ability description unavailable.';

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-2.5 transition-all hover:border-border">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {item.is_hidden ? (
            <EyeOff className="h-4 w-4 text-purple-500 shrink-0" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
          )}
          <h4 className="font-bold text-sm sm:text-base text-foreground capitalize">
            {formatPokemonName(item.ability.name)}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          {item.is_hidden ? (
            <Badge
              variant="outline"
              size="sm"
              className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800"
            >
              Hidden Ability
            </Badge>
          ) : (
            <Badge variant="outline" size="sm" className="text-muted-foreground">
              Slot {item.slot}
            </Badge>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      ) : (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {cleanedDescription}
        </p>
      )}
    </div>
  );
}

export interface PokemonAbilitiesProps {
  abilities: PokeApiPokemonAbility[];
  className?: string;
}

export function PokemonAbilities({ abilities, className }: PokemonAbilitiesProps) {
  if (!abilities || abilities.length === 0) {
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg font-bold">Abilities</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list" aria-label="Pokémon Abilities">
          {abilities.map((item) => (
            <AbilityCard key={item.ability.name} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
