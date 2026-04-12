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

export function UserCard({
  user, plans, isSelf,
  isPromoting, isDemoting,
  onPromote, onDemote, onDelete,
}: Props) {
  const planName = resolvePlanName(user.plan_id, plans)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar name={user.name} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">
              {user.name}
              {isSelf && <span className="ml-2 text-xs text-slate-400">(vous)</span>}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <UserRoleBadge isAdmin={user.is_admin} />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <UserStatusBadge isActive={user.is_active} />
        <span className="text-xs text-slate-500">
          {planName ?? <span className="text-slate-400">Gratuit</span>}
        </span>
      </div>

      {/* Actions */}
      {!isSelf && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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