import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePokemonDetail, usePokemonType } from '@/services/pokeapi/queries';
import {
  ALL_POKEMON_TYPES,
  calculateMatchupSummary,
  isValidPokemonType,
  TypeEffectivenessResult,
  TypeMatchupSummary,
} from '@/services/pokeapi/typeEffectiveness';
import { PokemonTypeName } from '@/styles/typeColors';

export type CalculatorMode = 'manual' | 'pokemon';

export interface UseTypeCalculatorReturn {
  mode: CalculatorMode;
  setMode: (mode: CalculatorMode) => void;
  defender1: PokemonTypeName;
  setDefender1: (type: PokemonTypeName) => void;
  defender2: PokemonTypeName | '';
  setDefender2: (type: PokemonTypeName | '') => void;
  attacker: PokemonTypeName | 'all';
  setAttacker: (type: PokemonTypeName | 'all') => void;
  pokemonQuery: string;
  setPokemonQuery: (query: string) => void;
  selectedPokemonName: string;
  selectPokemon: (idOrName: string) => void;
  clearDefender2: () => void;
  swapDefenders: () => void;
  resetCalculator: () => void;
  summary: TypeMatchupSummary | null;
  attackerMatchup: TypeEffectivenessResult | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  selectedPokemon: ReturnType<typeof usePokemonDetail>['data'];
  isPokemonLoading: boolean;
  pokemonError: unknown;
  validationWarning: string | null;
}

