'use client'

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTrash, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
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
  template: PostTemplate | null   // null = mode création
  orgId: string
  onCreate: (data: CreateTemplateRequest) => Promise<void>
  onUpdate: (id: string, data: Partial<CreateTemplateRequest>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isCreating?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
}

const DEFAULT_FORM = { name: '', description: '', asset_url: '', sector: 'technology' as SectorEnum }

export function TemplateSheet({
  open, onClose, template, orgId,
  onCreate, onUpdate, onDelete,
  isCreating, isUpdating, isDeleting,
}: Props) {
  const isEdit = !!template
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm]           = useState(DEFAULT_FORM)
  const [preview, setPreview]     = useState('')
  const [deleteDialog, setDeleteDialog] = useState(false)

  // Remplit le form quand on ouvre en mode édition
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
    // TODO: en prod → upload vers S3/Cloudinary et utiliser l'URL retournée
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
          className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto"
        >
          <SheetHeader className="mb-5">
            <SheetTitle className="text-slate-900 dark:text-white">
              {isEdit ? 'Modifier le template' : 'Nouveau template'}
            </SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              {isEdit
                ? 'Modifiez les informations de ce template.'
                : 'Créez un template personnalisé pour votre organisation.'
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Ex: Template lancement produit"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Description optionnelle..."
                rows={2}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Secteur */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                Secteur <span className="text-red-500">*</span>
              </label>
              <Select value={form.sector} onValueChange={v => set('sector', v)}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900">
                  {SECTORS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image / Asset */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                Image du template <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <div className="relative aspect-video">
                    <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                  <button
                    onClick={() => { setPreview(''); set('asset_url', '') }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 hover:bg-black/70 rounded text-white text-[11px] flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faUpload} className="w-3 h-3" /> Changer
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                >
                  {/* <FontAwesomeIcon icon={faTemplate} className="w-8 h-8 text-slate-300 mx-auto mb-2" /> */}
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">
                    Cliquez pour uploader une image
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP</p>
                </div>
              )}

              {/* Ou URL directe */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-[11px] text-slate-400">ou URL</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <input
                value={form.asset_url.startsWith('blob:') ? '' : form.asset_url}
                onChange={e => { set('asset_url', e.target.value); setPreview(e.target.value) }}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Infos template app (lecture seule) */}
            {isEdit && template?.is_app_template && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3 text-[12px] text-blue-700 dark:text-blue-300">
                Ce template est fourni par l'application. Vos modifications créeront une copie pour votre organisation.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6">
            {/* Supprimer — seulement sur les templates org en mode édition */}
            {isEdit && !template?.is_app_template && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => setDeleteDialog(true)}
                disabled={isDeleting}
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-200 dark:border-slate-700"
              disabled={isPending}
            >
              Annuler
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isPending || !form.name.trim() || !form.asset_url}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />}
              {isPending
                ? 'Enregistrement...'
                : isEdit ? 'Mettre à jour' : 'Créer le template'
              }
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog confirmation suppression */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Supprimer ce template ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Le template <span className="font-medium text-slate-900 dark:text-white">
                {template?.name}
              </span> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => template && onDelete(template.id)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {isDeleting && <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
