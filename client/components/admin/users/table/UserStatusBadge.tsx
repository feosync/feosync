import { Badge } from '@/components/ui/badge'

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
      {isActive ? 'Actif' : 'Inactif'}
    </Badge>
  )
}