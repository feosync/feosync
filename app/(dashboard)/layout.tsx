'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Spinner } from '@/components/ui/spinner';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { GuidedTour } from '@/components/onboarding/GuidedTour';
import { useOnboardingContext } from '@/components/onboarding/OnboardingProvider';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { isFirstVisit, state, update } = useOnboardingContext();

  return (
    <>
      <WelcomeModal
        open={isFirstVisit}
        onStartTour={() => update({ welcomeSeen: true })}
        onDismiss={() => update({ welcomeSeen: true, tourCompleted: true })}
      />
      <GuidedTour
        open={state.welcomeSeen && !state.tourCompleted}
        onClose={() => update({ tourCompleted: true })}
        onComplete={() => update({ tourCompleted: true })}
      />
      {children}
    </>
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

  return (
    <OnboardingProvider>
      <OnboardingGate>
        <div className="flex h-screen bg-background overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">

            <div className="border-b border-border">
              <AppNavbar />
            </div>

            <main className="flex-1 overflow-y-auto bg-background">
              <div className="w-full mx-auto p-4 md:p-8">
                <PageTransition>
                  {children}
                </PageTransition>
              </div>
            </main>

          </div>
        </div>
      </OnboardingGate>
    </OnboardingProvider>
  );
}