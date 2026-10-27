import { useEffect } from 'react';

/**
 * Formats a page-specific title adhering to the brand standard.
 */
export function formatDocumentTitle(pageTitle?: string): string {
  if (!pageTitle || !pageTitle.trim()) {
    return 'Pokéva — Pokémon Explorer';
  }
  return pageTitle.includes('Pokéva') ? pageTitle : `${pageTitle} — Pokéva`;
}

/**
 * Sets the document title dynamically and restores the previous title upon unmount.
 * Improves browser history, tab management, screen reader navigation, and bookmarking.
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    if (!title || typeof document === 'undefined') return;
    const formatted = formatDocumentTitle(title);
    const previousTitle = document.title;
    document.title = formatted;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
