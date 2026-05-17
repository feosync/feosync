'use client'

import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { Organisation, CreateOrgRequest, ToneEnum, SectorEnum } from '@/lib/api/types'

const SECTORS: { value: SectorEnum; label: string }[] = [
  { value: 'technology',    label: 'Technologie' },
  { value: 'finance',       label: 'Finance' },
  { value: 'healthcare',    label: 'Santé' },
  { value: 'education',     label: 'Éducation' },
  { value: 'retail',        label: 'Commerce' },
  { value: 'manufacturing', label: 'Industrie' },
]

const TONES: { value: ToneEnum; label: string }[] = [
  { value: 'formal',       label: 'Formel' },
  { value: 'informal',     label: 'Informel' },
  { value: 'friendly',     label: 'Amical' },
  { value: 'professional', label: 'Professionnel' },
  { value: 'casual',       label: 'Décontracté' },
]

interface OrgDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateOrgRequest) => Promise<void>
  initialData?: Organisation
  isPending?: boolean
}

const defaultForm: CreateOrgRequest = {
  name: '',
  description: '',
  sector: 'technology',
  tone: 'professional',
  logo_url: null,
  brand_color: '#2563eb',
}

export function OrgDialog({ open, onOpenChange, onSubmit, initialData, isPending }: OrgDialogProps) {
  const [form, setForm] = useState<CreateOrgRequest>(defaultForm)

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        name: initialData.name,
        description: initialData.description,
        sector: initialData.sector,
        tone: initialData.tone,
        logo_url: initialData.logo_url,
        brand_color: initialData.brand_color,
      } : defaultForm)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    await onSubmit(form)
  }

  const set = (key: keyof CreateOrgRequest, value: string | null) =>
    setForm(f => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            {initialData ? 'Modifier l\'organisation' : 'Nouvelle organisation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nom <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Nom de l'organisation"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              disabled={isPending}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <Textarea
              placeholder="Description de l'organisation"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              disabled={isPending}
              rows={3}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Secteur
              </label>
              <Select value={form.sector} onValueChange={v => set('sector', v)} disabled={isPending}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900">
                  {SECTORS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Ton
              </label>
              <Select value={form.tone} onValueChange={v => set('tone', v)} disabled={isPending}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900">
                  {TONES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Couleur de marque
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.brand_color || '#2563eb'}
                onChange={e => set('brand_color', e.target.value)}
                className="w-10 h-9 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
              />
              <Input
                value={form.brand_color || ''}
                onChange={e => set('brand_color', e.target.value)}
                placeholder="#2563eb"
                className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="border-slate-200 dark:border-slate-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.name.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}