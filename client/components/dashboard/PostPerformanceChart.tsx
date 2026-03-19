'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '@/lib/services';
import { Skeleton } from '@/components/ui/skeleton';

interface PostPerformanceChartProps {
  organizationId: string;
}

export function PostPerformanceChart({ organizationId }: PostPerformanceChartProps) {
  const [data, setData] = useState<Array<{ date: string; engagement: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const trend = await analyticsService.getEngagementTrend(organizationId, 30);
        // Take last 7 days for display
        setData(trend.slice(-7));
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
        Engagement Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
          <XAxis
            dataKey="date"
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
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
