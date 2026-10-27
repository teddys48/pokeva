import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PokemonErrorState } from '@/features/pokemon/PokemonErrorState';
import {
  useTypeCalculator,
  TypeSelect,
  PokemonSelector,
  AttackerMatchupBanner,
  EffectivenessResults,
} from '@/features/type-calculator';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import {
  RotateCcw,
  ArrowLeftRight,
  Sliders,
  Sparkles,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PokemonTypeName } from '@/styles/typeColors';

export function TypeCalculatorPage() {
  useDocumentTitle('Type Effectiveness Calculator — Pokéva');

  const {
    mode,
    setMode,
    defender1,
    setDefender1,
    defender2,
    setDefender2,
    attacker,
    setAttacker,
    selectPokemon,
    clearDefender2,
    swapDefenders,
    resetCalculator,
    summary,
    attackerMatchup,
    isLoading,
    isError,
    error,
    refetch,
    selectedPokemon,
    isPokemonLoading,
    pokemonError,
    validationWarning,
  } = useTypeCalculator();

  return (
    <PageContainer className="py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Battle Strategy &amp; Analysis</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Type Effectiveness Calculator
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Analyze defensive strengths and vulnerabilities. Calculate incoming damage multipliers,
          weaknesses, resistances, and immunities for single and dual-type combinations.
        </p>
      </div>

      {/* Main Interactive Controls Card */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-border bg-secondary/30 p-1 sm:p-1.5 gap-1.5" role="tablist" aria-label="Calculator Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'manual'}
            onClick={() => setMode('manual')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
              mode === 'manual'
                ? 'bg-card text-foreground shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            <Sliders className="h-4 w-4" aria-hidden="true" />
            <span>Mode A — Manual Type Selector</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'pokemon'}
            onClick={() => setMode('pokemon')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all',
              mode === 'pokemon'
                ? 'bg-card text-foreground shadow-2xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            )}
          >
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Mode B — Select by Pokémon</span>
          </button>
        </div>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Validation Warning Alert */}
          {validationWarning && (
            <div
              className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium animate-fade-in"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{validationWarning}</span>
            </div>
          )}

          {/* Mode Form Content */}
          {mode === 'manual' ? (
            /* Mode A: Manual Selectors */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Primary Defender Type */}
              <div className="md:col-span-5">
                <TypeSelect
                  id="calc-defender-1"
                  label="Primary Defending Type"
                  value={defender1}
                  onChange={(val) => setDefender1(val as PokemonTypeName)}
                  disabledValue={defender2}
                  helperText="Required. The primary elemental type of the defender."
                />
              </div>

              {/* Swap Button (between D1 and D2) */}
              <div className="md:col-span-2 flex items-center justify-center pb-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={swapDefenders}
                  disabled={!defender2}
                  className="w-full md:w-auto h-11 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Swap primary and secondary defending types"
                  title="Swap defending types"
                >
                  <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                  <span className="md:hidden">Swap Types</span>
                </Button>
              </div>

              {/* Secondary Defender Type */}
              <div className="md:col-span-5">
                <TypeSelect
                  id="calc-defender-2"
                  label="Secondary Defending Type"
                  value={defender2}
                  onChange={(val) => setDefender2(val as PokemonTypeName | '')}
                  disabledValue={defender1}
                  allowEmpty
                  emptyLabel="None (Single Type Defender)"
                  helperText="Optional. Select for dual-type calculation."
                />
              </div>
            </div>
          ) : (
            /* Mode B: Pokémon Search */
            <div className="space-y-4">
              <PokemonSelector
                selectedPokemon={selectedPokemon}
                isLoading={isPokemonLoading}
                error={pokemonError}
                onSelect={selectPokemon}
                onClear={resetCalculator}
              />
            </div>
          )}

          {/* Attacking Type Selector & Action Bar */}
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <TypeSelect
                id="calc-attacking-type"
                label="Attacking Type (Filter or Direct Matchup)"
                value={attacker}
                onChange={(val) => setAttacker(val as PokemonTypeName | 'all')}
                allowAll
                allLabel="All Attacking Types (Full Defensive Chart)"
                helperText="Select a specific attack type to analyze the direct multiplier."
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {defender2 && mode === 'manual' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDefender2}
                  className="h-10 text-xs text-muted-foreground hover:text-foreground"
                  aria-label="Clear secondary defending type"
                >
                  Clear 2nd Type
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={resetCalculator}
                className="h-10 px-3.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Reset calculator to defaults"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Direct Attacker Matchup Banner (if single attacking type is selected) */}
      {attackerMatchup && (
        <AttackerMatchupBanner
          attacker={attacker as PokemonTypeName}
          defender1={defender1}
          defender2={defender2 || null}
          matchup={attackerMatchup}
          className="animate-fade-in"
        />
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-6" aria-label="Loading type relations">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="max-w-xl mx-auto py-4">
          <PokemonErrorState
            error={error}
            title="Unable to load type effectiveness data"
            onRetry={refetch}
          />
        </div>
      )}

      {/* Results Matrix */}
      {!isLoading && !isError && summary && (
        <EffectivenessResults
          summary={summary}
          selectedAttacker={attacker}
          onSelectAttacker={(t) => setAttacker(t)}
          className="animate-fade-in"
        />
      )}

      {/* Explanatory Footer / Methodology note */}
      <footer className="rounded-xl border border-border/60 bg-secondary/20 p-4 text-xs text-muted-foreground flex items-start gap-3">
        <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground/80 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          Multipliers are calculated based on official PokéAPI v2 type relations. For dual-type defenders,
          both individual multipliers are multiplied (e.g. 2× and 2× produce 4× double weakness; natural immunity yields 0× regardless of secondary typing).
          Mechanics such as abilities (e.g. Levitate), held items, and weather are battle-dependent and excluded.
        </p>
      </footer>
    </PageContainer>
  );
}
