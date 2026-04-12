import { Fragment } from 'react'
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from '@/components/ui/table'
import { InsightsPanel } from '@/components/facebook-pages/InsightsPanel'
import { PagesDesktopRow } from './PagesDesktopRow'
import type { FacebookPage } from '@/lib/api/types'
import { useExpandedInsights } from './useExpandedInsights'

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

export function PagesDesktopTable({
  pages, orgId, onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing,
}: Props) {
  const { expandedId, toggle } = useExpandedInsights()

  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
            {['Page', 'ID Facebook', 'Statut', 'Dernière sync'].map(col => (
              <TableHead key={col} className="text-slate-600 dark:text-slate-400 font-medium">
                {col}
              </TableHead>
            ))}
            <TableHead className="text-right text-slate-600 dark:text-slate-400 font-medium">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map(page => (
            <Fragment key={page.id}>
              <PagesDesktopRow
                page={page}
                insightsExpanded={expandedId === page.id}
                onToggleInsights={() => toggle(page.id)}
                onToggle={() => onToggle(page)}
                onDelete={() => onDelete(page)}
                onSyncInsights={() => onSyncInsights(page.id)}
                isToggling={isToggling}
                isDeleting={isDeleting}
                isSyncing={isSyncing}
              />

              {expandedId === page.id && (
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/30">
                  <TableCell colSpan={5} className="p-0">
                    <InsightsPanel pageId={page.id} orgId={orgId} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}