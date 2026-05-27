'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Upload, Link as LinkIcon, X, Plus, Images } from 'lucide-react'
import Image from 'next/image'
import type { ScheduledPost } from '@/lib/api/types'
import { useAddImage, useAddImageUpload, useRemoveImage } from '@/hooks/useScheduledPosts'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanGenerateImage } from '@/lib/api/plan-limits'
import { cn } from '@/lib/utils'

const MAX_IMAGES = 10

interface StepImageProps {
  post: ScheduledPost
  orgId: string
  onImageAdded: (updatedPost: ScheduledPost) => void
  onImageRemoved: (updatedPost: ScheduledPost) => void
  onNext: () => void
  onBack: () => void
}

type ImageMode = 'url' | 'upload' | 'llm'

export function StepImage({ post, orgId, onImageAdded, onImageRemoved, onNext, onBack }: StepImageProps) {
  const { data: userDetail } = useCurrentUserDetail()
  const [mode, setMode] = useState<ImageMode>('url')
  const [url, setUrl] = useState('')
  const [description, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addMutation = useAddImage(orgId)
  const uploadMutation = useAddImageUpload(orgId)
  const removeMutation = useRemoveImage(orgId)

  const images = post.images ?? []
  const canAdd = images.length < MAX_IMAGES
  const isAdding = addMutation.isPending || uploadMutation.isPending

  const resetForm = () => {
    setUrl('')
    setDesc('')
    setFile(null)
    setPreview('')
  }

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
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'url', url: url.trim() } })
    } else if (mode === 'llm' && description.trim()) {
      if (!checkCanGenerateImage(userDetail)) return
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'llm', description: description.trim() } })
    }

    if (res) {
      onImageAdded(res.scheduled_post)
      resetForm()
    }
  }

  const handleRemove = async (imageId: string) => {
    const updated = await removeMutation.mutateAsync({ postId: post.id, imageId })
    onImageRemoved(updated)
  }

  const canSubmitAdd =
    !isAdding &&
    canAdd &&
    ((mode === 'url' && !!url.trim()) ||
     (mode === 'upload' && !!file) ||
     (mode === 'llm' && !!description.trim()))

  const MODES = [
    { value: 'url' as ImageMode, label: 'URL', icon: LinkIcon },
    { value: 'upload' as ImageMode, label: 'Uploader', icon: Upload },
    { value: 'llm' as ImageMode, label: 'Générer par IA', icon: Sparkles },
  ]

  return (
    <Card className="p-8 bg-card border-border shadow-xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Images</h2>
          <p className="text-muted-foreground">
            Ajoutez jusqu'à {MAX_IMAGES} images pour créer un carrousel attractif.
            <span className="ml-1.5 text-sm text-muted-foreground">({images.length}/{MAX_IMAGES})</span>
          </p>
        </div>

        {/* Existing Images Grid */}
        {images.length > 0 && (
          <div>
            <Label className="mb-3 block">Images ajoutées</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted shadow-sm hover:shadow-md transition-all"
                >
                  <Image
                    src={img.image_url}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2 w-5 h-5 bg-black/70 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                  <button
                    onClick={() => handleRemove(img.id)}
                    disabled={removeMutation.isPending}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Image Section */}
        {canAdd && (
          <div className="space-y-5">
            <Label>Ajouter une image</Label>

            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-2xl">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => {
                    if (m.value === 'llm' && !checkCanGenerateImage(userDetail)) return
                    setMode(m.value)
                    resetForm()
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                    mode === m.value
                      ? "bg-card shadow-sm text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  <m.icon className={cn("w-4 h-4", mode === 'llm' && "text-primary")} />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Form by Mode */}
            {mode === 'url' && (
              <div className="space-y-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setPreview(e.target.value)
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full h-11 px-4 rounded-xl border bg-card text-foreground focus:ring-2 focus:ring-ring"
                />
                {preview && (
                  <div className="relative h-52 rounded-2xl overflow-hidden border border-border">
                    <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>
            )}

            {mode === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-card"
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Cliquez pour sélectionner une image</p>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG, WebP — Max 10MB</p>
                </div>
                {preview && (
                  <div className="relative h-52 rounded-2xl overflow-hidden border border-border">
                    <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>
            )}

            {mode === 'llm' && (
              <Textarea
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Décris l'image que tu veux générer... Ex: Une femme souriante devant un ordinateur dans un bureau moderne avec lumière naturelle"
                rows={4}
                className="resize-none"
              />
            )}

            <Button
              onClick={handleAdd}
              disabled={!canSubmitAdd}
              className="w-full h-11 text-base font-semibold rounded-2xl"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'llm' ? 'Génération...' : 'Ajout...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter l'image
                </>
              )}
            </Button>
          </div>
        )}

        {!canAdd && (
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
            <Images className="w-5 h-5" />
            Limite maximale de {MAX_IMAGES} images atteinte.
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            ← Retour
          </Button>
          <Button onClick={onNext} className="flex-1 h-12 text-base font-semibold rounded-2xl">
            {images.length === 0 ? 'Continuer sans image' : `Continuer avec ${images.length} image${images.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Card>
  )
}