import type { FacebookPage } from '@/lib/api/types'
import { PageCard } from './PageCard'

interface Props {
  pages: FacebookPage[]
  orgId: string
  onToggle: (page: FacebookPage) => void
  onDelete: (page: FacebookPage) => void
  onSyncInsights: (pageId: string) => void
  isToggling?: boolean
  isDeleting?: boolean
  isSyncing?: boolean
}

export function PagesMobileList({
  pages, orgId, onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing,
}: Props) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {pages.map(page => (
        <PageCard
          key={page.id}
          page={page}
          orgId={orgId}
          onToggle={() => onToggle(page)}
          onDelete={() => onDelete(page)}
          onSyncInsights={() => onSyncInsights(page.id)}
          isToggling={isToggling}
          isDeleting={isDeleting}
          isSyncing={isSyncing}
        />
      ))}
    </div>
  )
}