'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldOff, Trash2, Search, ShieldAlert, Users } from 'lucide-react'
import { useAdminUsers, useAdminPromoteUser, useAdminDemoteUser, useAdminDeleteUser } from '@/hooks/useAdminUsers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { UserSummary } from '@/lib/api/types'
import { useAuth } from '@/hooks/useAuth'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const { data: users = [], isLoading } = useAdminUsers()
  const promote = useAdminPromoteUser()
  const demote = useAdminDemoteUser()
  const deleteUser = useAdminDeleteUser()

  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState<UserSummary | null>(null)

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Gestion des utilisateurs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
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
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(u => {
                const isSelf = u.id === currentUser?.id
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
                          {isSelf && (
                            <span className="ml-2 text-xs text-slate-400">(vous)</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? 'default' : 'secondary'} className="text-xs">
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.is_admin ? (
                        <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Utilisateur
                        </Badge>
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
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => demote.mutate(u.id)}
                                disabled={demote.isPending}
                              >
                                <ShieldOff className="w-3 h-3 mr-1" />
                                Rétrograder
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950"
                                onClick={() => promote.mutate(u.id)}
                                disabled={promote.isPending}
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Promouvoir
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => setToDelete(u)}
                            >
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

      {/* Delete confirm dialog */}
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'utilisateur{' '}
              <span className="font-semibold">{toDelete?.name}</span> ({toDelete?.email}) sera
              définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (toDelete) {
                  deleteUser.mutate(toDelete.id)
                  setToDelete(null)
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}