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
    <div className="hidden md:block rounded-sm border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {COLUMNS.map(col => (
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
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i} className="border-border">
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full rounded-md" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground">
                    Aucun plan configuré
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Créez votre premier plan pour commencer.
                  </p>
                </div>
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