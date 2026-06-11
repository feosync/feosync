import type { Plan, UserSummary } from '@/lib/api/types'
import { UserCard } from './UserCard'

interface Props {
  users: UserSummary[]
  plans: Plan[]
  currentUserId: string | undefined
  isPromoting?: boolean
  isDemoting?: boolean
  onPromote: (id: string) => void
  onDemote: (id: string) => void
  onDelete: (user: UserSummary) => void
}

export function UsersMobileList({
  users, plans, currentUserId,
  isPromoting, isDemoting,
  onPromote, onDemote, onDelete,
}: Props) {
  if (users.length === 0) {
    return (
      <p className="text-center py-12 text-muted-foreground md:hidden">
        Aucun utilisateur trouvé
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          plans={plans}
          isSelf={user.id === currentUserId}
          isPromoting={isPromoting}
          isDemoting={isDemoting}
          onPromote={() => onPromote(user.id)}
          onDemote={() => onDemote(user.id)}
          onDelete={() => onDelete(user)}
        />
      ))}
    </div>
  )
}