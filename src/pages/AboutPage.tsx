import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { POKEMON_TYPE_STYLES, PokemonTypeName } from '@/styles/typeColors';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { CheckCircle2, Sparkles, Palette, Zap, BookOpen, Heart, ShieldCheck } from 'lucide-react';

export function AboutPage() {
  useDocumentTitle('About Pokéva — Modern Pokémon Explorer');

  const typeKeys = Object.keys(POKEMON_TYPE_STYLES) as PokemonTypeName[];

  return (
    <div className="py-8 md:py-10 space-y-8 animate-fade-in">
      <PageContainer size="narrow">
        {/* Intro */}
        <div className="space-y-3">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 text-xs font-semibold gap-1.5 py-0.5 px-2.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pokéva Guide</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            About Pokéva
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Pokéva is a modern, beautifully crafted Pokémon explorer designed for trainers, collectors, and fans. Browse through comprehensive Pokédex profiles, inspect battle statistics, uncover complete ability and moveset breakdowns, and follow branching evolution paths with a fast, intuitive interface.
          </p>
        </div>

        {/* Feature Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Comprehensive Pokédex</span>
              </div>
              <CardTitle className="text-lg">Pokémon Encyclopedia</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>✓ Full catalog covering Pokémon across all generations.</p>
              <p>✓ Instant real-time search by name, number, and elemental type.</p>
              <p>✓ High-resolution official artwork and animated sprite previews.</p>
              <p>✓ Detailed physical characteristics: height, weight, genus, and yield.</p>
              <p>✓ Transparent base stats breakdown with cumulative attribute ratings.</p>
              <p>✓ Dynamic light and dark display modes for comfortable viewing.</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Battle &amp; Evolution Intelligence</span>
              </div>
              <CardTitle className="text-lg">Evolution &amp; Moves Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>✓ Interactive evolution trees displaying levels, stones, and branching lines.</p>
              <p>✓ Comprehensive move listings categorized by Level-up, TM machines, and breeding.</p>
              <p>✓ Ability encyclopedia detailing battle mechanics and hidden attributes.</p>
              <p>✓ Personal favorites collection saved directly on your device.</p>
              <p>✓ Fast, responsive page transitions designed for instant reference.</p>
              <p>✓ Mobile-first responsive layout tailored for on-the-go exploration.</p>
            </CardContent>
          </Card>
        </div>

        {/* Elemental Badges Showcase */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Palette className="h-4 w-4" />
              <span>Elemental Types</span>
            </div>
            <CardTitle className="text-lg">18 Elemental Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every Pokémon elemental type features a dedicated high-contrast color scheme designed for immediate identification and comfortable reading across all devices.
            </p>
            <div className="flex flex-wrap gap-2">
              {typeKeys.map((type) => (
                <Badge key={type} pokemonType={type} size="md" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience & Quality Pillars */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Trainer Experience</span>
            </div>
            <CardTitle className="text-lg">Designed for Pokémon Trainers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Fast &amp; Responsive
                </div>
                <div className="text-xs mt-1">Instant search, snappy transitions, and quick lookups during battle or exploration.</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> Rich Lore &amp; Data
                </div>
                <div className="text-xs mt-1">Deep insights into Pokémon species, flavor lore, breeding groups, and catch rates.</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-rose-500" /> Personal Collection
                </div>
                <div className="text-xs mt-1">Save and curate your favorite Pokémon directly on your device with no login needed.</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Accessible Everywhere
                </div>
                <div className="text-xs mt-1">High-contrast visuals and clean layouts optimized for phones, tablets, and desktops.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
