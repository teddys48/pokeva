import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { PageContainer } from './PageContainer';
import { Menu, X, Sparkles, BookOpen, Heart, Info } from 'lucide-react';
import { useFavorites } from '@/features/favorites/useFavorites';
import { cn } from '@/lib/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalFavorites } = useFavorites();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md transition-colors">
      <PageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg py-1 px-1.5 -ml-1.5 transition-transform active:scale-[0.98]"
            aria-label="Pokéva Home"
          >
            {/* Modern Pokéball Mark */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-primary to-rose-600 shadow-sm shadow-primary/20 transition-transform group-hover:rotate-12">
              <div className="absolute inset-[2px] rounded-full border border-white/30" />
              <div className="absolute h-[2px] w-full bg-slate-950/70" />
              <div className="absolute h-3 w-3 rounded-full bg-background border-2 border-slate-950/70 shadow-xs flex items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-primary" />
              </div>
            </div>

            {/* Wordmark */}
            <span className="flex items-baseline text-xl font-bold tracking-tight text-foreground">
              <span>Poké</span>
              <span className="text-primary font-black tracking-normal">va</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )
              }
            >
              <BookOpen className="h-4 w-4" />
              <span>Pokédex</span>
            </NavLink>

            {/* Favorites Navigation */}
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )
              }
              aria-label={`Favorites, ${totalFavorites} saved`}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  totalFavorites > 0
                    ? 'fill-rose-500/20 text-rose-500'
                    : 'text-muted-foreground'
                )}
              />
              <span>Favorites</span>
              {totalFavorites > 0 && (
                <span className="ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                  {totalFavorites}
                </span>
              )}
            </NavLink>

            {/* About Navigation */}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )
              }
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </NavLink>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </PageContainer>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile navigation">
            <NavLink
              to="/"
              end
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )
              }
            >
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Pokédex</span>
            </NavLink>

            <NavLink
              to="/favorites"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Heart
                  className={cn(
                    'h-4 w-4',
                    totalFavorites > 0 ? 'fill-rose-500 text-rose-500' : 'text-rose-500'
                  )}
                />
                <span>Favorites</span>
              </div>
              {totalFavorites > 0 && (
                <span className="rounded-full px-2 py-0.5 text-xs font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                  {totalFavorites}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/about"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )
              }
            >
              <Info className="h-4 w-4 text-primary" />
              <span>About Pokéva</span>
            </NavLink>

            <div className="pt-2 mt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground px-2">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Pokéva Explorer
              </span>
              <span>Discover &amp; Collect</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