export function useTypeCalculator(): UseTypeCalculatorReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Read URL Parameters
  const urlMode = searchParams.get('mode') === 'pokemon' ? 'pokemon' : 'manual';
  const urlD1 = searchParams.get('defender1');
  const urlD2 = searchParams.get('defender2');
  const urlAttacker = searchParams.get('attacker');
  const urlPokemon = searchParams.get('pokemon') || '';

  const initialD1: PokemonTypeName = isValidPokemonType(urlD1) ? urlD1 : 'normal';
  const initialD2: PokemonTypeName | '' = isValidPokemonType(urlD2) && urlD2 !== initialD1 ? urlD2 : '';
  const initialAttacker: PokemonTypeName | 'all' = isValidPokemonType(urlAttacker) ? urlAttacker : 'all';

  const [mode, setModeState] = useState<CalculatorMode>(urlPokemon ? 'pokemon' : urlMode);
  const [defender1, setDefender1State] = useState<PokemonTypeName>(initialD1);
  const [defender2, setDefender2State] = useState<PokemonTypeName | ''>(initialD2);
  const [attacker, setAttackerState] = useState<PokemonTypeName | 'all'>(initialAttacker);
  const [pokemonInput, setPokemonInput] = useState(urlPokemon);
  const [activePokemonLookup, setActivePokemonLookup] = useState(urlPokemon);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Sync state if URL changes externally
  useEffect(() => {
    if (isValidPokemonType(urlD1) && urlD1 !== defender1) {
      setDefender1State(urlD1);
    }
    if (urlD2 !== null) {
      if (isValidPokemonType(urlD2) && urlD2 !== defender1) {
        setDefender2State(urlD2);
      } else if (urlD2 === '') {
        setDefender2State('');
      }
    }
    if (urlAttacker) {
      if (isValidPokemonType(urlAttacker) || urlAttacker === 'all') {
        setAttackerState(urlAttacker as PokemonTypeName | 'all');
      }
    }
    if (urlPokemon && urlPokemon !== activePokemonLookup) {
      setActivePokemonLookup(urlPokemon);
      setPokemonInput(urlPokemon);
      setModeState('pokemon');
    }
  }, [urlD1, urlD2, urlAttacker, urlPokemon, defender1, activePokemonLookup]);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (
      newMode: CalculatorMode,
      d1: PokemonTypeName,
      d2: PokemonTypeName | '',
      att: PokemonTypeName | 'all',
      poke: string
    ) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newMode === 'pokemon') {
          next.set('mode', 'pokemon');
        } else {
          next.delete('mode');
        }

        if (d1 !== 'normal') {
          next.set('defender1', d1);
        } else {
          next.delete('defender1');
        }

        if (d2) {
          next.set('defender2', d2);
        } else {
          next.delete('defender2');
        }

        if (att !== 'all') {
          next.set('attacker', att);
        } else {
          next.delete('attacker');
        }

        if (poke) {
          next.set('pokemon', poke);
        } else {
          next.delete('pokemon');
        }

        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  // 2. Fetch Pokémon details for Mode B or when URL has pokemon
  const pokemonDetailQuery = usePokemonDetail(activePokemonLookup, {
    enabled: Boolean(activePokemonLookup.trim()),
  });

  // When Pokémon data resolves, automatically set its defender types
  useEffect(() => {
    if (pokemonDetailQuery.data && pokemonDetailQuery.data.types.length > 0) {
      const types = pokemonDetailQuery.data.types;
      const type1 = types[0]?.type?.name?.toLowerCase() as PokemonTypeName;
      const type2 = types[1]?.type?.name ? (types[1].type.name.toLowerCase() as PokemonTypeName) : '';

      if (isValidPokemonType(type1)) {
        setDefender1State(type1);
        const validD2 = isValidPokemonType(type2) && type2 !== type1 ? type2 : '';
        setDefender2State(validD2);
        setValidationWarning(null);
        updateUrlParams(mode, type1, validD2, attacker, activePokemonLookup);
      }
    }
  }, [pokemonDetailQuery.data, mode, attacker, activePokemonLookup, updateUrlParams]);

  // 3. TanStack Queries for Defending Types
  const d1Query = usePokemonType(defender1, {
    enabled: Boolean(defender1),
  });

  const hasD2 = Boolean(defender2 && defender2 !== defender1);
  const d2Query = usePokemonType(defender2 as string, {
    enabled: hasD2,
  });

  // 4. Compute Matchup Summary
  const summary: TypeMatchupSummary | null = useMemo(() => {
    if (!d1Query.data) return null;
    if (hasD2 && !d2Query.data) return null;

    try {
      return calculateMatchupSummary(
        d1Query.data,
        hasD2 ? d2Query.data : null,
        ALL_POKEMON_TYPES
      );
    } catch {
      return null;
    }
  }, [d1Query.data, d2Query.data, hasD2]);

  // 5. Attacker Matchup (if specific attacking type selected)
  const attackerMatchup: TypeEffectivenessResult | null = useMemo(() => {
    if (!summary || attacker === 'all') return null;
    return summary.matchups.find((m) => m.attackingType === attacker) ?? null;
  }, [summary, attacker]);

  // Actions
  const setMode = useCallback(
    (newMode: CalculatorMode) => {
      setModeState(newMode);
      setValidationWarning(null);
      updateUrlParams(newMode, defender1, defender2, attacker, activePokemonLookup);
    },
    [defender1, defender2, attacker, activePokemonLookup, updateUrlParams]
  );

  const setDefender1 = useCallback(
    (type: PokemonTypeName) => {
      if (type === defender2) {
        // Swap or clear duplicate
        setValidationWarning(`Primary type changed to ${type}. Cleared duplicate secondary type.`);
        setDefender2State('');
        setDefender1State(type);
        updateUrlParams(mode, type, '', attacker, activePokemonLookup);
      } else {
        setValidationWarning(null);
        setDefender1State(type);
        updateUrlParams(mode, type, defender2, attacker, activePokemonLookup);
      }
    },
    [defender2, mode, attacker, activePokemonLookup, updateUrlParams]
  );

  const setDefender2 = useCallback(
    (type: PokemonTypeName | '') => {
      if (!type) {
        setValidationWarning(null);
        setDefender2State('');
        updateUrlParams(mode, defender1, '', attacker, activePokemonLookup);
        return;
      }

      if (type === defender1) {
        setValidationWarning(`Secondary type cannot be identical to primary type (${type}).`);
        return;
      }

      setValidationWarning(null);
      setDefender2State(type);
      updateUrlParams(mode, defender1, type, attacker, activePokemonLookup);
    },
    [defender1, mode, attacker, activePokemonLookup, updateUrlParams]
  );

  const clearDefender2 = useCallback(() => {
    setValidationWarning(null);
    setDefender2State('');
    updateUrlParams(mode, defender1, '', attacker, activePokemonLookup);
  }, [mode, defender1, attacker, activePokemonLookup, updateUrlParams]);

  const swapDefenders = useCallback(() => {
    if (!defender2) return;
    setValidationWarning(null);
    const prevD1 = defender1;
    const prevD2 = defender2;
    setDefender1State(prevD2);
    setDefender2State(prevD1);
    updateUrlParams(mode, prevD2, prevD1, attacker, activePokemonLookup);
  }, [defender1, defender2, mode, attacker, activePokemonLookup, updateUrlParams]);

  const setAttacker = useCallback(
    (type: PokemonTypeName | 'all') => {
      setAttackerState(type);
      updateUrlParams(mode, defender1, defender2, type, activePokemonLookup);
    },
    [mode, defender1, defender2, activePokemonLookup, updateUrlParams]
  );

  const selectPokemon = useCallback(
    (idOrName: string) => {
      const sanitized = idOrName.trim().toLowerCase();
      if (!sanitized) return;
      setActivePokemonLookup(sanitized);
      setPokemonInput(sanitized);
      setValidationWarning(null);
      updateUrlParams('pokemon', defender1, defender2, attacker, sanitized);
    },
    [defender1, defender2, attacker, updateUrlParams]
  );

  const resetCalculator = useCallback(() => {
    setModeState('manual');
    setDefender1State('normal');
    setDefender2State('');
    setAttackerState('all');
    setPokemonInput('');
    setActivePokemonLookup('');
    setValidationWarning(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const refetch = useCallback(() => {
    d1Query.refetch();
    if (hasD2) d2Query.refetch();
    if (activePokemonLookup) pokemonDetailQuery.refetch();
  }, [d1Query, d2Query, hasD2, activePokemonLookup, pokemonDetailQuery]);

  const isLoading = d1Query.isLoading || (hasD2 && d2Query.isLoading);
  const isError = d1Query.isError || (hasD2 && d2Query.isError);
  const error = d1Query.error || d2Query.error;

  return {
    mode,
    setMode,
    defender1,
    setDefender1,
    defender2,
    setDefender2,
    attacker,
    setAttacker,
    pokemonQuery: pokemonInput,
    setPokemonQuery: setPokemonInput,
    selectedPokemonName: activePokemonLookup,
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
    selectedPokemon: pokemonDetailQuery.data,
    isPokemonLoading: pokemonDetailQuery.isLoading,
    pokemonError: pokemonDetailQuery.error,
    validationWarning,
  };
}
