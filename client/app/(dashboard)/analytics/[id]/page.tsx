'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { usePageAnalysis } from '@/hooks/useAnalytics'
import { AnalyticsHeader }       from '@/components/analytics/AnalyticsHeader'
import { AnalyticsKpiGrid }      from '@/components/analytics/AnalyticsKpiGrid'
import { AnalyticsCharts }       from '@/components/analytics/AnalyticsCharts'
import { AnalyticsErrorBanner }  from '@/components/analytics/AnalyticsErrorBanner'
import type { AnalyticsPeriod } from '@/lib/api/types'

export default function PageAnalyticsDetail() {
  const params       = useParams()
  const searchParams = useSearchParams()

  // id = fb_model_id (UUID interne), org_id passé en query param
  const fbModelId = params.id as string
  const orgId     = searchParams.get('org_id') ?? ''

  const [period, setPeriod] = useState<AnalyticsPeriod>('week')

  const { data, isLoading, isFetching } = usePageAnalysis(fbModelId, orgId, period)

  if (!orgId) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Paramètre <code>org_id</code> manquant dans l'URL.
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3 rounded-xl" />
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }, (_, i) => i).map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : data ? (
        <>
          <div className={`transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
            <AnalyticsHeader
              pageName={data.page_name}
              fbPageId={data.fb_page_id}
              followersTotal={data.followers_total}
              period={period}
              onPeriodChange={p => setPeriod(p)}
            />
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {Object.keys(data.errors).length > 0 && (
            <AnalyticsErrorBanner errors={data.errors} />
          )}

          <AnalyticsKpiGrid summary={data.summary} period={period} />

          <AnalyticsCharts daily={data.daily} />

   
        </>
      ) : (
        <div className="p-6 text-center text-slate-500 text-sm">
          Aucune donnée disponible pour cette page.
        </div>
      )}

    </div>
  )
}