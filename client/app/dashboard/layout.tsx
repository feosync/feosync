'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <AppNavbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto md:ml-0">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
