import { TableCell, TableRow } from '@/components/ui/table'
import type { Plan } from '@/lib/api/types'
import { PlanStatusBadge } from './PlanStatusBadge'
import { PlanRowActions } from './PlanRowActions'
import { fmtPrice } from './utils'

interface Props {
  plan: Plan
  onEdit: () => void
  onDelete: () => void
}

export function PlansDesktopRow({ plan, onEdit, onDelete }: Props) {
  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
      <TableCell className="font-medium text-slate-900 dark:text-slate-100">
        {plan.name}
      </TableCell>
      <TableCell className="text-sm font-mono">
        {fmtPrice(plan.price)}
      </TableCell>
      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {plan.max_org}
      </TableCell>
      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {plan.max_post_month}
      </TableCell>
      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {plan.max_ai_caption}
      </TableCell>
      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {plan.max_ai_image}
      </TableCell>
      <TableCell>
        <PlanStatusBadge isActive={plan.is_active} />
      </TableCell>
      <TableCell>
        <PlanRowActions plan={plan} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}