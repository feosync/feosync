import { ShieldCheck, ShieldOff, Trash2, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { UsersTableSkeleton } from './UsersTableSkeleton'
import type { UserSummary } from '@/lib/api/types'

interface Props {
  users: UserSummary[]
  currentUserId: string | undefined
  isLoading: boolean
  isFetching: boolean
  isPromoting: boolean
  isDemoting: boolean
  onPromote: (id: string) => void
  onDemote: (id: string) => void
  onDelete: (user: UserSummary) => void
}

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export function UsersTable({
  users, currentUserId, isLoading, isFetching,
  isPromoting, isDemoting, onPromote, onDemote, onDelete,
}: Props) {
  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900">
            <TableHead>Utilisateur</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Plan</TableHead>
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
            users.map(u => {
              const isSelf = u.id === currentUserId
              return (
                <TableRow key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {u.name}
                        {isSelf && <span className="ml-2 text-xs text-slate-400">(vous)</span>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.is_active ? 'default' : 'secondary'} className="text-xs">
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_admin ? (
                      <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                        <ShieldAlert className="w-3 h-3 mr-1" />Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Utilisateur</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {u.plan_id ? `Plan #${u.plan_id}` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {!isSelf && (
                        <>
                          {u.is_admin ? (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => onDemote(u.id)} disabled={isDemoting}>
                              <ShieldOff className="w-3 h-3 mr-1" />Rétrograder
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline"
                              className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950"
                              onClick={() => onPromote(u.id)} disabled={isPromoting}>
                              <ShieldCheck className="w-3 h-3 mr-1" />Promouvoir
                            </Button>
                          )}
                          <Button size="sm" variant="outline"
                            className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => onDelete(u)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}