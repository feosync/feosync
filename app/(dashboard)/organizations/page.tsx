'use client'

import { useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faBuilding, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useOrganisations,
  useCreateOrganisation,
  useUpdateOrganisation,
  useDeleteOrganisation,
} from '@/hooks/useOrganisations'
import { OrgTable } from '@/components/organizations/table/OrgTable'
import { OrgPagination } from '@/components/organizations/OrgPagination'
import { OrgDialog } from '@/components/organizations/OrgDialog'
import type { Organisation, CreateOrgRequest } from '@/lib/api/types'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanCreateOrg } from '@/lib/api/plan-limits'

const PAGE_SIZE = 7

export default function OrganisationsPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebounce(searchInput, 400)

  const { data: userDetail } = useCurrentUserDetail()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null)

  const { data, isLoading, isFetching } = useOrganisations({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
  })

  const organisations = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.total_pages ?? 1

  const createMutation = useCreateOrganisation()
  const updateMutation = useUpdateOrganisation()
  const deleteMutation = useDeleteOrganisation()

  const handleSubmit = async (data: CreateOrgRequest) => {
    if (editingOrg) {
      await updateMutation.mutateAsync({ id: editingOrg.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    setDialogOpen(false)
    setEditingOrg(null)
  }

  const handleEdit = (org: Organisation) => {
    setEditingOrg(org)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleOpenCreate = () => {
    if (!checkCanCreateOrg(userDetail)) return
    setEditingOrg(null)
    setDialogOpen(true)
  }

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value)
    setPage(1)
  }, [])

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-foreground">
            Organisations
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} organisation{total > 1 ? 's' : ''}
            {search && ` pour "${search}"`}
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          Nouvelle organisation
        </Button>
      </div>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        />
        <Input
          placeholder="Rechercher par nom ou description…"
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleSearch('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : organisations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/40 rounded-xl border border-dashed border-border">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
            <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Aucune organisation
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Créez votre première organisation pour commencer
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            Créer une organisation
          </Button>
        </div>
      ) : (
        <>
          <OrgTable
            organisations={organisations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
          <OrgPagination
            page={page}
            totalPages={totalPages}
            total={total}
            isFetching={isFetching}
            onPageChange={setPage}
          />
        </>
      )}

      {/* ── Dialog ────────────────────────────────────────────────────────── */}
      <OrgDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingOrg(null)
        }}
        onSubmit={handleSubmit}
        initialData={editingOrg ?? undefined}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

    </div>
  )
}