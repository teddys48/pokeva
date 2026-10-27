import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TypeEffectivenessResult } from '@/services/pokeapi/typeEffectiveness';
import { PokemonTypeName } from '@/styles/typeColors';
import { cn } from '@/lib/utils';
import { Zap, ShieldCheck, ShieldAlert, ShieldOff, Minus, ArrowRight } from 'lucide-react';

export interface AttackerMatchupBannerProps {
  attacker: PokemonTypeName;
  defender1: PokemonTypeName;
  defender2?: PokemonTypeName | null;
  matchup: TypeEffectivenessResult;
  className?: string;
}

export function AttackerMatchupBanner({
  attacker,
  defender1,
  defender2,
  matchup,
  className,
}: AttackerMatchupBannerProps) {
  // Determine badge color and icon based on multiplier
  const { label, icon, badgeClasses, description } = getMatchupPresentation(
    matchup.multiplier,
    defender1,
    defender2
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs transition-all',
        matchup.multiplier > 1 && 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/15',
        matchup.multiplier > 0 && matchup.multiplier < 1 && 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/15',
        matchup.multiplier === 0 && 'border-purple-500/40 bg-purple-500/5 dark:bg-purple-950/15',
        matchup.multiplier === 1 && 'border-border bg-card/70',
        className
      )}
      role="region"
      aria-label="Direct Matchup Analysis"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Attacker -> Defender Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Attacker:
            </span>
            <Badge pokemonType={attacker} size="md" />
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Defender:
            </span>
            <div className="flex items-center gap-1.5">
              <Badge pokemonType={defender1} size="md" />
              {defender2 && (
                <>
                  <span className="text-xs text-muted-foreground">+</span>
                  <Badge pokemonType={defender2} size="md" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Multiplier Verdict Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-extrabold tracking-tight shadow-2xs',
              badgeClasses
            )}
          >
            {icon}
            <span className="font-mono text-base">{matchup.formattedMultiplier}</span>
            <span className="border-l border-current/20 pl-2">{label}</span>
          </div>
        </div>
      </div>

      {/* Explanatory text */}
      <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function getMatchupPresentation(
  multiplier: number,
  d1: string,
  d2?: string | null
): {
  label: string;
  icon: React.ReactNode;
  badgeClasses: string;
  description: string;
} {
  const dLabel = d2 ? `${d1} / ${d2}` : d1;

  if (multiplier === 4) {
    return {
      label: 'Double Super Effective',
      icon: <Zap className="h-4 w-4 fill-rose-500 text-rose-500" />,
      badgeClasses: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
      description: `Takes 4× quadruple damage! Both ${d1} and ${d2} are weak to this attacking type, dealing overwhelming damage.`,
    };
  }

  if (multiplier === 2) {
    return {
      label: 'Super Effective',
      icon: <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
      badgeClasses: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
      description: `Takes 2× double damage! This attack exploits a defensive weakness against ${dLabel}.`,
    };
  }

  if (multiplier === 0.5) {
    return {
      label: 'Not Very Effective',
      icon: <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      badgeClasses: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      description: `Takes ½× half damage. ${dLabel} resists this attack, taking reduced damage.`,
    };
  }

  if (multiplier === 0.25) {
    return {
      label: 'Double Resistance',
      icon: <ShieldCheck className="h-4 w-4 fill-emerald-500 text-emerald-600" />,
      badgeClasses: 'bg-emerald-600/20 text-emerald-800 dark:text-emerald-200 border-emerald-600/40',
      description: `Takes ¼× quarter damage! Both ${d1} and ${d2} resist this attack, minimizing incoming damage.`,
    };
  }

  if (multiplier === 0) {
    return {
      label: 'Immune',
      icon: <ShieldOff className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      badgeClasses: 'bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-500/40',
      description: `Takes 0× zero damage. ${dLabel} is completely immune to this attacking move; damage is completely negated.`,
    };
  }

  return {
    label: 'Normal Damage',
    icon: <Minus className="h-4 w-4 text-slate-500" />,
    badgeClasses: 'bg-secondary text-secondary-foreground border-border',
    description: `Takes 1× normal damage. This attack deals neutral damage to ${dLabel}.`,
  };
}
