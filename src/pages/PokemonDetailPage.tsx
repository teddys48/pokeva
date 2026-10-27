import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { PokemonErrorState } from '@/features/pokemon/PokemonErrorState';
import { PokemonDetailSkeleton } from '@/features/pokemon/detail/PokemonDetailSkeleton';
import { PokemonHero } from '@/features/pokemon/detail/PokemonHero';
import { PokemonBaseStats } from '@/features/pokemon/detail/PokemonBaseStats';
import { PokemonSpeciesInfo } from '@/features/pokemon/detail/PokemonSpeciesInfo';
import { PokemonAbilities } from '@/features/pokemon/detail/PokemonAbilities';
import { PokemonEvolutionChain } from '@/features/pokemon/detail/PokemonEvolutionChain';
import { PokemonMoves } from '@/features/pokemon/detail/PokemonMoves';
import {
  usePokemonDetail,
  usePokemonSpecies,
} from '@/services/pokeapi/queries';
import { mapPokeApiPokemonToPokemon } from '@/services/pokeapi/mappers';
import { isNotFoundError } from '@/services/pokeapi/client';
import { formatPokemonId } from '@/lib/utils';
import { formatPokemonName } from '@/services/pokeapi/utils';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export function PokemonDetailPage() {
  const { idOrName = '' } = useParams<{ idOrName: string }>();

  // Fetch core Pokémon detail
  const {
    data: apiPokemon,
    isLoading: isPokemonLoading,
    isError: isPokemonError,
    error: pokemonError,
    refetch: refetchPokemon,
  } = usePokemonDetail(idOrName);

  // Dynamic document title based on fetch status and Pokémon metadata
  const documentTitle = apiPokemon
    ? `${formatPokemonName(apiPokemon.name)} (#${formatPokemonId(apiPokemon.id)}) — Pokéva`
    : isPokemonError
    ? `Pokémon "${idOrName}" Not Found — Pokéva`
    : `${formatPokemonName(idOrName) || 'Pokémon'} — Pokéva`;

  useDocumentTitle(documentTitle);

  // Smooth scroll to top when navigating across evolution stages or prev/next Pokémon
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [idOrName]);

  // Fetch species info (dependent on Pokémon data or identifier)
  const speciesIdentifier = apiPokemon?.species?.name || idOrName;
  const {
    data: speciesData,
  } = usePokemonSpecies(speciesIdentifier, {
    enabled: Boolean(apiPokemon),
  });

  // Handle Loading State
  if (isPokemonLoading) {
    return (
      <PageContainer className="py-8 sm:py-10">
        <PokemonDetailSkeleton />
      </PageContainer>
    );
  }

  // Handle Primary Error State (Not Found, Network error, etc.)
  if (isPokemonError || !apiPokemon) {
    const isNotFound = isNotFoundError(pokemonError);
    const title = isNotFound
      ? `Pokémon "${idOrName}" Not Found`
      : 'Failed to load Pokémon details';

    return (
      <PageContainer className="py-12 sm:py-16">
        <div className="max-w-xl mx-auto space-y-6">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Pokédex</span>
            </Button>
          </Link>

          <PokemonErrorState
            error={pokemonError}
            title={title}
            onRetry={() => refetchPokemon()}
          />
        </div>
      </PageContainer>
    );
  }

  // Normalize into application domain model
  const domainPokemon = mapPokeApiPokemonToPokemon(apiPokemon, speciesData);
  const d1 = domainPokemon.types[0] || 'normal';
  const d2 = domainPokemon.types[1] || '';
  const calculatorUrl = `/type-calculator?pokemon=${encodeURIComponent(domainPokemon.name)}&defender1=${d1}${
    d2 ? `&defender2=${d2}` : ''
  }`;

  return (
    <PageContainer key={domainPokemon.id} className="py-8 sm:py-10 space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section aria-label="Pokémon Identity">
        <PokemonHero
          key={domainPokemon.id}
          pokemon={domainPokemon}
          species={speciesData}
        />
      </section>

      {/* Type Effectiveness Entry Section */}
      <section aria-label="Type Effectiveness">
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Type Effectiveness Analysis
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Analyze battle vulnerabilities, defensive multipliers, weaknesses, resistances, and immunities for {domainPokemon.displayName}.
            </p>
          </div>

          <Link to={calculatorUrl}>
            <Button className="gap-2 font-semibold shrink-0">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span>Open Type Calculator</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Two Column Grid: Base Stats & Physical/Species Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Base Stats */}
        <section aria-label="Base Stats">
          <PokemonBaseStats stats={domainPokemon.stats} />
        </section>

        {/* Physical & Species Metadata */}
        <section aria-label="Physical & Species Data">
          <PokemonSpeciesInfo
            pokemon={domainPokemon}
            species={speciesData}
          />
        </section>
      </div>

      {/* Abilities Section */}
      <section aria-label="Abilities">
        <PokemonAbilities abilities={apiPokemon.abilities} />
      </section>

      {/* Evolution Chain Explorer */}
      <section aria-label="Evolution Chain">
        <PokemonEvolutionChain
          evolutionChainUrl={speciesData?.evolution_chain?.url}
          currentPokemonId={domainPokemon.id}
          currentPokemonName={domainPokemon.name}
        />
      </section>

      {/* Moves Explorer */}
      <section aria-label="Moves">
        <PokemonMoves moves={apiPokemon.moves} />
      </section>
    </PageContainer>
  );
}
