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
import { ArrowLeft } from 'lucide-react';

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
