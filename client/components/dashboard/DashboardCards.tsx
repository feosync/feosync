'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardCardsProps {
  stats: {
    scheduled: number;
    published: number;
    failed: number;
  };
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  const cards = [
    {
      label: 'Total Posts',
      value: stats.published + stats.scheduled,
      icon: TrendingUp,
      color: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: Clock,
      color: 'from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Published',
      value: stats.published,
      icon: CheckCircle2,
      color: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      color: 'from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`bg-gradient-to-br ${card.color} border-0`}>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${card.textColor} mt-2`}>
                  {card.value}
                </p>
              </div>
              <Icon className={`w-12 h-12 ${card.textColor} opacity-20`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
