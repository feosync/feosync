import { Button } from '@/components/ui/button'
import { ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import type { UserSummary } from '@/lib/api/types'

interface Props {
  user: UserSummary
  isPromoting?: boolean
  isDemoting?: boolean
  onPromote: () => void
  onDemote: () => void
  onDelete: () => void
}

export function UserRowActions({
  user, isPromoting, isDemoting, onPromote, onDemote, onDelete,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-2">
      {user.is_admin ? (
        <Button
          size="sm" variant="outline"
          className="h-7 text-xs"
          onClick={onDemote}
          disabled={isDemoting}
        >
          <ShieldOff className="w-3 h-3 mr-1" />
          Rétrograder
        </Button>
      ) : (
        <Button
          size="sm" variant="outline"
          className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950"
          onClick={onPromote}
          disabled={isPromoting}
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          Promouvoir
        </Button>
      )}

      <Button
        size="sm" variant="outline"
        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
        onClick={onDelete}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  )
}