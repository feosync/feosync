import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/posts/EmptyState'
import type { PostStatus, ScheduledPost } from '@/lib/api/types'

const PAGE_SIZE = 3

interface PostsGridProps {
  posts: ScheduledPost[]
  isLoading: boolean
  isFetching: boolean
  activeTab: PostStatus | 'all'
  onPostClick: (post: ScheduledPost) => void
  onPostDelete: (id: string) => void
  onCreateClick: () => void
}

export function PostsGrid({
  posts, isLoading, isFetching,
  activeTab, onPostClick, onPostDelete, onCreateClick,
}: PostsGridProps) {
  return (
    <div className={cn('transition-opacity', isFetching && !isLoading ? 'opacity-60' : 'opacity-100')}>
      {isLoading ? (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState status={activeTab} onCreateClick={onCreateClick} />
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => onPostClick(post)}
              onDelete={() => onPostDelete(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}