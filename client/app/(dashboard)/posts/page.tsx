'use client'

import { useState, useCallback } from 'react'
import { Plus, Calendar, FileText, CheckCircle2, XCircle, Search,X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useScheduledPosts, useScheduledPost,useDeleteScheduledPost } from '@/hooks/useScheduledPosts'
import { useOrganisations } from '@/hooks/useOrganisations'
import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/posts/EmptyState'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'
import type { PostStatus } from '@/lib/api/types'
import { usePublishedPosts, useSyncMetrics, useDeletePublishedPost } from '@/hooks/usePublishedPosts'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { PublishedPostDetailSheet } from '@/components/published/PublishedPostDetailSheet'

// ── Utils ─────────────────────────────────────────────────────────────────────

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getCurrentISOWeek(): number {
  return getISOWeekNumber(new Date())
}

function getWeeksOfMonth(year: number, month: number): number[] {
  const weeks = new Set<number>()
  const lastDay = new Date(year, month, 0).getDate()
  for (let day = 1; day <= lastDay; day++) {
    weeks.add(getISOWeekNumber(new Date(year, month - 1, day)))
  }
  return Array.from(weeks).sort((a, b) => a - b)
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE    = 9
const THIS_YEAR    = new Date().getFullYear()
const THIS_MONTH   = new Date().getMonth() + 1
const CURRENT_WEEK = getCurrentISOWeek()

const TABS: { label: string; value: PostStatus | 'all'; icon: any }[] = [
  { label: 'Tous',       value: 'all',       icon: FileText     },
  { label: 'Brouillons', value: 'DRAFT',     icon: FileText     },
  { label: 'Planifiés',  value: 'SCHEDULED', icon: Calendar     },
  { label: 'Publiés',    value: 'PUBLISHED', icon: CheckCircle2 },
  { label: 'Échoués',    value: 'FAILED',    icon: XCircle      },
]

const YEARS = Array.from({ length: 3 }, (_, i) => THIS_YEAR - i)

const MONTHS = [
  { value: 1,  label: 'Janvier'   }, { value: 2,  label: 'Février'   },
  { value: 3,  label: 'Mars'      }, { value: 4,  label: 'Avril'     },
  { value: 5,  label: 'Mai'       }, { value: 6,  label: 'Juin'      },
  { value: 7,  label: 'Juillet'   }, { value: 8,  label: 'Août'      },
  { value: 9,  label: 'Septembre' }, { value: 10, label: 'Octobre'   },
  { value: 11, label: 'Novembre'  }, { value: 12, label: 'Décembre'  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PostsPage() {
  const router = useRouter()

  // ── Org ───────────────────────────────────────────────────────────────────
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const organisations = orgData?.items ?? []
  const orgId = selectedOrgId || organisations[0]?.id || ''


  const { data: pages = [] } = useFacebookPages(orgId)
  const [publishedSheetPostId, setPublishedSheetPostId] = useState<string | null>(null)
  const syncMutation      = useSyncMetrics(orgId)
  const pubDeleteMutation = useDeletePublishedPost(orgId)

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState<PostStatus | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [year,  setYear]  = useState<number | undefined>(THIS_YEAR)
  const [month, setMonth] = useState<number | undefined>(THIS_MONTH)
  const [week,  setWeek]  = useState<number | undefined>(CURRENT_WEEK)
  const [page,  setPage]  = useState(1)

  // semaines disponibles selon year+month courants
  const availableWeeks = year && month ? getWeeksOfMonth(year, month) : []

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTabChange = (tab: PostStatus | 'all') => { setActiveTab(tab); setPage(1) }
  const handleSearch    = useCallback((v: string)   => { setSearchInput(v); setPage(1) }, [])

  const handleYear = (v: string) => {
    setYear(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined)
    setPage(1)
  }

  const handleMonth = (v: string) => {
    setMonth(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined)   // reset semaine — elle peut ne plus être dans le nouveau mois
    setPage(1)
  }

  const handleWeek = (v: string) => {
    setWeek(v !== 'all' ? Number(v) : undefined)
    setPage(1)
  }

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useScheduledPosts(orgId, {
    page,
    page_size: PAGE_SIZE,
    status: activeTab,
    search,
    year,
    month,
    week,
  })

  const posts      = data?.items      ?? []
  const total      = data?.total      ?? 0
  const totalPages = data?.total_pages ?? 1

  const deleteMutation = useDeleteScheduledPost(orgId)

  const disabledClass = (cond: boolean) =>
    cond ? 'pointer-events-none opacity-50' : 'cursor-pointer'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Posts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} publication{total > 1 ? 's' : ''}
            {search && ` pour "${search}"`}
          </p>
        </div>
        <Button
          onClick={() => router.push('/posts/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nouveau post
        </Button>
      </div>

      {/* Org selector */}
      <div className="max-w-md">
        <label className="text-sm text-slate-500 mb-1.5 block">Organisation</label>
        <OrganisationSelector
          value={selectedOrgId}
          onChange={v => { setSelectedOrgId(v); setPage(1) }}
          placeholder="Sélectionner une organisation"
        />
      </div>

      {/* Filtres date + search */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher…"
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9 pr-9 w-52"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSearch('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Année */}
        <Select
          value={year ? String(year) : 'all'}
          onValueChange={handleYear}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {YEARS.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mois */}
        <Select
          value={month ? String(month) : 'all'}
          onValueChange={handleMonth}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {MONTHS.map(m => (
              <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Semaine — dépend du mois sélectionné */}
        <Select
          value={week ? String(week) : 'all'}
          onValueChange={handleWeek}
          disabled={!month}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder={month ? 'Semaine' : 'Choisir un mois'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {availableWeeks.map(w => (
              <SelectItem key={w} value={String(w)}>Semaine {w}</SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Tabs statut */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] border-b-2 -mb-px transition-colors ${
              activeTab === tab.value
                ? 'border-blue-500 text-blue-600 font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={`transition-opacity ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }, (_, i) => i).map(i => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            status={activeTab}
            onCreateClick={() => router.push('/posts/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() =>
                  post.status === 'PUBLISHED'
                    ? setPublishedSheetPostId(post.id)
                    : router.push(`/posts/${post.id}`)
                }
                onDelete={() => deleteMutation.mutate(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between pt-2">
          <p className="text-sm text-slate-500">
            Page {page} sur {totalPages} — {total} résultat{total > 1 ? 's' : ''}
          </p>
          <Pagination>
            <PaginationContent>

              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={disabledClass(page === 1 || isFetching)}
                />
              </PaginationItem>

              {page > 2 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => setPage(1)} className="cursor-pointer">1</PaginationLink>
                  </PaginationItem>
                  {page > 3 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                </>
              )}

              {page > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(page - 1)} className="cursor-pointer">
                    {page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>

              {page < totalPages && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(page + 1)} className="cursor-pointer">
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {page < totalPages - 1 && (
                <>
                  {page < totalPages - 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                  <PaginationItem>
                    <PaginationLink onClick={() => setPage(totalPages)} className="cursor-pointer">
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={disabledClass(page === totalPages || isFetching)}
                />
              </PaginationItem>

            </PaginationContent>
          </Pagination>
        </div>
      )}

      {publishedSheetPostId && (
        <PublishedSheetFromScheduled
          scheduledPostId={publishedSheetPostId}
          orgId={orgId}
          pages={pages}
          onClose={() => setPublishedSheetPostId(null)}
          onSync={id => syncMutation.mutate(id)}
          onDelete={id => { pubDeleteMutation.mutate(id); setPublishedSheetPostId(null) }}
          isSyncing={syncMutation.isPending}
          isDeleting={pubDeleteMutation.isPending}
        />
      )}

    </div>
  )
}

function PublishedSheetFromScheduled({
  scheduledPostId, orgId, pages, onClose, onSync, onDelete, isSyncing, isDeleting,
}: {
  scheduledPostId: string
  orgId: string
  pages: any[]
  onClose: () => void
  onSync: (id: string) => void
  onDelete: (id: string) => void
  isSyncing?: boolean
  isDeleting?: boolean
}) {
  const { data: scheduledPost } = useScheduledPost(scheduledPostId)

  const { data } = usePublishedPosts(orgId, { page: 1, page_size: 50 })
  const publishedPost = data?.items.find(p => p.scheduled_post_id === scheduledPostId) ?? null

  const page = pages.find(p => p.id === publishedPost?.facebook_page_id)

  if (!publishedPost) return null

  return (
    <PublishedPostDetailSheet
      open
      onClose={onClose}
      post={publishedPost}
      scheduledPost={scheduledPost}
      page={page}
      onSyncMetrics={() => onSync(publishedPost.id)}
      onDelete={() => onDelete(publishedPost.id)}
      isSyncing={isSyncing}
      isDeleting={isDeleting}
    />
  )
}