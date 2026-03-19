'use client'

import { useState } from 'react'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { OrgDialog } from '@/components/organizations/OrgDialog'
import { OrgTable } from '@/components/organizations/OrgTable'
import {
  useOrganisations,
  useCreateOrganisation,
  useUpdateOrganisation,
  useDeleteOrganisation,
} from '@/hooks/useOrganisations'
import type { Organisation, CreateOrgRequest } from '@/lib/api/types'

export default function OrganisationsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organisation | null>(null)

  const { data: organisations = [], isLoading } = useOrganisations()
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
    setEditingOrg(null)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">
            Organisations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Gérez vos organisations et leurs paramètres
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nouvelle organisation
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : organisations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            Aucune organisation
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Créez votre première organisation pour commencer
          </p>
          <Button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Créer une organisation
          </Button>
        </div>
      ) : (
        <OrgTable
          organisations={organisations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}

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
