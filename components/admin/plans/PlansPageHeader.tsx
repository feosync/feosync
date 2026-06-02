import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'

interface Props {
  count: number
  onCreate: () => void
}

export function PlansPageHeader({ count, onCreate }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className=" p-2 bg-muted/50 rounded-lg">
          <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Gestion des plans
          </h1>
          <p className="text-sm text-muted-foreground">
            {count} plan{count > 1 ? 's' : ''} configuré{count > 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <Button onClick={onCreate} size="sm">
        <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
        Nouveau plan
      </Button>
    </div>
  )
}