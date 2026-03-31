'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { useAdminCreatePlan, useAdminUpdatePlan } from '@/hooks/usePlans'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import type { Plan, CreatePlanRequest } from '@/lib/api/types'

const EMPTY_FORM: CreatePlanRequest = {
  name: '',
  price: 0,
  max_page: 1,
  max_post_month: 10,
  max_ai_gen: 5,
  features: [],
  is_active: true,
}

// ── Tag Input ─────────────────────────────────────────────────────────────────

function TagInput({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim()
    if (!val || tags.includes(val)) return
    onChange([...tags, val])
    setInput('')
  }

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag))

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      remove(tags[tags.length - 1])
    }
  }

  return (
    <div className="space-y-2">
      {/* Tags existants */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input d'ajout */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ex: Accès API, Support prioritaire…"
          className="flex-1 text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={!input.trim()}
          className="px-3"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      <p className="text-[11px] text-slate-400">
        Appuie sur Entrée ou clique + pour ajouter. Backspace pour supprimer le dernier.
      </p>
    </div>
  )
}

// ── Dialog ────────────────────────────────────────────────────────────────────

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
          name:           initial.name,
          price:          initial.price,
          max_page:       initial.max_page,
          max_post_month: initial.max_post_month,
          max_ai_gen:     initial.max_ai_gen,
          features:       initial.features ?? [],
          is_active:      initial.is_active,
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le plan' : 'Créer un plan'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nom */}
          <div className="space-y-1.5">
            <Label>Nom</Label>
            <Input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Pro, Starter…"
            />
          </div>

          {/* Prix + Pages */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prix (Ar)</Label>
              <Input
                type="number" min={0}
                value={form.price}
                onChange={e => set('price', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pages max</Label>
              <Input
                type="number" min={1}
                value={form.max_page}
                onChange={e => set('max_page', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Posts + IA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Posts / mois</Label>
              <Input
                type="number" min={1}
                value={form.max_post_month}
                onChange={e => set('max_post_month', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Générations IA</Label>
              <Input
                type="number" min={0}
                value={form.max_ai_gen}
                onChange={e => set('max_ai_gen', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            <Label>Fonctionnalités incluses</Label>
            <TagInput
              tags={form.features ?? []}
              onChange={tags => set('features', tags)}
            />
          </div>

          {/* Statut */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Plan actif</p>
              <p className="text-xs text-slate-500">Visible par les utilisateurs</p>
            </div>
            <Switch
              checked={form.is_active ?? true}
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