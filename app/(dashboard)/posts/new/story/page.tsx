'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, X, Image, Globe, Calendar, Link, CheckCircle2, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ImageSourcePicker } from '@/components/posts/ImageSourcePicker'
import { MediaUploadZone } from '@/components/scheduling/MediaUploadZone'
import { MobilePreview } from '@/components/scheduling/MobilePreview'
import { useScheduleStory } from '@/hooks/useScheduleStory'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { useQueryClient } from '@tanstack/react-query'
import { PUBLISHED_KEY } from '@/hooks/usePublishedPosts'
import type { ImageSource } from '@/types/scheduling'

const STEPS = [
  { label: 'Média',     description: 'Image ou vidéo' },
  { label: 'Config',    description: 'Compte & lien' },
  { label: 'Aperçu',    description: 'Prévisualisation' },
  { label: 'Confirmer', description: 'Validation' },
]

export default function NewStoryPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const orgId = selectedOrgId || orgData?.items[0]?.id || ''
  const { data: pages = [] } = useFacebookPages(orgId)

  const {
    step, setStep,
    formData, updateFormData,
    uploadProgress, isPending, error,
    handleSubmit,
  } = useScheduleStory()

  const [imageSource, setImageSource] = useState<ImageSource | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [publishMode, setPublishMode] = useState<'scheduled' | 'immediate'>('scheduled')

  const handleSourceChange = useCallback((source: ImageSource | null) => {
    setImageSource(source)
    if (source?.type === 'url') {
      updateFormData({ imageUrl: source.url, file: null })
      setPreviewUrl(source.url)
      setIsVideo(/\.(mp4|mov|webm|avi)(\?|#|$)/i.test(source.url))
    } else if (source?.type === 'file') {
      const isVid = source.file.type.startsWith('video/')
      updateFormData({ imageUrl: '', file: source.file })
      setPreviewUrl(URL.createObjectURL(source.file))
      setIsVideo(isVid)
    } else {
      updateFormData({ imageUrl: '', file: null })
      setPreviewUrl('')
    }
  }, [updateFormData])

  const handleFileSelect = useCallback((file: File) => {
    const isVid = file.type.startsWith('video/')
    updateFormData({ file, imageUrl: '' })
    setPreviewUrl(URL.createObjectURL(file))
    setIsVideo(isVid)
    setImageSource({ type: 'file', file })
    setUploadError(null)
  }, [updateFormData])

  const handleFileRemove = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    updateFormData({ file: null, imageUrl: '' })
    setImageSource(null)
  }, [previewUrl, updateFormData])

  const canGoNext = useMemo(() => {
    switch (step) {
      case 0: return !!(formData.file || formData.imageUrl) && !uploadError
      case 1: return !!formData.accountId
      case 2: return true
      case 3: return true
      default: return false
    }
  }, [step, formData.file, formData.imageUrl, formData.accountId, uploadError])

  const handleFinalSubmit = async () => {
    await handleSubmit(publishMode)
    queryClient.invalidateQueries({ queryKey: PUBLISHED_KEY(orgId) })
    router.push('/posts')
  }

  const pageName = useMemo(() => {
    if (!formData.accountId) return 'Non sélectionnée'
    const p = pages.find(pg => pg.id === formData.accountId)
    return p?.page_name ?? 'Page inconnue'
  }, [formData.accountId, pages])

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-3 mb-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mt-0.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => router.push('/posts/new')}
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground leading-tight tracking-tight">
            Nouvelle Story
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {STEPS[step].description} · Étape {step + 1}/{STEPS.length}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-10" role="navigation" aria-label="Étapes du formulaire">
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <div key={i} className={cn(
              'flex-1 h-[3px] rounded-full transition-all duration-500 ease-out',
              i < step ? 'bg-primary/40' : i === step ? 'bg-primary' : 'bg-border'
            )} />
          ))}
        </div>
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className={cn('flex flex-col items-center transition-all duration-300', i === 0 ? 'items-start' : i === STEPS.length - 1 ? 'items-end' : 'items-center')}>
              <span className={cn('text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300', i === step ? 'text-primary' : i < step ? 'text-muted-foreground' : 'text-muted-foreground/40')}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div key={step} className="animate-[slide-up_0.25s_ease-out]">
        {/* Step 0: Media */}
        {step === 0 && (
          <Card className="p-8 bg-card border-border shadow-xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Ajoutez votre média</h2>
                <p className="text-muted-foreground text-sm">Téléchargez une image/vidéo ou fournissez une URL.</p>
              </div>
              <ImageSourcePicker
                value={imageSource}
                onChange={handleSourceChange}
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                maxSizeMB={15}
                showAsVideo={isVideo}
                urlLabel="URL média"
                urlPlaceholder="https://example.com/media.jpg"
              />
              {formData.file && (
                <MediaUploadZone
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                  acceptLabel="JPG, PNG, WebP, MP4, MOV — max 15MB"
                  maxSizeMB={15}
                  file={formData.file}
                  previewUrl={previewUrl}
                  isVideo={isVideo}
                  progress={uploadProgress}
                  isUploading={isPending}
                  error={uploadError}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                />
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => router.push('/posts/new')} className="flex items-center gap-2">
                  <X className="w-4 h-4" />Annuler
                </Button>
                <Button onClick={() => setStep(1)} disabled={!canGoNext} className="flex-1 h-12 text-base font-semibold rounded-2xl">
                  Continuer<ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 1: Config */}
        {step === 1 && (
          <Card className="p-8 bg-card border-border shadow-xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Configuration</h2>
                <p className="text-muted-foreground text-sm">Compte, lien swipe-up et planification.</p>
              </div>

              {/* Account */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Compte Facebook</Label>
                <Select value={formData.accountId} onValueChange={(v) => updateFormData({ accountId: v })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionnez un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.page_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Link URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Link className="w-4 h-4" />Lien (swipe-up)
                </Label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) => updateFormData({ linkUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Optionnel. Les utilisateurs pourront swiper vers ce lien.</p>
              </div>

              {/* Publish Mode */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mode de publication</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPublishMode('scheduled')}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border',
                      publishMode === 'scheduled'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                    )}
                  >
                    <Calendar className="w-4 h-4 mx-auto mb-1" />
                    Planifier
                  </button>
                  <button
                    onClick={() => setPublishMode('immediate')}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border',
                      publishMode === 'immediate'
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                    Publier maintenant
                  </button>
                </div>
              </div>

              {/* Schedule datetime */}
              {publishMode === 'scheduled' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />Date et heure de publication
                  </Label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => updateFormData({ scheduledAt: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all dark:[color-scheme:dark]"
                  />
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-2xl">
                <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Expiration automatique</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Les stories expirent 24 heures après leur publication.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(0)} className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />Retour
                </Button>
                <Button onClick={() => setStep(2)} disabled={!canGoNext} className="flex-1 h-12 text-base font-semibold rounded-2xl">
                  Continuer<ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <Card className="p-8 bg-card border-border shadow-xl">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Aperçu</h2>
                <p className="text-muted-foreground text-sm">Visualisez votre Story.</p>
              </div>
              <div className="flex justify-center">
                <MobilePreview
                  mediaUrl={previewUrl}
                  isVideo={isVideo}
                  variant="story"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />Retour
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-12 text-base font-semibold rounded-2xl">
                  Continuer<ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Card className="p-8 bg-card border-border shadow-xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Confirmation</h2>
                <p className="text-muted-foreground text-sm">Vérifiez les informations avant de publier.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Image className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Média</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {formData.imageUrl ? formData.imageUrl : formData.file?.name ?? 'Non défini'}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 ml-auto" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Globe className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Compte</p>
                    <p className="text-sm font-medium text-foreground">{pageName}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 ml-auto" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Publication</p>
                    <p className="text-sm font-medium text-foreground">
                      {publishMode === 'immediate' ? 'Immédiate' : formData.scheduledAt ? new Date(formData.scheduledAt).toLocaleString('fr-FR') : 'Non définie'}
                    </p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 ml-auto" />
                </div>

                {formData.linkUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <Link className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Lien</p>
                      <p className="text-sm font-medium text-foreground truncate">{formData.linkUrl}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 ml-auto" />
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-2xl">
                <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-warning">
                  La story expirera 24h après sa publication.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />Retour
                </Button>
                <Button onClick={handleFinalSubmit} disabled={isPending} className="flex-1 h-12 text-base font-semibold rounded-2xl">
                  {isPending ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Publication…</>
                  ) : publishMode === 'immediate' ? (
                    'Publier maintenant'
                  ) : (
                    'Planifier la Story'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
