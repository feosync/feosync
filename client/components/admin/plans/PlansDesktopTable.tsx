import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Plan } from '@/lib/api/types'
import { PlansDesktopRow } from './PlansDesktopRow'

const COLUMNS = [
  'Nom', 'Prix', 'Organisations', 'Posts/mois',
  'Légendes IA', 'Images IA', 'Statut',
]

interface Props {
  plans: Plan[]
  isLoading: boolean
  onEdit: (plan: Plan) => void
  onDelete: (plan: Plan) => void
}

export function PlansDesktopTable({ plans, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="hidden md:block rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900">
            {COLUMNS.map(col => (
              <TableHead key={col}>{col}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                Aucun plan configuré
              </TableCell>
            </TableRow>
          ) : (
            plans.map(plan => (
              <PlansDesktopRow
                key={plan.id}
                plan={plan}
                onEdit={() => onEdit(plan)}
                onDelete={() => onDelete(plan)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}