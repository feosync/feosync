'use client'

import { useCallback, useState } from 'react'
import { Sparkles, Loader2, X, Plus, Images } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import type { ScheduledPost } from '@/lib/api/types'
import type { ImageSource } from '@/types/scheduling'
import { useAddImage, useAddImageUpload, useRemoveImage } from '@/hooks/useScheduledPosts'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanGenerateImage } from '@/lib/api/plan-limits'
import { ImageSourcePicker } from '@/components/posts/ImageSourcePicker'

const MAX_IMAGES = 10

interface Props {
  open: boolean
  onClose: () => void
  post: ScheduledPost
  orgId: string
  onUpdate?: (updatedPost: ScheduledPost) => void
}

export function ImageSheet({ open, onClose, post, orgId, onUpdate }: Props) {
  const { data: userDetail } = useCurrentUserDetail()
  const [mode, setMode] = useState<'manual' | 'llm'>('manual')
  const [imageSource, setImageSource] = useState<ImageSource | null>(null)
  const [imageDesc, setImageDesc] = useState('')

  const addMutation    = useAddImage(orgId)
  const uploadMutation = useAddImageUpload(orgId)
  const removeMutation = useRemoveImage(orgId)

  const images     = post.images ?? []
  const canAdd     = images.length < MAX_IMAGES
  const isAdding   = addMutation.isPending || uploadMutation.isPending
  const isRemoving = removeMutation.isPending

  const resetForm = () => {
    setImageSource(null)
    setImageDesc('')
  }

  const handleSourceChange = useCallback((source: ImageSource | null) => {
    setImageSource(source)
  }, [])

  const handleAdd = async () => {
    let res
    if (mode === 'llm' && imageDesc.trim()) {
      if (!checkCanGenerateImage(userDetail)) return
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'llm', description: imageDesc } })
    } else if (imageSource?.type === 'url') {
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'url', url: imageSource.url } })
    } else if (imageSource?.type === 'file' && imageSource.file) {
      res = await uploadMutation.mutateAsync({ postId: post.id, file: imageSource.file })
    }
    if (res) { onUpdate?.(res.scheduled_post); resetForm() }
  }

  const addDisabled =
    isAdding || !canAdd ||
    (mode === 'llm' ? !imageDesc.trim() : imageSource === null)

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-background border-border flex flex-col gap-0 p-0 overflow-y-auto"
      >
        {/* ── Header ── */}
        <SheetHeader className="px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Images className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-foreground text-base leading-tight">
                  Images
                </SheetTitle>
                <Badge
                  variant="outline"
                  className="text-xs font-normal border-border text-muted-foreground"
                >
                  {images.length}/{MAX_IMAGES}
                </Badge>
              </div>
              <SheetDescription className="text-muted-foreground text-xs mt-0.5">
                Jusqu&apos;à {MAX_IMAGES} images par post. L&apos;ordre définit le carrousel Meta.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── Body ── */}
        <div className="flex-1 px-6 py-6 space-y-6">

          {/* Images existantes */}
          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Images actuelles
              </p>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted"
                  >
                    <Image
                      src={img.image_url}
                      alt={`img ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 rounded text-white text-[10px] flex items-center justify-center font-medium">
                      {i + 1}
                    </div>
                    <div className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1 py-0.5 rounded uppercase tracking-wide">
                      {img.image_source}
                    </div>
                    <button
                      onClick={() => handleRemove(img.id)}
                      disabled={isRemoving}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-destructive rounded text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {isRemoving
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <X className="w-3 h-3" />
                      }
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ajouter une image */}
          {canAdd ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                {images.length === 0 ? 'Ajouter une image' : 'Ajouter une image supplémentaire'}
              </p>

              {/* Mode toggle: Manual vs AI */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setMode('manual'); setImageDesc('') }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    mode === 'manual'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  URL / Upload
                </button>
                <button
                  onClick={() => { setMode('llm'); setImageSource(null) }}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    mode === 'llm'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  IA
                </button>
              </div>

              {mode === 'manual' ? (
                <ImageSourcePicker
                  value={imageSource}
                  onChange={handleSourceChange}
                />
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={imageDesc}
                    onChange={e => setImageDesc(e.target.value)}
                    rows={3}
                    placeholder="Ex: Photo professionnelle d'un bureau moderne, lumière naturelle..."
                    className="resize-none"
                  />
                  {!checkCanGenerateImage(userDetail) && (
                    <p className="text-xs text-warning">Limite de génération IA atteinte pour ce mois.</p>
                  )}
                </div>
              )}

              <Button
                onClick={handleAdd}
                disabled={addDisabled}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'llm' ? 'Génération...' : 'Upload...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Ajouter l'image
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-border rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                <Images className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Limite atteinte
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supprimez une image pour en ajouter une nouvelle.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-border"
          >
            Fermer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )

  async function handleRemove(imageId: string) {
    const updatedPost = await removeMutation.mutateAsync({ postId: post.id, imageId })
    onUpdate?.(updatedPost)
  }
}
