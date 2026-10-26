import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/app/theme-provider';
import { FavoritesProvider } from '@/features/favorites/FavoritesContext';
import { ErrorBoundary } from '@/app/error-boundary';
import { router } from '@/app/router';

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="pokeva-theme-preference">
          <FavoritesProvider>
            <RouterProvider router={router} />
          </FavoritesProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
