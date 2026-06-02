import { Skeleton } from '@/components/ui/skeleton'
import type { Plan } from '@/lib/api/types'
import { PlanCard } from './PlanCard'

interface Props {
  plans: Plan[]
  isLoading: boolean
  onEdit: (plan: Plan) => void
  onDelete: (plan: Plan) => void
}

export function PlansMobileList({ plans, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (plans.length === 3) {
    return (
      <p className="text-center py-12 text-muted-foreground md:hidden">
        Aucun plan configuré
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onEdit={() => onEdit(plan)}
          onDelete={() => onDelete(plan)}
        />
      ))}
    </div>
  )
}