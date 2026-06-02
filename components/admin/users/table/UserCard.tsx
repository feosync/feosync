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

export function UserCard({
  user, plans, isSelf,
  isPromoting, isDemoting,
  onPromote, onDemote, onDelete,
}: Props) {
  const planName = user ? resolvePlanName(user?.plan_id, plans) : ''

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-4 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar name={user.name} />
          <div className="min-w-0">
            <p className="font-semibold text-card-foreground truncate text-sm">
              {user.name}
              {isSelf && (
                <span className="ml-2 text-xs text-muted-foreground">(vous)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <UserRoleBadge isAdmin={user.is_admin} />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <UserStatusBadge isActive={user.is_active} />
        <span className="text-xs text-muted-foreground">
          {planName || 'Gratuit'}
        </span>
      </div>

      {/* Actions */}
      {!isSelf && (
        <div className="mt-3 pt-3 border-t border-border">
          <UserRowActions
            user={user}
            isPromoting={isPromoting}
            isDemoting={isDemoting}
            onPromote={onPromote}
            onDemote={onDemote}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}