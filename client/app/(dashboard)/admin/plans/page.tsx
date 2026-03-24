'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, CreditCard, Check } from 'lucide-react'
import {
  useAdminAllPlans,
  useAdminCreatePlan,
  useAdminUpdatePlan,
  useAdminDeletePlan,
} from '@/hooks/usePlans'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import type { Plan, CreatePlanRequest } from '@/lib/api/types'

// ── Form ──────────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreatePlanRequest = {
  name: '',
  price_ariary: 0,
  max_pages: 1,
  max_posts_month: 10,
  max_ai_gen: 5,
  features: {},
  is_active: true,
}

function PlanDialog({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: Plan
}) {
  const create = useAdminCreatePlan()
  const update = useAdminUpdatePlan()
  const isEdit = !!initial

  const [form, setForm] = useState<CreatePlanRequest>(
    initial
      ? {
          name: initial.name,
          price_ariary: initial.price_ariary,
          max_pages: initial.max_pages,
          max_posts_month: initial.max_posts_month,
          max_ai_gen: initial.max_ai_gen,
          features: initial.features ?? {},
          is_active: initial.is_active,
        }
      : EMPTY_FORM
  )

  const set = (key: keyof CreatePlanRequest, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    if (isEdit && initial) {
      update.mutate({ planId: String(initial.id), data: form }, { onSuccess: onClose })
    } else {
      create.mutate(form, { onSuccess: onClose })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le plan' : 'Créer un plan'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Pro, Starter…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prix (Ar)</Label>
              <Input
                type="number"
                min={0}
                value={form.price_ariary}
                onChange={e => set('price_ariary', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pages max</Label>
              <Input
                type="number"
                min={1}
                value={form.max_pages}
                onChange={e => set('max_pages', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Posts / mois</Label>
              <Input
                type="number"
                min={1}
                value={form.max_posts_month}
                onChange={e => set('max_posts_month', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Générations IA</Label>
              <Input
                type="number"
                min={0}
                value={form.max_ai_gen}
                onChange={e => set('max_ai_gen', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Plan actif</p>
              <p className="text-xs text-slate-500">Visible par les utilisateurs</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={v => set('is_active', v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.name}>
            {isPending ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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

  const fmt = (n: number) => n.toLocaleString('fr-MG') + ' Ar'

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
                    {fmt(p.price_ariary)}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {p.max_pages}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {p.max_posts_month}
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