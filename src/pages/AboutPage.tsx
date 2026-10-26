import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { POKEMON_TYPE_STYLES, PokemonTypeName } from '@/styles/typeColors';
import { CheckCircle2, Clock, Sparkles, Layers, Palette, Terminal, Database } from 'lucide-react';

export function AboutPage() {
  const typeKeys = Object.keys(POKEMON_TYPE_STYLES) as PokemonTypeName[];

  return (
    <div className="py-8 md:py-10 space-y-8">
      <PageContainer size="narrow">
        {/* Intro */}
        <div className="space-y-3">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs font-semibold gap-1.5 py-0.5 px-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Architecture & Design System</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            About Pokéva
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Pokéva is a modern Pokémon Explorer web application built with React, Vite, TypeScript, and Tailwind CSS. Phase 2 introduces a typed, resilient data-access layer for the official PokéAPI v2.
          </p>
        </div>

        {/* Phase Breakdown Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Phase 1 & Phase 2: Completed</span>
              </div>
              <CardTitle className="text-lg">Design System & Data Layer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>✓ Modern, editorial layout and typographic Pokéball mark.</p>
              <p>✓ Semantic light/dark theme with persistent local storage.</p>
              <p>✓ Centralized 18-element Pokémon type design tokens.</p>
              <p>✓ Reusable UI primitives (Button, Input, Badge, Card, Skeleton).</p>
              <p>✓ PokéAPI v2 client with 5 typed endpoints and query options.</p>
              <p>✓ Typed error hierarchy, abort cancellation & data mappers.</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Phase 3 (Next)</span>
              </div>
              <CardTitle className="text-lg">Live Pokédex & Exploration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>⏳ Phase 3: Live Pokédex grid connected to PokéAPI data layer.</p>
              <p>⏳ Phase 3: Paginated / infinite scroll exploration UI.</p>
              <p>⏳ Phase 3: Real-time search & type filtering over live resources.</p>
              <p>⏳ Phase 3: Live loading skeletons, empty, and error recovery states.</p>
              <p>⏳ Future: Pokémon detail page, stat charts & evolution chains.</p>
            </CardContent>
          </Card>
        </div>

        {/* Design System Elemental Badges Showcase */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Palette className="h-4 w-4" />
              <span>Design Tokens</span>
            </div>
            <CardTitle className="text-lg">18 Pokémon Type Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every Pokémon elemental type features a dedicated contrast ratio token set designed for accessibility in both light and dark display modes.
            </p>
            <div className="flex flex-wrap gap-2">
              {typeKeys.map((type) => (
                <Badge key={type} pokemonType={type} size="md" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack Specifications */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Terminal className="h-4 w-4" />
              <span>Technology Stack</span>
            </div>
            <CardTitle className="text-lg">Specification & Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" /> React 19 + TypeScript
                </div>
                <div className="text-xs mt-1">Strict compiler settings with zero `any` usage.</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-primary" /> PokéAPI v2 Data Layer
                </div>
                <div className="text-xs mt-1">Typed endpoints, error hierarchy, mappers & queries.</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Tailwind CSS v3.4
                </div>
                <div className="text-xs mt-1">Semantic CSS variables and WCAG AA contrast.</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" /> TanStack Query v5
                </div>
                <div className="text-xs mt-1">Centralized query options, stale times, and retry policy.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
