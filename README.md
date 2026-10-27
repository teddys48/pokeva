# Pokéva — Modern Pokémon Explorer

Pokéva is a modern, editorial Pokémon Explorer web application powered by React 19, Vite 6, TypeScript, Tailwind CSS, and TanStack Query v5.

## Phase Overview

- **Phase 1 (Completed):** Frontend foundation, WCAG AA design system, application shell, responsive layout, dark/light themes, and curated mock data preview.
- **Phase 2 (Completed):** Reusable PokéAPI v2 data-access layer, typed models, centralized HTTP client, custom error hierarchy, TanStack Query query options and hooks, retry and cache management, and data mappers.
- **Phase 3 (Completed):** Live Pokédex catalogue listing, pagination/infinite scroll, real-time live search, filter pills, loading skeletons, and error boundaries.
- **Phase 4 (Completed):** Complete Pokémon detail pages, Hero showcase, interactive Base Stats progress visualizations with total calculation, Physical and Species characteristics with accurate gender ratios and breeding data, human-readable abilities with on-demand descriptions, responsive branching Evolution Chain explorer, and categorized Moves browser with on-demand move detail fetching.
- **Phase 5 (Completed):** Favorites & Personal Collection: lightweight versioned localStorage persistence, reactive state management via React Context, cross-tab synchronization, reusable `FavoriteButton` with full accessibility, visible focus rings, and click-propagation isolation across catalogue cards and hero detail pages, and dedicated `/favorites` page featuring predictable ordering, search filtering, empty states, and recoverable API resilience.
- **Phase 6 (Completed):** Quality gates, test writing, accessibility audit, and regression sweep.
- **Phase 7 (Completed):** Performance, Production Readiness & Deployment:
  - **Route Code Splitting:** Lazy-loaded page routes (`HomePage`, `PokemonDetailPage`, `FavoritesPage`, `AboutPage`, `NotFoundPage`) reducing initial chunk weight by >50%.
  - **Chunking Strategy:** Dedicated vendor bundles (`vendor-react`, `vendor-router`, `vendor-query`) for optimal long-term CDN and browser caching.
  - **Smart Prefetching:** Intent-based background prefetching of detail and species queries when hovering/focusing Pokémon cards or adjacent hero links.
  - **Rendering Efficiency:** `React.memo` integration on `PokemonCard` eliminating redundant catalogue grid re-renders.
  - **Cache & Query Tuning:** Centralized `gcTime: 2h` and `staleTime: 30-60m` with zero-retry policy for permanent HTTP 404s and client aborts.
  - **SEO & Dynamic Titles:** Automatic tab title synchronization (`useDocumentTitle`), social open graph meta tags, and standalone SVG favicon.
  - **Deployment Ready:** Multi-platform SPA rewrites and security headers for Cloudflare Pages, Netlify (`_redirects`, `_headers`), and Vercel (`vercel.json`), plus comprehensive Nginx/Caddy production guide in `docs/deployment.md`.

### Architecture & Tech Stack

- **Framework:** React 19 with Vite 6
- **Language:** TypeScript 5.7+ (strict mode enabled, zero `any`)
- **Package Manager:** Bun
- **Styling & Design System:** Tailwind CSS v3.4 + semantic CSS variables for Light and Dark themes
- **Icons:** Lucide React
- **Routing:** React Router v7 (`/` catalogue listing, `/pokemon/:idOrName` detail page, `/favorites` collection, `/about`) with route-level lazy loading and suspense boundaries
- **Server-State Management:** Centralized `@tanstack/react-query` v5 (`queryOptions`, custom query hooks, 2-hour cache retention, intent prefetching)
- **Client-State Management:** React Context + lightweight versioned localStorage persistence (`pokeva_favorites_v1`) with cross-tab `storage` synchronization
- **API Client:** Lightweight fetch client with structured `PokeApiError`, AbortSignal support, configurable `VITE_POKEAPI_BASE_URL`, input sanitization, and URL building
- **Testing:** Native `bun test` runner for fast, mock-driven unit testing (177 tests passing)

### Project Structure

