'use client'

import { useRef, useState } from 'react'
import { Sparkles, Upload, Link as LinkIcon, Loader2, X, Plus, Images } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import type { ScheduledPost } from '@/lib/api/types'
import { useAddImage, useAddImageUpload, useRemoveImage } from '@/hooks/useScheduledPosts'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanGenerateImage } from '@/lib/api/plan-limits'

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
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState('url')
  const [imageUrl, setImageUrl] = useState('')
  const [imageDesc, setImageDesc] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState('')

  const addMutation    = useAddImage(orgId)
  const uploadMutation = useAddImageUpload(orgId)
  const removeMutation = useRemoveImage(orgId)

  const images     = post.images ?? []
  const canAdd     = images.length < MAX_IMAGES
  const isAdding   = addMutation.isPending || uploadMutation.isPending
  const isRemoving = removeMutation.isPending

  const resetForm = () => {
    setImageUrl('')
    setImageDesc('')
    setImageFile(null)
    setFilePreview('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setFilePreview(URL.createObjectURL(f))
  }

  const handleAdd = async () => {
    let res
    if (tab === 'upload' && imageFile) {
      res = await uploadMutation.mutateAsync({ postId: post.id, file: imageFile })
    } else if (tab === 'url' && imageUrl.trim()) {
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'url', url: imageUrl } })
    } else if (tab === 'llm' && imageDesc.trim()) {
      if (!checkCanGenerateImage(userDetail)) return
      res = await addMutation.mutateAsync({ postId: post.id, data: { mode: 'llm', description: imageDesc } })
    }
    if (res) { onUpdate?.(res.scheduled_post); resetForm() }
  }

  const addDisabled =
    isAdding || !canAdd ||
    (tab === 'url'    && !imageUrl.trim()) ||
    (tab === 'upload' && !imageFile) ||
    (tab === 'llm'    && !imageDesc.trim())

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
                Jusqu'à {MAX_IMAGES} images par post. L'ordre définit le carrousel Meta.
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
                    {/* Index badge */}
                    <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 rounded text-white text-[10px] flex items-center justify-center font-medium">
                      {i + 1}
                    </div>
                    {/* Source badge */}
                    <div className="absolute bottom-1 left-1 text-[9px] bg-black/50 text-white px-1 py-0.5 rounded uppercase tracking-wide">
                      {img.image_source}
                    </div>
                    {/* Remove button */}
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

              <Tabs value={tab} onValueChange={v => {
                if (v === 'llm' && !checkCanGenerateImage(userDetail)) return
                setTab(v)
                resetForm()
              }}>
                <TabsList className="w-full bg-muted">
                  <TabsTrigger value="url" className="flex-1 gap-1.5 text-xs">
                    <LinkIcon className="w-3.5 h-3.5" />URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1 gap-1.5 text-xs">
                    <Upload className="w-3.5 h-3.5" />Upload
                  </TabsTrigger>
                  <TabsTrigger value="llm" className="flex-1 gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5" />IA
                  </TabsTrigger>
                </TabsList>

                {/* Tab URL */}
                <TabsContent value="url" className="space-y-2 mt-3">
                  <input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                  {imageUrl && (
                    <div className="relative h-32 rounded-lg overflow-hidden border border-border">
                      <Image src={imageUrl} alt="preview" fill className="object-cover" unoptimized />
                    </div>
                  )}
                </TabsContent>

                {/* Tab Upload */}
                <TabsContent value="upload" className="space-y-2 mt-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {imageFile ? imageFile.name : 'Cliquez ou glissez une image'}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      PNG, JPG, WebP — max 10MB
                    </p>
                  </div>
                  {filePreview && (
                    <div className="relative h-32 rounded-lg overflow-hidden border border-border">
                      <Image src={filePreview} alt="preview" fill className="object-cover" unoptimized />
                    </div>
                  )}
                </TabsContent>

                {/* Tab IA */}
                <TabsContent value="llm" className="mt-3">
                  <textarea
                    value={imageDesc}
                    onChange={e => setImageDesc(e.target.value)}
                    rows={3}
                    placeholder="Ex: Photo professionnelle d'un bureau moderne, lumière naturelle..."
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleAdd}
                disabled={addDisabled}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tab === 'llm' ? 'Génération...' : 'Upload...'}
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
            /* Limite atteinte */
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