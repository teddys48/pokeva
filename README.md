# Pokéva — Modern Pokémon Explorer

Pokéva is a modern, editorial Pokémon Explorer web application powered by React, Vite, TypeScript, Tailwind CSS, and TanStack Query.

## Phase Overview

- **Phase 1 (Completed):** Frontend foundation, WCAG AA design system, application shell, responsive layout, dark/light themes, and curated mock data preview.
- **Phase 2 (Completed):** Reusable PokéAPI v2 data-access layer, typed models, centralized HTTP client, custom error hierarchy, TanStack Query query options and hooks, retry and cache management, and data mappers.
- **Phase 3 (Completed):** Live Pokédex catalogue listing, pagination/infinite scroll, real-time live search, filter pills, loading skeletons, and error boundaries.
- **Phase 4 (Completed):** Complete Pokémon detail pages, Hero showcase, interactive Base Stats progress visualizations with total calculation, Physical and Species characteristics with accurate gender ratios and breeding data, human-readable abilities with on-demand descriptions, responsive branching Evolution Chain explorer, and categorized Moves browser with on-demand move detail fetching.
- **Phase 5 (Completed):** Favorites & Personal Collection: lightweight versioned localStorage persistence, reactive state management via React Context, cross-tab synchronization, reusable `FavoriteButton` with full accessibility, visible focus rings, and click-propagation isolation across catalogue cards and hero detail pages, and dedicated `/favorites` page featuring predictable ordering, search filtering, empty states, and recoverable API resilience.
- **Phase 6 (Next):** Type Effectiveness Calculator and Battle/Team Planner.

### Architecture & Tech Stack

- **Framework:** React 19 with Vite 6
- **Language:** TypeScript 5.7+ (strict mode enabled, zero `any`)
- **Package Manager:** Bun
- **Styling & Design System:** Tailwind CSS v3.4 + semantic CSS variables for Light and Dark themes
- **Icons:** Lucide React
- **Routing:** React Router v7 (`/` catalogue listing, `/pokemon/:idOrName` detail page, `/favorites` collection, `/about`)
- **Server-State Management:** Centralized `@tanstack/react-query` v5 (`queryOptions`, custom query hooks, tuned cache retention, independent non-blocking secondary resources)
- **Client-State Management:** React Context + lightweight versioned localStorage persistence (`pokeva_favorites_v1`) with cross-tab `storage` synchronization
- **API Client:** Lightweight fetch client with structured `PokeApiError`, AbortSignal support, input sanitization, and URL building
- **Testing:** Native `bun test` runner for fast, mock-driven unit testing

### Project Structure

