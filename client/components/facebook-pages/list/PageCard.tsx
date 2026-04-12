'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { FacebookPage } from '@/lib/api/types'
import { InsightsPanel } from '@/components/facebook-pages/InsightsPanel'
import { PageRowActions } from './PageRowActions'
import { FacebookIcon, PageStatusBadge } from './PagesDesktopRow'
import { useExpandedInsights } from './useExpandedInsights'

interface Props {
  page: FacebookPage
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <FacebookIcon />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{page.page_name}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{page.fb_page_id}</p>
          </div>
        </div>
        <PageStatusBadge isActive={page.is_active} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
        <span className="text-xs text-slate-400 dark:text-slate-500">
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
        <div className="border-t border-slate-100 dark:border-slate-800">
          <InsightsPanel pageId={page.id} orgId={orgId} />
        </div>
      )}
    </div>
  )
}