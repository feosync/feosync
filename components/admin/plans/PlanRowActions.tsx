import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Plan } from '@/lib/api/types'

interface Props {
  plan: Plan
  onEdit: () => void
  onDelete: () => void
}

export function PlanRowActions({ onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm" variant="outline"
        className="h-7 text-xs"
        onClick={onEdit}
      >
        <Pencil className="w-3 h-3 mr-1" />
        Modifier
      </Button>
      <Button
        size="sm" variant="outline"
        className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  )
}