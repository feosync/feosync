'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, BarChart2, Eye, RefreshCw, Heart } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useOrganisations } from '@/hooks/useOrganisations'
import { usePublishedPosts, useSyncMetrics } from '@/hooks/usePublishedPosts'
import { useFacebookPages, useFacebookInsights } from '@/hooks/useFacebookPages'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'

function MetricCard({ label, value, icon: Icon, color }: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 opacity-70" />
        <span className="text-[12px] font-medium opacity-80">{label}</span>
      </div>
      <div className="text-[24px] font-medium">{value}</div>
    </div>
  )
}

function PageInsightsBlock({ pageId, orgId }: { pageId: string; orgId: string }) {
  const { data: insights = [], isLoading } = useFacebookInsights(pageId, orgId)

  if (isLoading) return <Skeleton className="h-24 rounded-xl" />
  if (!insights.length) return <p className="text-sm text-slate-500">Aucune donnée d'insights disponible</p>

  const latest = insights[0]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard label="Abonnés"     value={latest.fans_total ?? 0}          icon={Eye}        color="bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200" />
      <MetricCard label="Impressions" value={latest.impressions_unique ?? 0}  icon={BarChart2}  color="bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200" />
      <MetricCard label="Engagés"     value={latest.engaged_users ?? 0}       icon={Heart}      color="bg-pink-50 dark:bg-pink-950/50 text-pink-800 dark:text-pink-200" />
      <MetricCard label="Nouveaux"    value={latest.new_followers ?? 0}       icon={TrendingUp} color="bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200" />
    </div>
  )
}

export default function AnalyticsPage() {
  const router = useRouter()

  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  // Organisations
  const { data: orgData } = useOrganisations({ page: 1, page_size: 50 })
  const organisations = orgData?.items ?? []
  const orgId = selectedOrgId || organisations[0]?.id || ''

  // Posts publiés → on limite à 3 derniers
  const { data: publishedData, isLoading } = usePublishedPosts(orgId, { 
    page: 1, 
    page_size: 3 
  })
  const published = publishedData?.items ?? []

  // Pages Facebook
  const { data: pages = [] } = useFacebookPages(orgId)
  const syncMutation = useSyncMetrics(orgId)

  // Métriques globales
  const totalReach = published.reduce((s, p) => s + (p.initial_reach || 0), 0)
  const totalImpressions = published.reduce((s, p) => s + (p.initial_impressions || 0), 0)

  // Navigation vers la page de détail d'une page Facebook
  const goToPageAnalytics = (pageId: string) => {
    router.push(`/analytics/${pageId}?org_id=${orgId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-medium text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Performance de vos publications
        </p>
      </div>

      {/* Sélecteur d'organisation */}
      <div className="max-w-md">
        <label className="text-sm text-slate-500 mb-1.5 block">Organisation</label>
        <OrganisationSelector
          value={orgId}
          onChange={setSelectedOrgId}
          placeholder="Sélectionner une organisation"
        />
      </div>

      {/* Métriques globales */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard label="Posts publiés" value={published.length} icon={BarChart2} color="bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200" />
          <MetricCard label="Portée totale" value={totalReach} icon={Eye} color="bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200" />
          <MetricCard label="Impressions" value={totalImpressions} icon={TrendingUp} color="bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200" />
        </div>
      )}

      {/* Cartes des Pages Facebook (cliquables) */}
      {pages.map((page) => (
        <div
          key={page.id}
          onClick={() => goToPageAnalytics(page.id)}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">f</div>
              <h2 className="text-[14px] font-medium text-slate-900 dark:text-white">{page.page_name}</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPageAnalytics(page.id)
                }}

              >
                Voir les stats →
              </Button>
               <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation() 
                  syncMutation.mutate(page.id)
                }}
                disabled={syncMutation.isPending}
                className="text-[12px] text-slate-500 gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              </div>

           
          </div>

          <PageInsightsBlock pageId={page.id} orgId={orgId} />
        </div>
      ))}

      {/* 3 derniers posts publiés */}
      {published.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-[14px] font-medium text-slate-900 dark:text-white">
              3 derniers posts publiés
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {published.map((p) => {
              const page = pages.find((pg) => pg.id === p.facebook_page_id)
              return (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-slate-900 dark:text-white">
                      {page?.page_name || 'Page Facebook'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {format(new Date(p.published_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[12px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />{p.initial_reach}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart2 className="w-3.5 h-3.5" />{p.initial_impressions}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}