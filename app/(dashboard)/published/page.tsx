'use client'

import { useState } from 'react'
import { CheckCircle, Search , X} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { usePublishedPosts, useSyncMetrics, useDeletePublishedPost } from '@/hooks/usePublishedPosts'
import { useScheduledPost } from '@/hooks/useScheduledPosts'
import { useOrganisations }  from '@/hooks/useOrganisations'
import { useFacebookPages }  from '@/hooks/useFacebookPages'
import { PublishedPostCard } from '@/components/published/PublishedPostCard'
import { PublishedPostDetailSheet } from '@/components/published/PublishedPostDetailSheet'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import { useDebounce } from '@/hooks/useDebounce'
import type { AutoCommentRequest, PublishedPost } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { useSetAutoComment } from '@/hooks/usePublishedPosts'

// ── Utils ─────────────────────────────────────────────────────────────────────

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
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

const PAGE_SIZE    = 10
const THIS_YEAR    = new Date().getFullYear()
const THIS_MONTH   = new Date().getMonth() + 1
const CURRENT_WEEK = getISOWeekNumber(new Date())

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

export default function PublishedPage() {
  const [selected, setSelected] = useState<PublishedPost | null>(null)

  // ── Org ───────────────────────────────────────────────────────────────────
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const orgId = selectedOrgId || orgData?.items[0]?.id || ''
  const { data: pages = [] } = useFacebookPages(orgId)

  const autoCommentMutation = useSetAutoComment(orgId)

  // ── Filtres ───────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [year,  setYear]  = useState<number | undefined>(THIS_YEAR)
  const [month, setMonth] = useState<number | undefined>(THIS_MONTH)
  const [week,  setWeek]  = useState<number | undefined>(CURRENT_WEEK)
  const [page,  setPage]  = useState(1)

  const availableWeeks = year && month ? getWeeksOfMonth(year, month) : []

  const handleYear = (v: string) => {
    setYear(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined)
    setPage(1)
  }
  const handleMonth = (v: string) => {
    setMonth(v !== 'all' ? Number(v) : undefined)
    setWeek(undefined)
    setPage(1)
  }
  const handleWeek  = (v: string) => { setWeek(v !== 'all' ? Number(v) : undefined); setPage(1) }
  const handleSearch = (v: string) => { setSearchInput(v); setPage(1) }

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = usePublishedPosts(orgId, {
    page, page_size: PAGE_SIZE, search, year, month, week,
  })

  const posts      = data?.items      ?? []
  const total      = data?.total      ?? 0
  const totalPages = data?.total_pages ?? 1

  const syncMutation   = useSyncMetrics(orgId)
  const deleteMutation = useDeletePublishedPost(orgId)

  const disabledClass = (cond: boolean) =>
    cond ? 'pointer-events-none opacity-50' : 'cursor-pointer'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Posts publiés</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {total} publication{total > 1 ? 's' : ''}
          {search && ` pour "${search}"`}
        </p>
      </div>

      {/* Org selector */}
      <OrganisationSelector
        value={selectedOrgId}
        onChange={v => { setSelectedOrgId(v); setPage(1) }}
      />

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">

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

        <Select value={year ? String(year) : 'all'} onValueChange={handleYear}>
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

        <Select value={month ? String(month) : 'all'} onValueChange={handleMonth}>
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

      {/* Liste */}
      <div className={`transition-opacity ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => i).map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Aucun post publié</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search || year || month ? 'Aucun résultat pour ces filtres.' : 'Vos posts publiés apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <PublishedPostCardWrapper
                key={post.id}
                post={post}
                pages={pages}
                onSync={() => syncMutation.mutate(post.id)}
                isSyncing={syncMutation.isPending}
                onClick={() => setSelected(post)}
                onAutoComment={payload => autoCommentMutation.mutate({ postId: post.id, payload })}
                 isAutoCommenting={autoCommentMutation.isPending}
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

      {/* Sheet détail */}
      {selected && (
        <PublishedPostDetailSheetWrapper
          post={selected}
          pages={pages}
          onClose={() => setSelected(null)}
          onSync={() => syncMutation.mutate(selected.id)}
          onDelete={() => { deleteMutation.mutate(selected.id); setSelected(null) }}
          isSyncing={syncMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onAutoComment={payload => autoCommentMutation.mutate({ postId: selected.id, payload })}
          isAutoCommenting={autoCommentMutation.isPending}
        />
      )}
    </div>
  )
}

// ── Wrappers ──────────────────────────────────────────────────────────────────

function PublishedPostCardWrapper({ post, pages, onSync, isSyncing,onAutoComment, isAutoCommenting,  onClick }: {
  post: PublishedPost; pages: any[]
  onSync: () => void; isSyncing?: boolean;
  onAutoComment: (payload: AutoCommentRequest) => void; 
  isAutoCommenting?: boolean;
   onClick: () => void
}) {
  const { data: scheduledPost } = useScheduledPost(post.scheduled_post_id)
  const page = pages.find(p => p.id === post.facebook_page_id)
  return (
    <PublishedPostCard
      post={post} scheduledPost={scheduledPost} page={page}
      onSyncMetrics={onSync} isSyncing={isSyncing}
      onAutoComment={onAutoComment} isAutoCommenting={isAutoCommenting}
      onClick={onClick}
    />
  )
}

function PublishedPostDetailSheetWrapper({ post, pages, onClose, onSync, onDelete, isSyncing, isDeleting, onAutoComment, isAutoCommenting }: {
  post: PublishedPost; pages: any[]; onClose: () => void
  onSync: () => void; onDelete: () => void; isSyncing?: boolean; isDeleting?: boolean; onAutoComment: (payload: AutoCommentRequest) => void; isAutoCommenting?: boolean
}) {
  const { data: scheduledPost } = useScheduledPost(post.scheduled_post_id)
  const page = pages.find(p => p.id === post.facebook_page_id)
  return (
    <PublishedPostDetailSheet
      open onClose={onClose} post={post} scheduledPost={scheduledPost}
      page={page} onSyncMetrics={onSync} onDelete={onDelete}
      isSyncing={isSyncing} isDeleting={isDeleting}
      onAutoComment={onAutoComment} isAutoCommenting={isAutoCommenting}
    />
  )
}