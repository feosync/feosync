import type { FacebookPage, FacebookPageResponse } from '@/lib/api/types'
import { PageCard } from './PageCard'

interface Props {
  pages: FacebookPageResponse[]
  orgId: string
  onToggle: (page: FacebookPageResponse) => void
  onDelete: (page: FacebookPageResponse) => void
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