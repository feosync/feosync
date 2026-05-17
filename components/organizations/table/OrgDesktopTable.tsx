import {
  Table, TableBody, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Organisation } from '@/lib/api/types'
import { OrgDesktopRow } from './OrgDesktopRow'

interface Props {
  organisations: Organisation[]
  onView: (org: Organisation) => void
  onEdit: (org: Organisation) => void
  onDelete: (org: Organisation) => void
}

export function OrgDesktopTable({ organisations, onView, onEdit, onDelete }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900">
            {['Organisation', 'Secteur', 'Ton', 'Couleur', 'Créée le'].map(col => (
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
          {organisations.map(org => (
            <OrgDesktopRow
              key={org.id}
              org={org}
              onView={() => onView(org)}
              onEdit={() => onEdit(org)}
              onDelete={() => onDelete(org)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}