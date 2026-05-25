import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Organisation } from '@/lib/api/types'
import { OrgActionsMenu } from './OrgActionsMenu'
import { sectorLabels, toneLabels } from './labels'
import { ManageSocialMedia } from './socialMedia'
import { useState } from 'react'

interface Props {
  org: Organisation
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function OrgDesktopRow({ org, onView, onEdit, onDelete }: Props) {
    const [open, setOpen] = useState(false);

  return (
    <TableRow
      onClick={onView}
      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
    >
      <TableCell>
        <div className="flex items-center gap-2.5">
          {org.brand_color && (
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: org.brand_color }} />
          )}
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{org.name}</p>
            {org.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
                {org.description}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0 text-xs">
          {sectorLabels[org.sector] || org.sector}
        </Badge>
      </TableCell>

      <TableCell>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {toneLabels[org.tone] || org.tone}
        </span>
      </TableCell>

      <TableCell>
        {org.brand_color ? (
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"
              style={{ backgroundColor: org.brand_color }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {org.brand_color}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </TableCell>

      <TableCell className="text-sm text-slate-500 dark:text-slate-400">
        {format(new Date(org.created_at), 'd MMM yyyy', { locale: fr })}
      </TableCell>

      <TableCell className="text-right">
        <div onClick={e => e.stopPropagation()}>
          <OrgActionsMenu org={org} onEdit={onEdit} onDelete={onDelete} />
        </div>
        <ManageSocialMedia  key={`${org.id}+4`} open={open} onOpenChange={setOpen} orgId={org.id} />

      </TableCell>
    </TableRow>
  )
}