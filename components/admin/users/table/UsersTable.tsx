'use client'

import type { Plan, UserSummary } from '@/lib/api/types'
import { UsersDesktopTable } from './UsersDesktopTable'
import { UsersMobileList } from './UsersMobileList'

interface Props {
  users: UserSummary[]
  plans: Plan[]
  currentUserId: string | undefined
  isLoading: boolean
  isFetching: boolean
  isPromoting: boolean
  isDemoting: boolean
  onPromote: (id: string) => void
  onDemote: (id: string) => void
  onDelete: (user: UserSummary) => void
}

export function UsersTable({
  users, plans, currentUserId,
  isLoading, isFetching,
  isPromoting, isDemoting,
  onPromote, onDemote, onDelete,
}: Props) {
  const sharedProps = {
    users,
    plans,
    currentUserId,
    isPromoting,
    isDemoting,
    onPromote,
    onDemote,
    onDelete,
  }

  return (
    <div className={` overflow-hidden transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
      <UsersDesktopTable isLoading={isLoading} {...sharedProps} />
      <UsersMobileList {...sharedProps} />
    </div>
  )
}