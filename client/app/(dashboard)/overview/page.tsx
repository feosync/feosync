'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardCards } from '@/components/dashboard/DashboardCards';
import { PostPerformanceChart } from '@/components/dashboard/PostPerformanceChart';
import { EngagementChart } from '@/components/dashboard/EngagementChart';
import { analyticsService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    scheduled: 0,
    published: 0,
    failed: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        if (!user) return;
        const result = await analyticsService.getScheduledPostStats(user.id);
        setStats(result);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Here's your social media performance overview
        </p>
      </div>

      {/* Dashboard Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <DashboardCards stats={stats} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <>
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </>
        ) : (
          <>
            <PostPerformanceChart organizationId={user?.id || ''} />
            <EngagementChart organizationId={user?.id || ''} />
          </>
        )}
      </div>
    </div>
  );
}
