import type { Plan } from '@/lib/api/types'
import { PlanStatusBadge } from './PlanStatusBadge'
import { PlanRowActions } from './PlanRowActions'
import { fmtPrice } from './utils'

interface Props {
  plan: Plan
  onEdit: () => void
  onDelete: () => void
}

function PlanStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function PlanCard({ plan, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{plan.name}</p>
          <p className="text-sm font-mono text-muted-foreground mt-0.5">{fmtPrice(plan.price)}</p>
        </div>
        <PlanStatusBadge isActive={plan.is_active} />
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border">
        <PlanStat label="Organisations" value={plan.max_org} />
        <PlanStat label="Posts / mois"  value={plan.max_post_month} />
        <PlanStat label="Légendes IA"   value={plan.max_ai_caption} />
        <PlanStat label="Images IA"     value={plan.max_ai_image} />
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <PlanRowActions plan={plan} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}