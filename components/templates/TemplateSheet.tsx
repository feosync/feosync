'use client'

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTrash, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Image from 'next/image'
import type { PostTemplate, SectorEnum, CreateTemplateRequest } from '@/lib/api/types'

const SECTORS: { value: SectorEnum; label: string }[] = [
  { value: 'technology',    label: 'Technologie' },
  { value: 'finance',       label: 'Finance' },
  { value: 'healthcare',    label: 'Santé' },
  { value: 'education',     label: 'Éducation' },
  { value: 'retail',        label: 'Commerce' },
  { value: 'manufacturing', label: 'Industrie' },
]

interface Props {
  open: boolean
  onClose: () => void
  template: PostTemplate | null
  orgId: string
  onCreate: (data: CreateTemplateRequest) => Promise<void>
  onUpdate: (id: string, data: Partial<CreateTemplateRequest>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isCreating?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
}

const DEFAULT_FORM = {
  name: '', description: '', asset_url: '', sector: 'technology' as SectorEnum,
}

export function TemplateSheet({
  open, onClose, template, orgId,
  onCreate, onUpdate, onDelete,
  isCreating, isUpdating, isDeleting,
}: Props) {
  const isEdit  = !!template
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm]               = useState(DEFAULT_FORM)
  const [preview, setPreview]         = useState('')
  const [deleteDialog, setDeleteDialog] = useState(false)

  useEffect(() => {
    if (open) {
      if (template) {
        setForm({
          name:        template.name,
          description: template.description || '',
          asset_url:   template.asset_url,
          sector:      template.sector,
        })
        setPreview(template.asset_url)
      } else {
        setForm(DEFAULT_FORM)
        setPreview('')
      }
    }
  }, [open, template])

  const set = (key: keyof typeof form, value: string) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setPreview(url)
    setForm(f2 => ({ ...f2, asset_url: url }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.asset_url) return
    if (isEdit && template) {
      await onUpdate(template.id, form)
    } else {
      await onCreate({ ...form, organisation_id: orgId })
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <>
      <Sheet open={open} onOpenChange={open => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-card border-border overflow-y-auto"
        >
          <SheetHeader className="mb-5">
            <SheetTitle className="text-foreground">
              {isEdit ? 'Modifier le template' : 'Nouveau template'}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {isEdit
                ? 'Modifiez les informations de ce template.'
                : 'Créez un template personnalisé pour votre organisation.'
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">

            {/* ── Nom ──────────────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Nom <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ex: Template lancement produit"
                className="text-sm"
              />
            </div>

            {/* ── Description ──────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Description optionnelle..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* ── Secteur ──────────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Secteur <span className="text-destructive">*</span>
              </label>
              <Select value={form.sector} onValueChange={v => set('sector', v)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {SECTORS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Image / Asset ─────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Image du template <span className="text-destructive">*</span>
              </label>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-border group">
                  <div className="relative aspect-video">
                    <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                  {/* Supprimer preview */}
                  <button
                    onClick={() => { setPreview(''); set('asset_url', '') }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70
                               rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                  </button>
                  {/* Changer image */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 hover:bg-black/70
                               rounded text-white text-xs flex items-center gap-1 transition-colors"
                  >
                    <FontAwesomeIcon icon={faUpload} className="w-3 h-3" /> Changer
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center
                             cursor-pointer transition-colors
                             hover:border-primary/50 hover:bg-primary/5"
                >
                  <p className="text-sm text-muted-foreground">
                    Cliquez pour uploader une image
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WebP</p>
                </div>
              )}

              {/* Séparateur "ou URL" */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">ou URL</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Input
                value={form.asset_url.startsWith('blob:') ? '' : form.asset_url}
                onChange={e => { set('asset_url', e.target.value); setPreview(e.target.value) }}
                placeholder="https://example.com/image.jpg"
                className="text-sm"
              />
            </div>

            {/* ── Bannière template app ─────────────────────────────────── */}
            {isEdit && template?.is_app_template && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3
                              text-xs text-primary leading-relaxed">
                Ce template est fourni par l'application. Vos modifications créeront
                une copie pour votre organisation.
              </div>
            )}
          </div>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <div className="flex gap-2 mt-6">
            {isEdit && !template?.is_app_template && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive
                           transition-colors"
                onClick={() => setDeleteDialog(true)}
                disabled={isDeleting}
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground
                         transition-colors"
            >
              Annuler
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isPending || !form.name.trim() || !form.asset_url}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground
                         transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPending && (
                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isPending ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le template'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Dialog suppression ───────────────────────────────────────────── */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Supprimer ce template ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Le template{' '}
              <span className="font-medium text-foreground">{template?.name}</span>{' '}
              sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground hover:bg-accent"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => template && onDelete(template.id)}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground
                         border-0 focus-visible:ring-2 focus-visible:ring-ring transition-colors
                         disabled:opacity-50 disabled:pointer-events-none"
            >
              {isDeleting && (
                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}