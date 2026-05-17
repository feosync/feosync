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
  fbPageId: string
  followersTotal: number
  period: AnalyticsPeriod
  onPeriodChange: (p: AnalyticsPeriod) => void
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

export function AnalyticsHeader({
  pageName, fbPageId, followersTotal, period, onPeriodChange,
}: Props) {
  const router = useRouter()

  return (
    <div className="flex items-start justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            f
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-medium text-slate-900 dark:text-white">
                {pageName || 'Insights de la page'}
              </h1>
              <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0 text-[11px] gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Active
              </Badge>
            </div>
           
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
            {fmt(followersTotal)} abonnés
          </span>
        </div>
        <Tabs value={period} onValueChange={v => onPeriodChange(v as AnalyticsPeriod)}>
          <TabsList className="h-8 bg-slate-100 dark:bg-slate-800 ">
            {(Object.entries(PERIOD_LABELS) as [AnalyticsPeriod, string][]).map(([p, label]) => (
              <TabsTrigger key={p} value={p} className="text-[12px] h-7 cursor-pointer">{label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}