import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { FacebookPage } from '@/lib/api/types'
import { PageRowActions } from './PageRowActions'

interface Props {
  page: FacebookPage
  insightsExpanded: boolean
  onToggleInsights: () => void
  onToggle: () => void
  onDelete: () => void
  onSyncInsights: () => void
  isToggling?: boolean
  isDeleting?: boolean
  isSyncing?: boolean
}

export function PagesDesktopRow({
  page, insightsExpanded,
  onToggleInsights, onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing,
}: Props) {
  return (
    <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
      <TableCell>
        <div className="flex items-center gap-2.5">
          <FacebookIcon />
          <span className="font-medium text-slate-900 dark:text-white">{page.page_name}</span>
        </div>
      </TableCell>

      <TableCell>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{page.fb_page_id}</span>
      </TableCell>

      <TableCell>
        <PageStatusBadge isActive={page.is_active} />
      </TableCell>

      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
        {page.last_sync_at
          ? format(new Date(page.last_sync_at), 'd MMM yyyy HH:mm', { locale: fr })
          : '—'}
      </TableCell>

      <TableCell className="text-right">
        <PageRowActions
          page={page}
          insightsExpanded={insightsExpanded}
          onToggleInsights={onToggleInsights}
          onToggle={onToggle}
          onDelete={onDelete}
          onSyncInsights={onSyncInsights}
          isToggling={isToggling}
          isDeleting={isDeleting}
          isSyncing={isSyncing}
        />
      </TableCell>
    </TableRow>
  )
}

// ── Sous-composants visuels ───────────────────────────────────────────────────

export function FacebookIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      f
    </div>
  )
}

export function PageStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge className={
      isActive
        ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-0'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0'
    }>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}