import React from 'react';
import { TypeEffectivenessResult, TypeMatchupSummary } from '@/services/pokeapi/typeEffectiveness';
import { Badge } from '@/components/ui/badge';
import { PokemonTypeName } from '@/styles/typeColors';
import { cn } from '@/lib/utils';
import { ShieldAlert, ShieldCheck, ShieldOff, Minus, Sparkles } from 'lucide-react';

export interface EffectivenessResultsProps {
  summary: TypeMatchupSummary;
  selectedAttacker?: PokemonTypeName | 'all';
  onSelectAttacker?: (type: PokemonTypeName) => void;
  className?: string;
}

export function EffectivenessResults({
  summary,
  selectedAttacker,
  onSelectAttacker,
  className,
}: EffectivenessResultsProps) {
  return (
    <div className={cn('space-y-6', className)} aria-label="Type Effectiveness Results">
      {/* 1. Weaknesses Section */}
      <MatchupSection
        title="Weaknesses"
        description="Attacking moves that deal super effective damage (> 1×)"
        icon={<ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />}
        count={summary.weaknesses.length}
        items={summary.weaknesses}
        emptyMessage="No elemental weaknesses found. This Pokémon takes neutral or reduced damage from all types."
        selectedAttacker={selectedAttacker}
        onSelectAttacker={onSelectAttacker}
        badgeColorVariant="weakness"
      />

      {/* 2. Resistances Section */}
      <MatchupSection
        title="Resistances"
        description="Attacking moves that deal reduced damage (< 1×)"
        icon={<ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />}
        count={summary.resistances.length}
        items={summary.resistances}
        emptyMessage="No elemental resistances found. Takes full damage from standard attacks."
        selectedAttacker={selectedAttacker}
        onSelectAttacker={onSelectAttacker}
        badgeColorVariant="resistance"
      />

      {/* 3. Immunities Section */}
      <MatchupSection
        title="Immunities"
        description="Attacking moves that deal zero damage (0×)"
        icon={<ShieldOff className="h-5 w-5 text-purple-500 shrink-0" />}
        count={summary.immunities.length}
        items={summary.immunities}
        emptyMessage="No natural immunities for this type combination."
        selectedAttacker={selectedAttacker}
        onSelectAttacker={onSelectAttacker}
        badgeColorVariant="immunity"
      />

      {/* 4. Normal Damage Section */}
      <MatchupSection
        title="Normal Damage"
        description="Attacking moves that deal standard neutral damage (1×)"
        icon={<Minus className="h-5 w-5 text-slate-500 shrink-0" />}
        count={summary.normalDamage.length}
        items={summary.normalDamage}
        emptyMessage="No neutral matchups found."
        selectedAttacker={selectedAttacker}
        onSelectAttacker={onSelectAttacker}
        badgeColorVariant="normal"
      />
    </div>
  );
}

interface MatchupSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  items: TypeEffectivenessResult[];
  emptyMessage: string;
  selectedAttacker?: PokemonTypeName | 'all';
  onSelectAttacker?: (type: PokemonTypeName) => void;
  badgeColorVariant: 'weakness' | 'resistance' | 'immunity' | 'normal';
}

function MatchupSection({
  title,
  description,
  icon,
  count,
  items,
  emptyMessage,
  selectedAttacker,
  onSelectAttacker,
  badgeColorVariant,
}: MatchupSectionProps) {
  return (
    <section
      aria-labelledby={`section-heading-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4 transition-all"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          {icon}
          <div>
            <div className="flex items-center gap-2">
              <h3
                id={`section-heading-${title.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-base sm:text-lg font-bold text-foreground"
              >
                {title}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-secondary text-secondary-foreground border border-border">
                {count}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Grid of Matchup Badges */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {items.map((item) => {
            const isSelected = selectedAttacker === item.attackingType;
            return (
              <button
                key={item.attackingType}
                type="button"
                onClick={() => onSelectAttacker?.(item.attackingType)}
                aria-label={`${item.attackingType}: deals ${item.formattedMultiplier} damage, ${title}`}
                className={cn(
                  'group relative flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all text-left',
                  'hover:shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-xs'
                    : 'border-border/70 bg-secondary/30 hover:bg-secondary/60 hover:border-border'
                )}
              >
                <Badge pokemonType={item.attackingType} size="sm" />

                {/* Multiplier Tag */}
                <span
                  className={cn(
                    'font-mono font-bold text-xs px-2 py-0.5 rounded-md border tracking-tight',
                    getMultiplierTagStyle(item.multiplier, badgeColorVariant)
                  )}
                >
                  {item.formattedMultiplier}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-4 px-3 text-center rounded-xl bg-secondary/20 border border-dashed border-border/60">
          <p className="text-xs sm:text-sm text-muted-foreground italic flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground/60" />
            {emptyMessage}
          </p>
        </div>
      )}
    </section>
  );
}

function getMultiplierTagStyle(
  multiplier: number,
  _category: 'weakness' | 'resistance' | 'immunity' | 'normal'
): string {
  if (multiplier === 4) {
    return 'bg-rose-600 text-white border-rose-700 shadow-2xs font-extrabold';
  }
  if (multiplier === 2) {
    return 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30';
  }
  if (multiplier === 0.5) {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
  }
  if (multiplier === 0.25) {
    return 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-extrabold';
  }
  if (multiplier === 0) {
    return 'bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-500/40 font-bold';
  }
  return 'bg-secondary text-secondary-foreground border-border';
}