```text
pokeva/
├── docs/
│   └── deployment.md          # Comprehensive hosting, Nginx, Caddy & CDN guide
├── public/
│   ├── _headers               # Production security & cache-control headers
│   ├── _redirects             # Cloudflare Pages / Netlify SPA fallback rule
│   ├── favicon.svg            # Scalable SVG brand Pokéball icon
│   └── robots.txt             # Search crawler directives
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root application component with providers
│   │   ├── error-boundary.tsx  # Resilient application Error Boundary
│   │   ├── router.tsx          # Code-split React Router v7 routes
│   │   ├── theme-context.ts    # Theme context and useTheme hook
│   │   └── theme-provider.tsx  # Theme provider with localStorage persistence
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Footer.tsx      # Application footer with brand & legal disclaimers
│   │   │   ├── Header.tsx      # Navigation, logo, theme toggle & mobile menu with favorites badge
│   │   │   ├── PageContainer.tsx # Responsive layout boundary container
│   │   │   ├── RootLayout.tsx  # Shell layout with suspense fallback, header, outlet, and footer
│   │   │   └── ThemeToggle.tsx # Accessible light/dark toggle button
│   │   └── ui/
│   │       ├── badge.tsx       # Reusable badge with Pokémon type variant support
│   │       ├── button.tsx      # Tactile, accessible button with variant matrix
│   │       ├── card.tsx        # Structured card container primitives
│   │       ├── input.tsx       # Accessible input with clear button and icon slots
│   │       ├── PageLoadingFallback.tsx # Accessible, theme-aware route loading state
│   │       └── skeleton.tsx    # Content-shaped loading skeleton
│   ├── features/
│   │   ├── favorites/
│   │   │   ├── favoritesStorage.ts # Versioned localStorage serialization & validation
│   │   │   ├── favorites-context.ts # React Context contract
│   │   │   ├── FavoritesContext.tsx # Context Provider with cross-tab synchronization
│   │   │   ├── useFavorites.ts     # Consumer hook for favorites state
│   │   │   ├── FavoriteButton.tsx  # Accessible heart toggle with click-isolation
│   │   │   ├── FavoritesEmptyState.tsx # Zero-state banner linking to Pokédex
│   │   │   └── index.ts            # Clean barrel export
│   │   └── pokemon/
│   │       ├── detail/
│   │       │   ├── PokemonHero.tsx          # Hero artwork, type badges, intent prefetch & nav
│   │       │   ├── PokemonBaseStats.tsx     # Base stats meters, accessible progressbars, total sum
│   │       │   ├── PokemonSpeciesInfo.tsx   # Physical traits, gender ratios, breeding & training
│   │       │   ├── PokemonAbilities.tsx     # Abilities, hidden ability tagging, English descriptions
│   │       │   ├── PokemonEvolutionChain.tsx # Recursive branching evolution explorer & conditions
│   │       │   ├── PokemonMoves.tsx         # Categorized moves browser with on-demand detail
│   │       │   ├── PokemonDetailSkeleton.tsx # Layout-matched loading skeleton
│   │       │   └── moveUtils.ts             # Move grouping, level-up sorting & search filters
│   │       ├── PokemonCard.tsx              # Memoized card with prefetch, artwork, badges & stats
│   │       ├── PokemonEmptyState.tsx        # Zero-state with reset trigger
│   │       ├── PokemonErrorState.tsx        # Recoverable error state with retry
│   │       ├── PokemonGrid.tsx              # Responsive multi-column grid
│   │       ├── PokemonPagination.tsx        # Accessible page navigation controls
│   │       ├── PokemonSearchPreview.tsx     # Search input & elemental type filter pills
│   │       ├── usePokedexListing.ts         # Centralized listing orchestrator hook
│   │       ├── usePokemonImage.ts           # Anti-layout-shift image loader with fallbacks
│   │       └── mockPokemon.ts               # Curated 12-species mock dataset
│   ├── lib/
│   │   ├── queryClient.ts      # Centralized TanStack Query client configuration (2h retention)
│   │   ├── useDocumentTitle.ts # Accessible dynamic browser tab title synchronizer
│   │   └── utils.ts            # Formatting helpers & Tailwind class merger (cn)
│   ├── pages/
│   │   ├── AboutPage.tsx       # Design tokens & roadmap documentation page
│   │   ├── FavoritesPage.tsx   # Curated collection page with sort & search
│   │   ├── HomePage.tsx        # Live Pokédex catalogue with search & filters
│   │   ├── NotFoundPage.tsx    # Resilient 404 page
│   │   └── PokemonDetailPage.tsx # Comprehensive Pokémon detail explorer
│   ├── services/
│   │   └── pokeapi/
│   │       ├── client.ts       # Centralized PokeApiClient, PokeApiError & env base URL
│   │       ├── pokemonService.ts # Typed service layer for all PokéAPI endpoints
│   │       ├── queries.ts      # TanStack Query keys factory, queryOptions, and hooks
│   │       ├── utils.ts        # Pagination validators, ID extractors, artwork resolvers
│   │       ├── mappers.ts      # Domain mapping from raw PokéAPI to UI models
│   │       ├── evolution.ts    # Recursive evolution tree parser and condition formatter
│   │       └── index.ts        # Clean barrel export
│   ├── styles/
│   │   ├── globals.css         # Semantic HSL CSS variables & reduced-motion rules
│   │   └── typeColors.ts       # 18 official Pokémon type contrast tokens
│   ├── types/
│   │   ├── favorites.ts        # Minimal, versioned favorites schemas
│   │   ├── pokemon.ts          # Core domain models and filter state types
│   │   └── pokeapi.ts          # Official PokéAPI v2 response and resource interfaces
│   ├── main.tsx                # Application bootstrap
│   └── vite-env.d.ts           # Vite client environment types
├── .env.example                # Sample environment configuration
├── index.html                  # HTML5 entry with SEO and Open Graph metadata
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json                 # Vercel SPA rewrite and caching configuration
├── vite.config.ts              # Vite build config with manual chunking
└── eslint.config.js
```

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

### Deployment

See [`docs/deployment.md`](./docs/deployment.md) for full deployment instructions across Cloudflare Pages, Netlify, Vercel, Nginx, and Caddy.
