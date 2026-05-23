import { Badge } from '@/components/ui/badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function UserRoleBadge({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800">
        {/* <FontAwesomeIcon icon={faShieldAlert} className="w-3 h-3 mr-1" /> */}
        Admin
      </Badge>
    )
  }
  return <Badge variant="outline" className="text-xs">Utilisateur</Badge>
}