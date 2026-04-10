'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Upload, Link as LinkIcon, X, Plus, Images } from 'lucide-react'
import Image from 'next/image'
import type { ScheduledPost } from '@/lib/api/types'
import { useAddImage, useAddImageUpload, useRemoveImage } from '@/hooks/useScheduledPosts'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanGenerateImage } from '@/lib/api/plan-limits'

const MAX_IMAGES = 10

interface StepImageProps {
  post: ScheduledPost
  orgId: string
  onImageAdded:   (updatedPost: ScheduledPost) => void
  onImageRemoved: (updatedPost: ScheduledPost) => void
  onNext: () => void
  onBack: () => void
}

type ImageMode = 'url' | 'upload' | 'llm'

export function StepImage({ post, orgId, onImageAdded, onImageRemoved, onNext, onBack }: StepImageProps) {
  const { data: userDetail } = useCurrentUserDetail()
  const [mode, setMode]        = useState<ImageMode>('url')
  const [url, setUrl]          = useState('')
  const [description, setDesc] = useState('')
  const [file, setFile]        = useState<File | null>(null)
  const [preview, setPreview]  = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addMutation    = useAddImage(orgId)
  const uploadMutation = useAddImageUpload(orgId)
  const removeMutation = useRemoveImage(orgId)

  const images   = post.images ?? []
  const canAdd   = images.length < MAX_IMAGES
  const isAdding = addMutation.isPending || uploadMutation.isPending

  const resetForm = () => { setUrl(''); setDesc(''); setFile(null); setPreview('') }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleAdd = async () => {
    let res
    if (mode === 'upload' && file) {
      res = await uploadMutation.mutateAsync({ postId: post.id, file })
    } else if (mode === 'url' && url.trim()) {
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'url', url } })
    } else if (mode === 'llm' && description.trim()) {
      if (!checkCanGenerateImage(userDetail)) return
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'llm', description } })
    }
    if (res) { onImageAdded(res.scheduled_post); resetForm() }
  }

  const handleRemove = async (imageId: string) => {
    const updated = await removeMutation.mutateAsync({ postId: post.id, imageId })
    onImageRemoved(updated)
  }

  const canSubmitAdd =
    !isAdding && canAdd &&
    ((mode === 'url'    && !!url.trim()) ||
     (mode === 'upload' && !!file) ||
     (mode === 'llm'    && !!description.trim()))

  const MODES: { value: ImageMode; label: string; icon: React.ElementType }[] = [
    { value: 'url',    label: 'URL',      icon: LinkIcon },
    { value: 'upload', label: 'Uploader', icon: Upload   },
    { value: 'llm',    label: 'IA',       icon: Sparkles },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-medium text-slate-900 dark:text-white mb-1">
          Images
          <span className="ml-2 text-[13px] font-normal text-slate-500">
            ({images.length}/{MAX_IMAGES})
          </span>
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          Optionnel — ajoutez jusqu'à {MAX_IMAGES} images pour un carrousel.
        </p>
      </div>

      {/* Images existantes */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
            >
              <Image src={img.image_url} alt={`img ${i + 1}`} fill className="object-cover" unoptimized />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-black/60 rounded text-white text-[9px] flex items-center justify-center">
                {i + 1}
              </div>
              <button
                onClick={() => handleRemove(img.id)}
                disabled={removeMutation.isPending}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 hover:bg-red-600 rounded text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {canAdd && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
            {images.length === 0 ? 'Ajouter une image' : 'Ajouter une autre image'}
          </p>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {MODES.map(m => (
              <button
                key={m.value}
                onClick={() => {
                  if (m.value === 'llm' && !checkCanGenerateImage(userDetail)) return
                  setMode(m.value)
                  resetForm()
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] rounded-md transition-colors ${
                  mode === m.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-medium'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'url' && (
            <div className="space-y-2">
              <input
                value={url}
                onChange={e => { setUrl(e.target.value); setPreview(e.target.value) }}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {preview && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-[12px] text-slate-500">{file ? file.name : 'Cliquez pour choisir'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP — max 10MB</p>
              </div>
              {preview && (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                </div>
              )}
            </div>
          )}

          {mode === 'llm' && (
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder="Ex: Photo professionnelle d'un bureau moderne, lumière naturelle..."
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <Button
            onClick={handleAdd}
            disabled={!canSubmitAdd}
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {isAdding
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{mode === 'llm' ? 'Génération...' : 'Upload...'}</>
              : <><Plus className="w-3.5 h-3.5" />Ajouter</>
            }
          </Button>
        </div>
      )}

      {!canAdd && (
        <div className="flex items-center gap-2 text-[13px] text-slate-500 py-2">
          <Images className="w-4 h-4" />
          Limite de {MAX_IMAGES} images atteinte.
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onBack} className="border-slate-200 dark:border-slate-700">
          ← Retour
        </Button>
        <Button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          {images.length === 0 ? 'Ignorer →' : `Continuer (${images.length} image${images.length > 1 ? 's' : ''}) →`}
        </Button>
      </div>
    </div>
  )
}