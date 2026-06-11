'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[fade-in_0.2s_ease-out]">
      {children}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  /* ── Loading ───────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Spinner className="h-16 w-16 text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-sm text-muted-foreground tracking-wide animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  /* ── Layout principal ──────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-background">

      {/* Sidebar */}
      <AppSidebar />

      {/* Zone droite */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar + séparateur */}
        <div className="border-b border-border">
          <AppNavbar />
        </div>

        {/* Contenu page */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="w-full mx-auto p-4 md:p-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>

      </div>
    </div>
  );
}