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
    <div className="hidden md:block rounded-sm border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {['Utilisateur', 'Email', 'Statut', 'Rôle', 'Plan'].map(col => (
              <TableHead
                key={col}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {col}
              </TableHead>
            ))}
            <TableHead className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <UsersTableSkeleton />
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-16 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground">
                    Aucun utilisateur trouvé
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Modifiez vos filtres ou invitez un nouvel utilisateur.
                  </p>
                </div>
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