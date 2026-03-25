'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { usePublishedPosts, useSyncMetrics, useDeletePublishedPost } from '@/hooks/usePublishedPosts'
import { useScheduledPost } from '@/hooks/useScheduledPosts'
import { useOrganisations }  from '@/hooks/useOrganisations'
import { useFacebookPages }  from '@/hooks/useFacebookPages'
import { PublishedPostCard } from '@/components/published/PublishedPostCard'
import { PublishedPostDetailSheet } from '@/components/published/PublishedPostDetailSheet'
import type { PublishedPost } from '@/lib/api/types'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'

export default function PublishedPage() {
  const [selected, setSelected] = useState<PublishedPost | null>(null)

    const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  
    // Chargement des organisations
    const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
    const organisations = orgData?.items ?? []
  
    const orgId = selectedOrgId || organisations[0]?.id || ''

  const { data: posts  = [], isLoading } = usePublishedPosts(orgId)
  const { data: pages  = [] }            = useFacebookPages(orgId)
  const syncMutation   = useSyncMetrics(orgId)
  const deleteMutation = useDeletePublishedPost(orgId)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">Posts publiés</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {posts.length} publication{posts.length > 1 ? 's' : ''}
        </p>
      </div>
      <OrganisationSelector
        value={selectedOrgId}
        onChange={setSelectedOrgId}
      />


      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Aucun post publié</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Vos posts publiés apparaîtront ici.</p>
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
            />
          ))}
        </div>
      )}

      {/* ✅ Sheet aussi dans un wrapper qui hydrate scheduledPost */}
      {selected && (
        <PublishedPostDetailSheetWrapper
          post={selected}
          pages={pages}
          onClose={() => setSelected(null)}
          onSync={() => syncMutation.mutate(selected.id)}
          onDelete={() => deleteMutation.mutate(selected.id)}
          isSyncing={syncMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  )
}

// ── Wrapper carte ─────────────────────────────────────────────────────────────
function PublishedPostCardWrapper({
  post, pages, onSync, isSyncing, onClick
}: {
  post: PublishedPost
  pages: any[]
  onSync: () => void
  isSyncing?: boolean
  onClick: () => void
}) {
  const { data: scheduledPost } = useScheduledPost(post.scheduled_post_id)
  const page = pages.find(p => p.id === post.facebook_page_id)

  return (
    <PublishedPostCard
      post={post}
      scheduledPost={scheduledPost}
      page={page}
      onSyncMetrics={onSync}
      isSyncing={isSyncing}
      onClick={onClick}
    />
  )
}

// ── Wrapper sheet — hydrate scheduledPost au même niveau ──────────────────────
function PublishedPostDetailSheetWrapper({
  post, pages, onClose, onSync, onDelete, isSyncing, isDeleting
}: {
  post: PublishedPost
  pages: any[]
  onClose: () => void
  onSync: () => void
  onDelete: () => void
  isSyncing?: boolean
  isDeleting?: boolean
}) {
 
  const { data: scheduledPost } = useScheduledPost(post.scheduled_post_id)
  const page = pages.find(p => p.id === post.facebook_page_id)

  return (
    <PublishedPostDetailSheet
      open
      onClose={onClose}
      post={post}
      scheduledPost={scheduledPost}  
      page={page}
      onSyncMetrics={onSync}
      onDelete={onDelete}
      isSyncing={isSyncing}
      isDeleting={isDeleting}
    />
  )
}
