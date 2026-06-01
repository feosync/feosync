import { useScheduledPost } from '@/hooks/useScheduledPosts'
import { usePublishedPosts } from '@/hooks/usePublishedPosts'
import { PublishedPostDetailSheet } from '@/components/published/PublishedPostDetailSheet'
import type { AutoCommentRequest } from '@/lib/api/types'

interface PublishedSheetFromScheduledProps {
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
}

export function PublishedSheetFromScheduled({
  scheduledPostId, orgId, pages, onClose,
  onSync, onDelete, isSyncing, isDeleting,
  onAutoComment, isAutoCommenting,
}: PublishedSheetFromScheduledProps) {
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