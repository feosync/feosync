'use client'

import { useState } from 'react'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useScheduledPosts } from '@/hooks/useScheduledPosts'
import { usePublishedPosts } from '@/hooks/usePublishedPosts'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar, CheckCircle, FileEdit, XCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number
  icon: React.ElementType; color: string
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium opacity-80">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-[26px] font-medium">{value}</div>
    </div>
  )
}

export default function OverviewPage() {
  const { user } = useAuth()
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const organisations = orgData?.items ?? []
  const orgId = selectedOrgId || organisations[0]?.id || ''

  // ── Un appel par statut → total fiable sans charger tous les posts ─────────
  const { data: draftData,     isLoading: l1 } = useScheduledPosts(orgId, { status: 'DRAFT',     page: 1, page_size: 1 })
  const { data: scheduledData, isLoading: l2 } = useScheduledPosts(orgId, { status: 'SCHEDULED', page: 1, page_size: 3 })
  const { data: failedData,    isLoading: l3 } = useScheduledPosts(orgId, { status: 'FAILED',    page: 1, page_size: 1 })

  const { data: publishedData, isLoading: l4 } = usePublishedPosts(orgId, { page: 1, page_size: 3 })
  const published = publishedData?.items ?? []
  const publishedTotal = publishedData?.total ?? 0
  const { data: pages = [] }                    = useFacebookPages(orgId)

  const isLoading = l1 || l2 || l3 || l4

  // Les 3 prochains planifiés, triés par date
  const upcoming = (scheduledData?.items ?? [])
    .filter(p => p.publish_at)
    .sort((a, b) => new Date(a.publish_at!).getTime() - new Date(b.publish_at!).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Voici un aperçu de vos publications
          </p>
        </div>
        <Link href="/posts/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Plus className="w-4 h-4" /> Nouveau post
          </Button>
        </Link>
      </div>

      <OrganisationSelector value={selectedOrgId} onChange={setSelectedOrgId} />

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Publiés"
            value={publishedTotal}
            icon={CheckCircle}
            color="bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200"
          />
          <StatCard
            label="Planifiés"
            value={scheduledData?.total ?? 0}   // ← total réel depuis l'API
            icon={Calendar}
            color="bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200"
          />
          <StatCard
            label="Brouillons"
            value={draftData?.total ?? 0}        // ← idem
            icon={FileEdit}
            color="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          />
          <StatCard
            label="Échoués"
            value={failedData?.total ?? 0}       // ← idem
            icon={XCircle}
            color="bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prochaines publications */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-medium text-slate-900 dark:text-white">
              Prochaines publications
            </h2>
            <Link href="/posts" className="text-[12px] text-blue-600 hover:underline">Voir tout</Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-3">
                Aucune publication planifiée
              </p>
              <Link href="/posts/new">
                <Button variant="outline" size="sm" className="text-[12px]">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Créer un post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map(post => {
                const page = pages.find(p => p.id === Object.values(post.page_ids || {})[0])
                return (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">f</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-900 dark:text-white truncate">
                          {post.caption?.slice(0, 50) || 'Sans caption'}...
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {page?.page_name} · {format(new Date(post.publish_at!), "d MMM 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-medium text-slate-900 dark:text-white">Activité récente</h2>
            <Link href="/published" className="text-[12px] text-blue-600 hover:underline">Voir tout</Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : published.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-slate-500 dark:text-slate-400">
              Aucun post publié
            </p>
          ) : (
            <div className="space-y-2">
              {published.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div>
                    <p className="text-[13px] font-medium text-slate-900 dark:text-white">Post publié</p>
                    <p className="text-[11px] text-slate-400">
                      {format(new Date(p.published_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">{p.initial_reach}</p>
                    <p className="text-[10px] text-slate-400">portée</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}