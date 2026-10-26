import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PokemonDetailSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in" aria-busy="true" aria-label="Loading Pokémon details">
      {/* Top Navigation Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 flex justify-center">
            <Skeleton className="h-64 w-64 sm:h-72 sm:w-72 rounded-2xl" />
          </div>
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Stats and Species */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Stats Skeleton */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-28 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-4 w-8 rounded-md" />
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Species & Physical Skeleton */}
        <Card>
          <CardHeader className="pb-3 border-b border-border/60">
            <Skeleton className="h-6 w-44 rounded-md" />
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abilities Skeleton */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <Skeleton className="h-6 w-28 rounded-md" />
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </CardContent>
      </Card>

      {/* Evolution Chain Skeleton */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <Skeleton className="h-6 w-36 rounded-md" />
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <Skeleton className="h-32 w-32 rounded-2xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-32 w-32 rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
