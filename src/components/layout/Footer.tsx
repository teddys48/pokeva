import { PageContainer } from './PageContainer';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/80 bg-card/60 transition-colors mt-auto py-8">
      <PageContainer>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Brand & Stack */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-semibold text-foreground">Pokéva</span>
            <span>—</span>
            <span>Modern Pokémon Explorer & Pokédex</span>
          </div>

          {/* Feature Badge */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Explore Every Generation</span>
            </span>
            <span>·</span>
            <span>Curated Pokémon Encyclopedia</span>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-6 pt-4 border-t border-border/50 text-[11px] text-muted-foreground/80 leading-relaxed text-center md:text-left">
          <p>
            Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc.
            Pokéva is an unofficial, fan-made project built for Pokémon enthusiasts and collectors.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
