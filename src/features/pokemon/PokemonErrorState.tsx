import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isPokeApiError } from '@/services/pokeapi/client';

export interface PokemonErrorStateProps {
  error?: Error | unknown;
  onRetry?: () => void;
  title?: string;
}

export function PokemonErrorState({
  error,
  onRetry,
  title = 'Failed to load Pokémon data',
}: PokemonErrorStateProps) {
  const userMessage =
    isPokeApiError(error) && error.userMessage
      ? error.userMessage
      : error instanceof Error
        ? error.message
        : 'An unexpected error occurred while communicating with PokéAPI. Please check your connection and try again.';

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-8 sm:p-12 text-center animate-fade-in"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive mb-4">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
        {userMessage}
      </p>

      {onRetry && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="md"
            onClick={onRetry}
            className="gap-2 border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      )}
    </div>
  );
}
