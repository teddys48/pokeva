import { Sparkles, Loader2 } from 'lucide-react';

export function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 text-center"
    >
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <Sparkles className="absolute h-5 w-5 text-primary animate-pulse" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Loading Pokéva...</p>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin inline" aria-hidden="true" />
          <span>Loading Pokédex data...</span>
        </p>
      </div>
      <span className="sr-only">Loading page content, please wait...</span>
    </div>
  );
}
