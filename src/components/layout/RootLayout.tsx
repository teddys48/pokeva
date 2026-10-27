import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageLoadingFallback } from '@/components/ui/PageLoadingFallback';

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-primary/20 selection:text-primary">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
