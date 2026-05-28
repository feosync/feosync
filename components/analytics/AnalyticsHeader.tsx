'use client'

import { ArrowLeft, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AnalyticsPeriod } from '@/lib/api/types'

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day:     "Aujourd'hui",
  week:    '7 jours',
  days_28: '28 jours',
}

interface Props {
  pageName: string
  url: string
  followersTotal: number
  period: AnalyticsPeriod
  onPeriodChange: (p: AnalyticsPeriod) => void
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

export function AnalyticsHeader({
  pageName, url, followersTotal, period, onPeriodChange,
}: Props) {
  const router = useRouter()

  return (
    <div className="flex items-start justify-between flex-wrap gap-3 h-full">
      {/* LEFT — back + page identity */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3">
          {url ? (
            <img
              src={url}
              alt={pageName}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
              f
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {pageName || 'Insights de la page'}
              </h1>
              <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0 text-[10px] gap-1 px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — followers count + period tabs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg border border-border">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium text-secondary-foreground">
            {fmt(followersTotal)} abonnés
          </span>
        </div>

        <Tabs value={period} onValueChange={v => onPeriodChange(v as AnalyticsPeriod)}>
          <TabsList className="h-8 bg-muted">
            {(Object.entries(PERIOD_LABELS) as [AnalyticsPeriod, string][]).map(([p, label]) => (
              <TabsTrigger
                key={p}
                value={p}
                className="text-xs h-7 cursor-pointer"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}