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
    <TableRow className="hover:bg-accent transition-colors">
      <TableCell className="font-medium text-foreground">
        {plan.name}
      </TableCell>
      <TableCell className="text-sm font-mono text-foreground">
        {fmtPrice(plan.price)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{plan.max_org}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{plan.max_post_month}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{plan.max_ai_caption}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{plan.max_ai_image}</TableCell>
      <TableCell>
        <PlanStatusBadge isActive={plan.is_active} />
      </TableCell>
      <TableCell>
        <PlanRowActions plan={plan} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}