import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faShield, faTrash } from '@fortawesome/free-solid-svg-icons'
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
          <FontAwesomeIcon icon={faShield} className="w-3 h-3 mr-1" />
          Rétrograder
        </Button>
      ) : (
        <Button
          size="sm" variant="outline"
          className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950"
          onClick={onPromote}
          disabled={isPromoting}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
          Promouvoir
        </Button>
      )}

      <Button
        size="sm" variant="outline"
        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
        onClick={onDelete}
      >
        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
      </Button>
    </div>
  )
}