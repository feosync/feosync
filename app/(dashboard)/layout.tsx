'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Spinner } from '@/components/ui/spinner';

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
        <div className="flex flex-col items-center gap-4 animate-pulse">
          {/* Indicateur bleu minimaliste */}
           <Spinner className='h-20 w-20'></Spinner>
          <p className="text-xl text-muted-foreground tracking-wide">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  /* ── Layout principal ──────────────────────────────────────────────────── */
  return (
    <div className="font-roboto flex h-screen bg-background">

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
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}