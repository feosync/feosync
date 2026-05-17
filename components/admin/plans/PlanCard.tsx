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
      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  )
}

export function PlanCard({ plan, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{plan.name}</p>
          <p className="text-sm font-mono text-slate-500 mt-0.5">{fmtPrice(plan.price)}</p>
        </div>
        <PlanStatusBadge isActive={plan.is_active} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <PlanStat label="Organisations"  value={plan.max_org} />
        <PlanStat label="Posts / mois"   value={plan.max_post_month} />
        <PlanStat label="Légendes IA"    value={plan.max_ai_caption} />
        <PlanStat label="Images IA"      value={plan.max_ai_image} />
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <PlanRowActions plan={plan} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}