import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { UsersTableSkeleton } from '../UsersTableSkeleton'
import { UsersDesktopRow } from './UsersDesktopRow'
import type { Plan, UserSummary } from '@/lib/api/types'

interface Props {
  users: UserSummary[]
  plans: Plan[]
  currentUserId: string | undefined
  isLoading: boolean
  isPromoting?: boolean
  isDemoting?: boolean
  onPromote: (id: string) => void
  onDemote: (id: string) => void
  onDelete: (user: UserSummary) => void
}

export function UsersDesktopTable({
  users, plans, currentUserId, isLoading,
  isPromoting, isDemoting,
  onPromote, onDemote, onDelete,
}: Props) {
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900">
            {['Utilisateur', 'Email', 'Statut', 'Rôle', 'Plan'].map(col => (
              <TableHead key={col}>{col}</TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <UsersTableSkeleton />
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          ) : (
            users.map(user => (
              <UsersDesktopRow
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}