import { Badge } from '@/components/ui/badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function UserRoleBadge({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    return (
      <Badge className="text-xs bg-warning/10 text-warning border-warning/30">
        {/* <FontAwesomeIcon icon={faShieldAlert} className="w-3 h-3 mr-1" /> */}
        Admin
      </Badge>
    )
  }
  return <Badge variant="outline" className="text-xs">Utilisateur</Badge>
}