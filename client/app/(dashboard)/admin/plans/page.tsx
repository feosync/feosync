'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard, Check } from 'lucide-react'
import {
  useAdminAllPlans,
  useAdminDeletePlan,
} from '@/hooks/usePlans'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type { Plan } from '@/lib/api/types'
import { PlanDialog } from '@/components/admin/plans/PlanDialog'


// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPlansPage() {
  const { data: plans = [], isLoading } = useAdminAllPlans()
  const deletePlan = useAdminDeletePlan()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | undefined>()
  const [toDelete, setToDelete] = useState<Plan | null>(null)

  const openCreate = () => { setEditing(undefined); setDialogOpen(true) }
  const openEdit = (p: Plan) => { setEditing(p); setDialogOpen(true) }
  const closeDialog = () => { setDialogOpen(false); setEditing(undefined) }

  const fmt = (n: number | undefined | null) => 
  (n ?? 0).toLocaleString('fr-MG') + ' Ar'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
            <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Gestion des plans
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {plans.length} plan{plans.length > 1 ? 's' : ''} configuré{plans.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau plan
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900">
              <TableHead>Nom</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Posts/mois</TableHead>
              <TableHead>IA</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  Aucun plan configuré
                </TableCell>
              </TableRow>
            ) : (
              plans.map(p => (
                <TableRow key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {fmt(p?.price)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {p.max_page}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {p.max_post_month}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {p.max_ai_gen}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.is_active ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => setToDelete(p)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Plan dialog */}
      {dialogOpen && (
        <PlanDialog open={dialogOpen} onClose={closeDialog} initial={editing} />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le plan ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le plan <span className="font-semibold">{toDelete?.name}</span> sera définitivement
              supprimé. Les utilisateurs abonnés à ce plan seront affectés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (toDelete) {
                  deletePlan.mutate(String(toDelete.id))
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