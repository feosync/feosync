import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostsHeaderProps {
  total: number
  search: string
  onCreateClick: () => void
}

export function PostsHeader({ total, search, onCreateClick }: PostsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-medium text-foreground">Posts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {total} publication{total > 1 ? 's' : ''}
          {search && ` pour "${search}"`}
        </p>
      </div>
      <Button onClick={onCreateClick} className="shrink-0 gap-1.5">
        <Plus className="w-4 h-4" />
        <span>Nouveau post</span>
      </Button>
    </div>
  )
}