import { TableCell, TableRow } from '@/components/ui/table'
import type { Plan, UserSummary } from '@/lib/api/types'
import { UserAvatar } from './UserAvatar'
import { UserStatusBadge } from './UserStatusBadge'
import { UserRoleBadge } from './UserRoleBadge'
import { UserRowActions } from './UserRowActions'
import { resolvePlanName } from './utils'

interface Props {
  user: UserSummary
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
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar name={user.name} />
          <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
            {user.name}
            {isSelf && <span className="ml-2 text-xs text-slate-400">(vous)</span>}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
        {user.email}
      </TableCell>

      <TableCell>
        <UserStatusBadge isActive={user.is_active} />
      </TableCell>

      <TableCell>
        <UserRoleBadge isAdmin={user.is_admin} />
      </TableCell>

      <TableCell className="text-sm text-slate-500">
        {planName ?? <span className="text-slate-400 text-xs">Gratuit</span>}
      </TableCell>

      <TableCell>
        {!isSelf && (
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