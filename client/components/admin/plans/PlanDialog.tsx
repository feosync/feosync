'use client'

import { useState } from 'react'
import {
  useAdminCreatePlan,
  useAdminUpdatePlan,
} from '@/hooks/usePlans'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import type { Plan, CreatePlanRequest } from '@/lib/api/types'

// ── Form ──────────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreatePlanRequest = {
  name: '',
  price: 0,
  max_page: 1,
  max_post_month: 10,
  max_ai_gen: 5,
  features: [],
  is_active: true,
}



export function PlanDialog({
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
          price: initial.price,
          max_page: initial.max_page,
          max_post_month: initial.max_post_month,
          max_ai_gen: initial.max_ai_gen,
          features: initial.features ?? [],
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
                value={form.price}
                onChange={e => set('price', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pages max</Label>
              <Input
                type="number"
                min={1}
                value={form.max_page}
                onChange={e => set('max_page', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Posts / mois</Label>
              <Input
                type="number"
                min={1}
                value={form.max_post_month}
                onChange={e => set('max_post_month', Number(e.target.value))}
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

