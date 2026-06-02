import { TableCell, TableRow } from '@/components/ui/table'
import type { Plan, UserSummary } from '@/lib/api/types'
import { UserAvatar } from './UserAvatar'
import { UserStatusBadge } from './UserStatusBadge'
import { UserRoleBadge } from './UserRoleBadge'
import { UserRowActions } from './UserRowActions'
import { resolvePlanName } from './utils'

interface Props {
  user: UserSummary | any
  plans: Plan[]
  isSelf: boolean
  isPromoting?: boolean
  isDemoting?: boolean
  onPromote: () => void
  onDemote: () => void
  onDelete: () => void
}

export function UsersDesktopRow({
  user, plans, isSelf,
  isPromoting, isDemoting,
  onPromote, onDemote, onDelete,
}: Props) {
  const planName = resolvePlanName(user.plan_id, plans)

  return (
    <TableRow className="hover:bg-accent transition-colors">
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} />
          <span className="font-medium text-foreground text-sm">
            {user.name}
            {isSelf && (
              <span className="ml-2 text-xs text-muted-foreground">(vous)</span>
            )}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {user.email}
      </TableCell>

      <TableCell>
        <UserStatusBadge isActive={user.is_active} />
      </TableCell>

      <TableCell>
        <UserRoleBadge isAdmin={user.is_admin} />
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">
        {planName || 'Gratuit'}
      </TableCell>

      <TableCell>
        {isSelf && (
          <UserRowActions
            user={user}
            isPromoting={isPromoting}
            isDemoting={isDemoting}
            onPromote={onPromote}
            onDemote={onDemote}
            onDelete={onDelete}
          />
        )}
      </TableCell>
    </TableRow>
  )
}