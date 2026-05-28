'use client'

import { useState, useCallback } from 'react'
import { Plus, Calendar, FileText, CheckCircle2, XCircle, Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useScheduledPosts, useScheduledPost, useDeleteScheduledPost } from '@/hooks/useScheduledPosts'
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
import type { AutoCommentRequest, PostStatus } from '@/lib/api/types'
import { usePublishedPosts, useSyncMetrics, useDeletePublishedPost, useSetAutoComment } from '@/hooks/usePublishedPosts'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { PublishedPostDetailSheet } from '@/components/published/PublishedPostDetailSheet'
import { checkCanCreatePost } from '@/lib/api/plan-limits'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { cn } from '@/lib/utils'

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

const PAGE_SIZE    = 3
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
  const { data: userDetail } = useCurrentUserDetail()

  // ── Org ───────────────────────────────────────────────────────────────────
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const organisations = orgData?.items ?? []
  const orgId = selectedOrgId || organisations[0]?.id || ''

  const { data: pages = [] } = useFacebookPages(orgId)

  // ── Published sheet ───────────────────────────────────────────────────────
  const [publishedSheetScheduledPostId, setPublishedSheetScheduledPostId] = useState<string | null>(null)

  const syncMutation        = useSyncMetrics(orgId)
  const pubDeleteMutation   = useDeletePublishedPost(orgId)
  const autoCommentMutation = useSetAutoComment(orgId)

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState<PostStatus | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [year,  setYear]  = useState<number | undefined>(THIS_YEAR)
  const [month, setMonth] = useState<number | undefined>(THIS_MONTH)
  const [week,  setWeek]  = useState<number | undefined>(CURRENT_WEEK)
  const [page,  setPage]  = useState(1)

  const availableWeeks = year && month ? getWeeksOfMonth(year, month) : []

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTabChange = (tab: PostStatus | 'all') => { setActiveTab(tab); setPage(1) }
  const handleSearch    = useCallback((v: string)   => { setSearchInput(v); setPage(1) }, [])

  const handleYear = (v: string) => {
    setYear(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined); setPage(1)
  }
  const handleMonth = (v: string) => {
    setMonth(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined); setPage(1)
  }
  const handleWeek = (v: string) => {
    setWeek(v !== 'all' ? Number(v) : undefined)
    setPage(1)
  }

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useScheduledPosts(orgId, {
    page, page_size: PAGE_SIZE, status: activeTab, search, year, month, week,
  })

  const posts      = data?.items      ?? []
  const total      = data?.total      ?? 0
  const totalPages = data?.total_pages ?? 1

  const deleteMutation = useDeleteScheduledPost(orgId)

  const disabledClass = (cond: boolean) =>
    cond ? 'pointer-events-none opacity-50' : 'cursor-pointer'

  const handleOpenCreatePost = () => {
    if (!checkCanCreatePost(userDetail)) return
    router.push('/posts/new')
  }

  const [filtersOpen, setFiltersOpen] = useState(false)

  // ── Nombre de filtres actifs ──────────────────────────────────────────────
  const activeFilterCount = [
    year !== THIS_YEAR,
    month !== THIS_MONTH,
    week !== CURRENT_WEEK,
  ].filter(Boolean).length

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Posts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} publication{total > 1 ? 's' : ''}
            {search && ` pour "${search}"`}
          </p>
        </div>
        <Button
          onClick={handleOpenCreatePost}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau post</span>
        </Button>
      </div>

      {/* ── Org selector ── */}
      <div className="w-full max-w-sm">
        <label className="text-sm text-slate-500 mb-1.5 block">Organisation</label>
        <OrganisationSelector
          value={selectedOrgId}
          onChange={v => { setSelectedOrgId(v); setPage(1) }}
          placeholder="Sélectionner une organisation"
        />
      </div>

      {/* ── Ligne 1 : Search + bouton toggle filtres ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher…"
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9 pr-9 w-full"
          />
          {searchInput && (
            <Button
              variant="ghost" size="icon"
              onClick={() => handleSearch('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen(o => !o)}
          className={cn('relative shrink-0 gap-1.5', filtersOpen && 'border-blue-500 text-blue-600')}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFilterCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ── Ligne 2 (conditionnelle) : sélecteurs date ── */}
      {filtersOpen && (
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">

          <Select value={year ? String(year) : 'all'} onValueChange={handleYear}>
            <SelectTrigger className="w-full xs:w-28 h-9">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les années</SelectItem>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={month ? String(month) : 'all'} onValueChange={handleMonth}>
            <SelectTrigger className="w-full xs:w-36 h-9">
              <SelectValue placeholder="Mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={week ? String(week) : 'all'} onValueChange={handleWeek} disabled={!month}>
            <SelectTrigger className="w-full xs:w-36 h-9">
              <SelectValue placeholder={month ? 'Semaine' : 'Choisir un mois'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les semaines</SelectItem>
              {availableWeeks.map(w => <SelectItem key={w} value={String(w)}>Semaine {w}</SelectItem>)}
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost" size="sm" className="h-9 gap-1 text-slate-500 hover:text-slate-700"
              onClick={() => { setYear(THIS_YEAR); setMonth(THIS_MONTH); setWeek(CURRENT_WEEK); setPage(1) }}
            >
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </Button>
          )}

        </div>
      )}

      {/* ── Tabs statut — toujours scrollables horizontalement ── */}
      <div className="overflow-x-auto scrollbar-none">
        <div className="flex gap-0.5 border-b border-slate-200 dark:border-slate-800 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-[13px] border-b-2 -mb-px transition-colors whitespace-nowrap',
                activeTab === tab.value
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/*
        ── Grille ──
        • 1 colonne par défaut (mobile)
        • 2 colonnes dès 480px de largeur du CONTENEUR (min-[480px])
          → adapté au content area avec sidebar (~550px), pas au viewport entier
        • Jamais 3 colonnes : évite l'écrasement des cartes dans ce layout
      */}
      <div className={cn('transition-opacity', isFetching && !isLoading ? 'opacity-60' : 'opacity-100')}>
        {isLoading ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState status={activeTab} onCreateClick={handleOpenCreatePost} />
        ) : (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() =>
                  post.status === 'PUBLISHED'
                    ? setPublishedSheetScheduledPostId(post.id)
                    : router.push(`/posts/${post.id}`)
                }
                onDelete={() => deleteMutation.mutate(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between pt-2">
          <p className="text-sm text-slate-500 order-2 sm:order-1">
            Page {page} / {totalPages} — {total} résultat{total > 1 ? 's' : ''}
          </p>
          <div className="order-1 sm:order-2 overflow-x-auto max-w-full">
            <Pagination>
              <PaginationContent className="flex-nowrap">

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
        </div>
      )}

      {/* ── Published post detail sheet ────────────────────────────────────── */}
      {publishedSheetScheduledPostId && (
        <PublishedSheetFromScheduled
          scheduledPostId={publishedSheetScheduledPostId}
          orgId={orgId}
          pages={pages}
          onClose={() => setPublishedSheetScheduledPostId(null)}
          onSync={id => syncMutation.mutate(id)}
          onDelete={id => { pubDeleteMutation.mutate(id); setPublishedSheetScheduledPostId(null) }}
          isSyncing={syncMutation.isPending}
          isDeleting={pubDeleteMutation.isPending}
          onAutoComment={(publishedPostId, payload) =>
            autoCommentMutation.mutate({ postId: publishedPostId, payload })
          }
          isAutoCommenting={autoCommentMutation.isPending}
        />
      )}

    </div>
  )
}

// ── Wrapper ───────────────────────────────────────────────────────────────────

function PublishedSheetFromScheduled({
  scheduledPostId, orgId, pages, onClose, onSync, onDelete,
  isSyncing, isDeleting, onAutoComment, isAutoCommenting,
}: {
  scheduledPostId: string
  orgId: string
  pages: any[]
  onClose: () => void
  onSync: (id: string) => void
  onDelete: (id: string) => void
  isSyncing?: boolean
  isDeleting?: boolean
  onAutoComment?: (publishedPostId: string, payload: AutoCommentRequest) => void
  isAutoCommenting?: boolean
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
      onAutoComment={payload => onAutoComment?.(publishedPost.id, payload)}
      isAutoCommenting={isAutoCommenting}
    />
  )
}