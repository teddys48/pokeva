import { PokemonStat } from '@/types/pokemon';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatStatName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Activity, Shield, Zap, Heart, Wind, Swords } from 'lucide-react';

export interface PokemonBaseStatsProps {
  stats: PokemonStat[];
  className?: string;
}

const STAT_CONFIG: Record<
  PokemonStat['name'],
  { label: string; icon: React.ComponentType<{ className?: string }>; barColor: string }
> = {
  hp: {
    label: 'HP',
    icon: Heart,
    barColor: 'bg-emerald-500',
  },
  attack: {
    label: 'Attack',
    icon: Swords,
    barColor: 'bg-orange-500',
  },
  defense: {
    label: 'Defense',
    icon: Shield,
    barColor: 'bg-amber-500',
  },
  'special-attack': {
    label: 'Sp. Atk',
    icon: Zap,
    barColor: 'bg-blue-500',
  },
  'special-defense': {
    label: 'Sp. Def',
    icon: Shield,
    barColor: 'bg-indigo-500',
  },
  speed: {
    label: 'Speed',
    icon: Wind,
    barColor: 'bg-rose-500',
  },
};

const ORDERED_STAT_KEYS: Array<PokemonStat['name']> = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
];

export function PokemonBaseStats({ stats, className }: PokemonBaseStatsProps) {
  // Map stats by name for deterministic lookup
  const statsMap = new Map<string, number>();
  let totalStat = 0;

  for (const s of stats) {
    statsMap.set(s.name, s.base_stat);
    totalStat += s.base_stat;
  }

  // Maximum theoretical base stat for progress scaling in Pokémon is 255 (Blissey HP)
  const MAX_BASE_STAT = 255;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg font-bold">Base Stats</CardTitle>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg border border-border/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-foreground">
              {totalStat}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        <div className="space-y-3.5" role="region" aria-label="Base Stats Visual Breakdown">
          {ORDERED_STAT_KEYS.map((statKey) => {
            const baseStat = statsMap.get(statKey) ?? 0;
            const config = STAT_CONFIG[statKey];
            const Icon = config.icon;
            const percentage = Math.min(100, Math.max(0, Math.round((baseStat / MAX_BASE_STAT) * 100)));

            return (
              <div key={statKey} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 w-28">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="font-medium text-foreground">{formatStatName(statKey)}</span>
                  </div>

                  <span className="font-mono font-bold text-foreground w-12 text-right">
                    {baseStat}
                  </span>
                </div>

                {/* Progress bar container */}
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60"
                  role="progressbar"
                  aria-valuenow={baseStat}
                  aria-valuemin={0}
                  aria-valuemax={MAX_BASE_STAT}
                  aria-label={`${formatStatName(statKey)}: ${baseStat} out of ${MAX_BASE_STAT}`}
                >
                  <div
                    className={cn('h-full rounded-full transition-all duration-500 ease-out', config.barColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-muted-foreground/80 pt-2 border-t border-border/40 leading-relaxed">
          Base stats represent species-wide potential across attributes and are independent of individual EVs, IVs, or level.
        </p>
      </CardContent>
    </Card>
  );
}
