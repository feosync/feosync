'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';

interface EngagementChartProps {
  organizationId: string;
}

interface ChartData {
  name: string;
  likes: number;
  comments: number;
  shares: number;
}

export function EngagementChart({ organizationId }: EngagementChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const metrics = await analyticsService.getPostMetrics(organizationId);
        // Take top 5 posts
        const chartData = metrics.slice(0, 5).map((metric) => ({
          name: metric.content.substring(0, 20) + '...',
          likes: metric.likes,
          comments: metric.comments,
          shares: metric.shares,
        }));
        setData(chartData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [organizationId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-64" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Post Engagement
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
          <XAxis
            dataKey="name"
            stroke="currentColor"
            className="text-slate-500 dark:text-slate-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="currentColor"
            className="text-slate-500 dark:text-slate-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(226, 232, 240, 0.2)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Legend />
          <Bar dataKey="likes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="comments" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="shares" fill="#f59e0b" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
