import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export function NotFoundPage() {
  useDocumentTitle('404 Page Not Found — Pokéva');

  return (
    <div className="py-16 md:py-24">
      <PageContainer size="narrow">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
            <HelpCircle className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            The page or Pokémon you are looking for does not exist or may have been moved.
          </p>

          <div className="pt-4">
            <Link to="/">
              <Button variant="primary" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Pokédex</span>
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
