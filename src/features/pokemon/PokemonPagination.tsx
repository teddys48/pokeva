import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PokemonPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function PokemonPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  isLoading = false,
}: PokemonPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate bounded visible page numbers (max 5 page buttons)
  const getVisiblePages = () => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      aria-label="Pokédex pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 pt-6 border-t border-border/70"
    >
      {/* Item Range Counter */}
      <div className="text-xs font-mono text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-semibold text-foreground">{startItem}</span>–
        <span className="font-semibold text-foreground">{endItem}</span> of{' '}
        <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span> Pokémon
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Jump to First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Go to first page"
          className="h-9 w-9 p-0 hidden sm:inline-flex"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Go to previous page"
          className="h-9 px-2.5 gap-1 text-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 mx-1" role="group" aria-label="Page selection">
          {visiblePages[0] > 1 && (
            <>
              <Button
                variant={currentPage === 1 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={isLoading}
                aria-label="Go to page 1"
                className="h-9 w-9 p-0 text-xs font-mono"
              >
                1
              </Button>
              {visiblePages[0] > 2 && (
                <span className="px-1 text-xs text-muted-foreground select-none" aria-hidden="true">
                  …
                </span>
              )}
            </>
          )}

          {visiblePages.map((page) => {
            const isCurrent = page === currentPage;
            return (
              <Button
                key={page}
                variant={isCurrent ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'h-9 w-9 p-0 text-xs font-mono transition-transform',
                  isCurrent && 'shadow-xs font-bold'
                )}
              >
                {page}
              </Button>
            );
          })}

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="px-1 text-xs text-muted-foreground select-none" aria-hidden="true">
                  …
                </span>
              )}
              <Button
                variant={currentPage === totalPages ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
                aria-label={`Go to page ${totalPages}`}
                className="h-9 w-9 p-0 text-xs font-mono"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          aria-label="Go to next page"
          className="h-9 px-2.5 gap-1 text-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Jump to Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || isLoading}
          aria-label="Go to last page"
          className="h-9 w-9 p-0 hidden sm:inline-flex"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
