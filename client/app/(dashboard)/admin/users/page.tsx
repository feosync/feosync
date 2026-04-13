'use client'

import { useState, useCallback } from 'react'
import { Search, Users, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { useAdminUsers, useAdminPromoteUser, useAdminDemoteUser, useAdminDeleteUser } from '@/hooks/useAdminUsers'
import { UsersTable } from '@/components/admin/users/table/UsersTable'
import { UsersPagination } from '@/components/admin/users/UsersPagination'
import { DeleteUserDialog } from  '@/components/admin/users/DeleteUserDialog'
import type { UserSummary } from '@/lib/api/types'
import { useAdminAllPlans } from '@/hooks/usePlans'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 10

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)
  const [toDelete, setToDelete] = useState<UserSummary | null>(null)

  const { data, isLoading, isFetching } = useAdminUsers({ page, page_size: PAGE_SIZE, search })
  const users = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  const promote = useAdminPromoteUser()
  const demote = useAdminDemoteUser()
  const deleteUser = useAdminDeleteUser()
  const { data: plans = [] } = useAdminAllPlans() 

  

  const handleSearch = useCallback((v: string) => {
    setSearchInput(v)
    setPage(1)
  }, [])

  const handleDelete = (id: string) => {
    deleteUser.mutate(id)
    setToDelete(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
          <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} utilisateur{total > 1 ? 's' : ''}
            {search && ` pour "${search}"`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        placeholder="Rechercher par nom ou email…"
        value={searchInput}
        onChange={e => handleSearch(e.target.value)}
        className="pl-9 pr-9"
      />
      {searchInput && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleSearch('')}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>

      <UsersTable
        users={users}
         plans={plans} 
        currentUserId={currentUser?.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isPromoting={promote.isPending}
        isDemoting={demote.isPending}
        onPromote={id => promote.mutate(id)}
        onDemote={id => demote.mutate(id)}
        onDelete={setToDelete}
      />

      <UsersPagination
        page={page}
        totalPages={totalPages}
        total={total}
        isFetching={isFetching}
        onPageChange={setPage}
      />

      <DeleteUserDialog
        user={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}