```text
pokeva/
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root application component with providers
│   │   ├── error-boundary.tsx  # Resilient application Error Boundary
│   │   ├── router.tsx          # React Router v7 configuration (/pokemon/:idOrName, /favorites)
│   │   ├── theme-context.ts    # Theme context and useTheme hook
│   │   └── theme-provider.tsx  # Theme provider with localStorage persistence
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Footer.tsx      # Application footer with brand & legal disclaimers
│   │   │   ├── Header.tsx      # Navigation, logo, theme toggle & mobile menu with favorites badge
│   │   │   ├── PageContainer.tsx # Responsive layout boundary container
│   │   │   ├── RootLayout.tsx  # Shell layout with header, outlet, and footer
│   │   │   └── ThemeToggle.tsx # Accessible light/dark toggle button
│   │   └── ui/
│   │       ├── badge.tsx       # Reusable badge with Pokémon type variant support
│   │       ├── button.tsx      # Tactile, accessible button with variant matrix
│   │       ├── card.tsx        # Structured card container primitives
│   │       ├── input.tsx       # Accessible input with clear button and icon slots
│   │       └── skeleton.tsx    # Content-shaped loading skeleton
│   ├── features/
│   │   ├── favorites/
│   │   │   ├── favoritesStorage.ts # Versioned localStorage serialization & validation
│   │   │   ├── favorites-context.ts # React Context contract
│   │   │   ├── FavoritesContext.tsx # Context Provider with cross-tab synchronization
│   │   │   ├── useFavorites.ts     # Consumer hook for favorites state
│   │   │   ├── FavoriteButton.tsx  # Accessible heart toggle with click-isolation
│   │   │   ├── FavoritesEmptyState.tsx # Zero-state banner linking to Pokédex
│   │   │   ├── index.ts            # Clean barrel export
│   │   │   └── __tests__/          # Storage, state, button & page test suites
│   │   └── pokemon/
│   │       ├── detail/
│   │       │   ├── PokemonHero.tsx          # Hero artwork, type badges, prev/next & favorite toggle
│   │       │   ├── PokemonBaseStats.tsx     # Base stats meters, accessible progressbars, total sum
│   │       │   ├── PokemonSpeciesInfo.tsx   # Physical traits, gender ratios, breeding & training
│   │       │   ├── PokemonAbilities.tsx     # Abilities, hidden ability tagging, English descriptions
│   │       │   ├── PokemonEvolutionChain.tsx # Recursive branching evolution explorer & conditions
│   │       │   ├── PokemonMoves.tsx         # Categorized moves browser with on-demand detail
│   │       │   ├── PokemonDetailSkeleton.tsx # Layout-matched loading skeleton
│   │       │   └── moveUtils.ts             # Move grouping, level-up sorting & search filters
│   │       ├── PokemonCard.tsx              # Card with artwork, badges, stats, and favorite button
│   │       ├── PokemonEmptyState.tsx        # Zero-state with reset trigger
│   │       ├── PokemonErrorState.tsx        # Recoverable error state with retry
│   │       ├── PokemonGrid.tsx              # Responsive multi-column grid
│   │       ├── PokemonPagination.tsx        # Accessible page navigation controls
│   │       ├── PokemonSearchPreview.tsx     # Search input & elemental type filter pills
│   │       ├── usePokedexListing.ts         # Centralized listing orchestrator hook
│   │       ├── mockPokemon.ts               # Curated 12-species mock dataset
│   │       └── __tests__/                   # Dataset, listing, and detail test suites
│   ├── lib/
│   │   ├── queryClient.ts      # Centralized TanStack Query client configuration
│   │   ├── utils.ts            # Formatting helpers & Tailwind class merger (cn)
│   │   └── __tests__/          # Unit tests for utilities & design tokens
│   ├── pages/
│   │   ├── AboutPage.tsx       # Design tokens & roadmap documentation page
│   │   ├── FavoritesPage.tsx   # Curated collection page with sort & search
│   │   ├── HomePage.tsx        # Live Pokédex catalogue with search & filters
│   │   ├── NotFoundPage.tsx    # Resilient 404 page
│   │   └── PokemonDetailPage.tsx # Comprehensive Pokémon detail explorer
│   ├── services/
│   │   └── pokeapi/
│   │       ├── client.ts       # Centralized PokeApiClient & PokeApiError class
│   │       ├── pokemonService.ts # Typed service layer for all PokéAPI endpoints
│   │       ├── queries.ts      # TanStack Query keys factory, queryOptions, and hooks
│   │       ├── utils.ts        # Pagination validators, ID extractors, artwork resolvers
│   │       ├── mappers.ts      # Domain mapping from raw PokéAPI to UI models
│   │       ├── evolution.ts    # Recursive evolution tree parser and condition formatter
│   │       ├── index.ts        # Clean barrel export
│   │       └── __tests__/      # Automated test suites for all data layer components
│   ├── styles/
│   │   ├── globals.css         # Semantic HSL CSS variables & reduced-motion rules
│   │   └── typeColors.ts       # 18 official Pokémon type contrast tokens
│   ├── types/
│   │   ├── favorites.ts        # Minimal, versioned favorites schemas
│   │   ├── pokemon.ts          # Core domain models and filter state types
│   │   └── pokeapi.ts          # Official PokéAPI v2 response and resource interfaces
│   ├── main.tsx                # Application bootstrap
│   └── vite-env.d.ts           # Vite client environment types
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── eslint.config.js
```

### PokéAPI v2 Endpoints Supported

- `GET /pokemon?limit={limit}&offset={offset}` — paginated Pokémon resource listing.
- `GET /pokemon/{id-or-name}` — individual Pokémon details (stats, types, sprites, abilities, moves).
- `GET /pokemon-species/{id-or-name}` — species data (flavor text, genera, evolution chain link, breeding).
- `GET /type/{id-or-name}` — type resource (damage relations, Pokémon list).
- `GET /evolution-chain/{id}` — evolution chain data (branching triggers, evolutions).
- `GET /ability/{id-or-name}` — ability resource (flavor text, localized effect entries).
- `GET /move/{id-or-name}` — move resource (power, accuracy, PP, damage class, effect entries).

### Getting Started

```bash
# Install dependencies
bun install

# Start local development server
bun run dev

# Run TypeScript type check
bun run typecheck

# Run ESLint
bun run lint

# Run automated tests
bun test

# Production build
bun run build

# Preview production build
bun run preview
```
