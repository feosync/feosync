'use client'

import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
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
        name:        initialData.name,
        description: initialData.description,
        sector:      initialData.sector,
        tone:        initialData.tone,
        logo_url:    initialData.logo_url,
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
      <DialogContent className="sm:max-w-lg bg-card border-border">

        <DialogHeader>
          <DialogTitle className="text-foreground">
            {initialData ? "Modifier l'organisation" : 'Nouvelle organisation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">

          {/* ── Nom ──────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Nom <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Nom de l'organisation"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          {/* ── Description ──────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <Textarea
              placeholder="Description de l'organisation"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              disabled={isPending}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* ── Secteur + Ton ─────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Secteur</label>
              <Select value={form.sector} onValueChange={v => set('sector', v)} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {SECTORS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Ton</label>
              <Select value={form.tone} onValueChange={v => set('tone', v)} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {TONES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Couleur de marque ─────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">
              Couleur de marque
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.brand_color || '#2563eb'}
                onChange={e => set('brand_color', e.target.value)}
                className="w-10 h-9 rounded-md border border-border cursor-pointer
                           p-0.5 bg-background"
              />
              <Input
                value={form.brand_color || ''}
                onChange={e => set('brand_color', e.target.value)}
                placeholder="#2563eb"
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────────────── */}
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="border-border text-foreground hover:bg-accent
                         hover:text-accent-foreground transition-colors"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={isPending}
              disabled={!form.name.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground
                         transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}