'use client'

import { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faUsers, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useAdminUsers, useAdminPromoteUser,
  useAdminDemoteUser, useAdminDeleteUser,
} from '@/hooks/useAdminUsers'
import { UsersTable }      from '@/components/admin/users/table/UsersTable'
import { UsersPagination } from '@/components/admin/users/UsersPagination'
import { DeleteUserDialog } from '@/components/admin/users/DeleteUserDialog'
import { useAdminAllPlans } from '@/hooks/usePlans'
import type { UserSummary } from '@/lib/api/types'

const PAGE_SIZE = 10

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()

  const [page, setPage]               = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [toDelete, setToDelete]       = useState<UserSummary | null>(null)

  const search = useDebounce(searchInput, 400)

  const { data, isLoading, isFetching } = useAdminUsers({ page, page_size: PAGE_SIZE, search })
  const users      = data?.items       ?? []
  const total      = data?.total       ?? 0
  const totalPages = data?.total_pages ?? 1

  const promote    = useAdminPromoteUser()
  const demote     = useAdminDemoteUser()
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
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} utilisateur{total > 1 ? 's' : ''}
            {search && (
              <span> pour <span className="text-foreground font-medium">"{search}"</span></span>
            )}
          </p>
        </div>
      </div>

      {/* ── Recherche ────────────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
        />
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
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7
                       text-muted-foreground hover:text-foreground hover:bg-accent
                       transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* ── Tableau ──────────────────────────────────────────────────────── */}
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

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      <UsersPagination
        page={page}
        totalPages={totalPages}
        total={total}
        isFetching={isFetching}
        onPageChange={setPage}
      />

      {/* ── Dialog suppression ───────────────────────────────────────────── */}
      <DeleteUserDialog
        user={toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

    </div>
  )
}