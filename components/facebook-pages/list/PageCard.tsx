'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { FacebookPage, FacebookPageResponse } from '@/lib/api/types'
import { InsightsPanel } from '@/components/facebook-pages/InsightsPanel'
import { PageRowActions } from './PageRowActions'
import { FacebookIcon, PageStatusBadge } from './PagesDesktopRow'
import { useExpandedInsights } from './useExpandedInsights'

interface Props {
  page: FacebookPageResponse
  orgId: string
  onToggle: () => void
  onDelete: () => void
  onSyncInsights: () => void
  isToggling?: boolean
  isDeleting?: boolean
  isSyncing?: boolean
}

export function PageCard({
  page, orgId,
  onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing,
}: Props) {
  const { expandedId, toggle } = useExpandedInsights()
  const insightsExpanded = expandedId === page.id

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <FacebookIcon />
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{page.page_name}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{page.fb_page_id}</p>
          </div>
        </div>
        <PageStatusBadge isActive={page.is_active} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground ">
          {page.last_sync_at
            ? `Sync : ${format(new Date(page.last_sync_at), 'd MMM yyyy HH:mm', { locale: fr })}`
            : 'Jamais synchronisée'}
        </span>
        <PageRowActions
          page={page}
          insightsExpanded={insightsExpanded}
          onToggleInsights={() => toggle(page.id)}
          onToggle={onToggle}
          onDelete={onDelete}
          onSyncInsights={onSyncInsights}
          isToggling={isToggling}
          isDeleting={isDeleting}
          isSyncing={isSyncing}
        />
      </div>

      {/* Insights expandable */}
      {insightsExpanded && (
        <div className="border-t border-border">
          <InsightsPanel pageId={page.id} orgId={orgId} />
        </div>
      )}
    </div>
  )
}