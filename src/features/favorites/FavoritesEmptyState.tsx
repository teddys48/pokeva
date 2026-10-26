import { Link } from 'react-router-dom';
import { Heart, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FavoritesEmptyState() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 sm:p-12 text-center animate-fade-in my-6"
    >
      {/* Icon with glowing backdrop */}
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xs">
        <Heart className="h-8 w-8 text-rose-500" aria-hidden="true" />
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
          <Sparkles className="h-3 w-3" />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        Your collection is waiting
      </h2>

      <p className="mt-2 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
        You haven&apos;t saved any favorite Pokémon yet. Explore the Pokédex catalogue and click the heart icon on any card or detail page to curate your personal collection.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Explore Pokédex</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
