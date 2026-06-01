'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useScheduledPosts, useDeleteScheduledPost } from '@/hooks/useScheduledPosts'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { useSyncMetrics, useDeletePublishedPost, useSetAutoComment } from '@/hooks/usePublishedPosts'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanCreatePost } from '@/lib/api/plan-limits'

import { usePostsFilters } from './_hooks/usePostsFilters'
import { PostsHeader }          from './_components/PostsHeader'
import { PostsOrgSelector }     from './_components/PostsOrgSelector'
import { PostsSearchBar }       from './_components/PostsSearchBar'
import { PostsFiltersPanel }    from './_components/PostsFiltersPanel'
import { PostsStatusTabs }      from './_components/PostsStatusTabs'
import { PostsGrid }            from './_components/PostsGrid'
import { PostsPagination }      from './_components/PostsPagination'
import { PublishedSheetFromScheduled } from './_components/PublishedSheetFromScheduled'

const PAGE_SIZE = 3

export default function PostsPage() {
  const router = useRouter()
  const { data: userDetail } = useCurrentUserDetail()

  // Org
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const organisations = orgData?.items ?? []
  const orgId = selectedOrgId || organisations[0]?.id || ''
  const { data: pages = [] } = useFacebookPages(orgId)

  // Sheet publié
  const [publishedSheetScheduledPostId, setPublishedSheetScheduledPostId] = useState<string | null>(null)
  const syncMutation        = useSyncMetrics(orgId)
  const pubDeleteMutation   = useDeletePublishedPost(orgId)
  const autoCommentMutation = useSetAutoComment(orgId)

  // Filtres
  const filters = usePostsFilters()

  // Query
  const { data, isLoading, isFetching } = useScheduledPosts(orgId, {
    page: filters.page,
    page_size: PAGE_SIZE,
    status: filters.activeTab,
    search: filters.search,
    year: filters.year,
    month: filters.month,
    week: filters.week,
  })
  const posts      = data?.items      ?? []
  const total      = data?.total      ?? 0
  const totalPages = data?.total_pages ?? 1

  const deleteMutation = useDeleteScheduledPost(orgId)

  const handleOpenCreatePost = () => {
    if (!checkCanCreatePost(userDetail)) return
    router.push('/posts/new')
  }

  const handlePostClick = (post: any) => {
    if (post.status === 'PUBLISHED') {
      setPublishedSheetScheduledPostId(post.id)
    } else {
      router.push(`/posts/${post.id}`)
    }
  }

  return (
    <div className="space-y-4">

      <PostsHeader
        total={total}
        search={filters.search}
        onCreateClick={handleOpenCreatePost}
      />

      <PostsOrgSelector
        value={selectedOrgId}
        onChange={v => { setSelectedOrgId(v); filters.setPage(1) }}
      />

      <PostsSearchBar
        searchInput={filters.searchInput}
        onSearch={filters.handleSearch}
        filtersOpen={filters.filtersOpen}
        onToggleFilters={() => filters.setFiltersOpen(o => !o)}
        activeFilterCount={filters.activeFilterCount}
      />

      {filters.filtersOpen && (
        <PostsFiltersPanel
          year={filters.year}
          month={filters.month}
          week={filters.week}
          availableWeeks={filters.availableWeeks}
          activeFilterCount={filters.activeFilterCount}
          onYear={filters.handleYear}
          onMonth={filters.handleMonth}
          onWeek={filters.handleWeek}
          onReset={filters.resetFilters}
        />
      )}

      <PostsStatusTabs
        activeTab={filters.activeTab}
        onChange={filters.handleTabChange}
      />

      <PostsGrid
        posts={posts}
        isLoading={isLoading}
        isFetching={isFetching}
        activeTab={filters.activeTab}
        onPostClick={handlePostClick}
        onPostDelete={id => deleteMutation.mutate(id)}
        onCreateClick={handleOpenCreatePost}
      />

      <PostsPagination
        page={filters.page}
        totalPages={totalPages}
        total={total}
        isFetching={isFetching}
        onPageChange={filters.setPage}
      />

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