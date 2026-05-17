import { CreditCard, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  count: number
  onCreate: () => void
}

export function PlansPageHeader({ count, onCreate }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
          <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Gestion des plans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {count} plan{count > 1 ? 's' : ''} configuré{count > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <Button onClick={onCreate} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Nouveau plan
      </Button>
    </div>
  )
}