import { Fragment } from 'react'
import {
  Table, TableBody, TableHead, TableHeader, TableRow, TableCell,
} from '@/components/ui/table'
import { InsightsPanel } from '@/components/facebook-pages/InsightsPanel'
import { PagesDesktopRow } from './PagesDesktopRow'
import type { FacebookPage, FacebookPageResponse } from '@/lib/api/types'
import { useExpandedInsights } from './useExpandedInsights'

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

export function PagesDesktopTable({
  pages, orgId, onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing,
}: Props) {
  const { expandedId, toggle } = useExpandedInsights()

  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {['Page', 'ID Facebook', 'Statut', 'Dernière sync'].map(col => (
              <TableHead
                key={col}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {col}
              </TableHead>
            ))}
            <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                <TableRow className="bg-muted/30 hover:bg-muted/30">
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