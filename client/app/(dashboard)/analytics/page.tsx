'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/lib/services';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    averageEngagement: 0,
    postCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [user]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsService.getEngagementMetrics(user?.id || '');
      setMetrics(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Analytics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          View your social media performance and engagement metrics
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
            <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">Total Posts</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {metrics.postCount}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-0">
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">Total Likes</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {metrics.totalLikes}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">Total Comments</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {metrics.totalComments}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-0">
            <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium">Total Shares</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              {metrics.totalShares}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0">
            <p className="text-purple-700 dark:text-purple-300 text-sm font-medium">Avg Engagement</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
              {metrics.averageEngagement}
            </p>
          </Card>
        </div>
      )}

      <Card className="p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          More detailed analytics charts coming soon...
        </p>
      </Card>
    </div>
  );
}
