'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, X, Plus, Images } from 'lucide-react'
import Image from 'next/image'
import type { ScheduledPost } from '@/lib/api/types'
import type { ImageSource } from '@/types/scheduling'
import { useAddImage, useAddImageUpload, useRemoveImage } from '@/hooks/useScheduledPosts'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanGenerateImage } from '@/lib/api/plan-limits'
import { ImageSourcePicker } from '@/components/posts/ImageSourcePicker'

const MAX_IMAGES = 10

interface StepImageProps {
  post: ScheduledPost
  orgId: string
  onImageAdded: (updatedPost: ScheduledPost) => void
  onImageRemoved: (updatedPost: ScheduledPost) => void
  onNext: () => void
  onBack: () => void
}

export function StepImage({ post, orgId, onImageAdded, onImageRemoved, onNext, onBack }: StepImageProps) {
  const { data: userDetail } = useCurrentUserDetail()
  const [imageSource, setImageSource] = useState<ImageSource | null>(null)
  const [useAi, setUseAi] = useState(false)
  const [description, setDesc] = useState('')

  const addMutation = useAddImage(orgId)
  const uploadMutation = useAddImageUpload(orgId)
  const removeMutation = useRemoveImage(orgId)

  const images = post.images ?? []
  const canAdd = images.length < MAX_IMAGES
  const isAdding = addMutation.isPending || uploadMutation.isPending

  const handleSourceChange = useCallback((source: ImageSource | null) => {
    setImageSource(source)
    setUseAi(false)
  }, [])

  const handleAdd = async () => {
    let res
    if (useAi && description.trim()) {
      if (!checkCanGenerateImage(userDetail)) return
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'llm', description: description.trim() } })
    } else if (imageSource?.type === 'url') {
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'url', url: imageSource.url } })
    } else if (imageSource?.type === 'file' && imageSource.file) {
      res = await uploadMutation.mutateAsync({ postId: post.id, file: imageSource.file })
    }

    if (res) {
      onImageAdded(res.scheduled_post)
      setImageSource(null)
      setUseAi(false)
      setDesc('')
    }
  }

  const handleRemove = async (imageId: string) => {
    const updated = await removeMutation.mutateAsync({ postId: post.id, imageId })
    onImageRemoved(updated)
  }

  const canSubmitAdd =
    !isAdding &&
    canAdd &&
    ((useAi && !!description.trim()) || imageSource !== null)

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
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-destructive rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
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

            {/* Image Source Picker (Upload / URL) */}
            {!useAi && (
              <ImageSourcePicker
                value={imageSource}
                onChange={handleSourceChange}
              />
            )}

            {/* AI Generation Toggle & Form */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setUseAi(!useAi)
                  if (!useAi) setImageSource(null)
                }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {useAi ? 'Annuler la génération IA' : 'Générer par IA'}
              </button>

              {useAi && (
                <div className="space-y-3 animate-fade-in">
                  <Textarea
                    value={description}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Décris l'image que tu veux générer... Ex: Une femme souriante devant un ordinateur dans un bureau moderne avec lumière naturelle"
                    rows={4}
                    className="resize-none"
                  />
                  {!checkCanGenerateImage(userDetail) && (
                    <p className="text-xs text-warning">Limite de génération IA atteinte pour ce mois.</p>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleAdd}
              disabled={!canSubmitAdd}
              className="w-full h-11 text-base font-semibold rounded-2xl"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {useAi ? 'Génération...' : 'Ajout...'}
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
          <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-2xl text-warning">
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
