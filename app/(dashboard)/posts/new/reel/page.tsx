'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, X, Video, Globe, Calendar, Hash, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { config } from '@/lib/config'
import { ImageSourcePicker } from '@/components/posts/ImageSourcePicker'
import { MediaUploadZone } from '@/components/scheduling/MediaUploadZone'
import { MobilePreview } from '@/components/scheduling/MobilePreview'
import { useScheduleReel } from '@/hooks/useScheduleReel'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { OrgScopeFilter } from '@/components/organizations/OrgScopeFilter'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import type { ScopeFilter } from '@/components/organizations/OrgScopeFilter'
import { useQueryClient } from '@tanstack/react-query'
import { PUBLISHED_KEY } from '@/hooks/usePublishedPosts'
import type { FacebookPageResponse } from '@/lib/api/types'
import type { ImageSource } from '@/types/scheduling'

const STEPS = [
  { label: 'Média',     description: 'Image ou vidéo' },
  { label: 'Config',    description: 'Description & compte' },
  { label: 'Aperçu',    description: 'Prévisualisation' },
  { label: 'Confirmer', description: 'Validation' },
]

export default function NewReelPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [scope, setScope] = useState<ScopeFilter>("owned")
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10, scope })
  const orgId = selectedOrgId || orgData?.items[0]?.id || ''
  const { data: pages = [] } = useFacebookPages(orgId)

  const {
    step, setStep,
    formData, updateFormData,
    uploadProgress, isPending, error,
    handleSubmit,
  } = useScheduleReel()

  const [imageSource, setImageSource] = useState<ImageSource | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [hashtagInput, setHashtagInput] = useState('')
  const [publishMode, setPublishMode] = useState<'scheduled' | 'immediate'>('scheduled')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showVideoPreview = useMemo(() => {
    if (!previewUrl) return false
    if (formData.file) return formData.file.type.startsWith('video/')
    return /\.(mp4|mov|webm|avi)(\?|#|$)/i.test(previewUrl)
  }, [previewUrl, formData.file])

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

  const addHashtag = useCallback(() => {
    const tag = hashtagInput.replace(/^#/, '').trim()
    if (!tag) return
    if (formData.hashtags.length >= 30) {
      toast.error('Maximum 30 hashtags')
      return
    }
    if (formData.hashtags.includes(tag)) {
      toast.error('Hashtag déjà ajouté')
      return
    }
    updateFormData({ hashtags: [...formData.hashtags, tag] })
    setHashtagInput('')
  }, [hashtagInput, formData.hashtags, updateFormData])

  const removeHashtag = useCallback((tag: string) => {
    updateFormData({ hashtags: formData.hashtags.filter(t => t !== tag) })
  }, [formData.hashtags, updateFormData])

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
    updateFormData({ publishMode, ...(publishMode === 'immediate' ? { scheduledAt: '' } : {}) })
    await handleSubmit()
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
            Nouveau Reel
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
            <div
              key={i}
              className={cn(
                'flex-1 h-[3px] rounded-full transition-all duration-500 ease-out',
                i < step ? 'bg-primary/40' : i === step ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center transition-all duration-300',
                i === 0 ? 'items-start' : i === STEPS.length - 1 ? 'items-end' : 'items-center'
              )}
            >
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300',
                i === step ? 'text-primary' : i < step ? 'text-muted-foreground' : 'text-muted-foreground/40'
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scope + Organisation */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <OrgScopeFilter value={scope} onChange={(s) => { setScope(s); setSelectedOrgId(""); }} />
        <div className="sm:ml-auto">
          <OrganisationSelector
            value={selectedOrgId}
            onChange={setSelectedOrgId}
            placeholder="Organisation"
            scope={scope}
          />
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
                <p className="text-muted-foreground text-sm">
                  Téléchargez une vidéo MP4/MOV ou fournissez une URL.
                </p>
              </div>

              <ImageSourcePicker
                value={imageSource}
                onChange={handleSourceChange}
                accept="video/mp4,video/quicktime,image/jpeg,image/png,image/webp"
                maxSizeMB={500}
                showAsVideo={showVideoPreview}
                urlLabel="URL vidéo"
                urlPlaceholder="https://example.com/video.mp4"
              />

              {/* Only show MediaUploadZone when we have a file (not URL) */}
              {formData.file && (
                <MediaUploadZone
                  accept="video/mp4,video/quicktime,image/jpeg,image/png,image/webp"
                  acceptLabel="MP4, MOV, JPG, PNG, WebP — max 500MB"
                  maxSizeMB={500}
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
                <p className="text-muted-foreground text-sm">Compte, description et hashtags.</p>
              </div>

              {/* Account */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Compte Facebook</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(v) => updateFormData({ accountId: v })}
                >
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

              {/* Caption */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => updateFormData({ caption: e.target.value })}
                  placeholder="Ajoutez une description à votre Reel…"
                  rows={4}
                  maxLength={2200}
                  className="resize-none"
                />
                <span className="text-xs text-muted-foreground">{formData.caption.length}/2200</span>
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hashtags</Label>
                <div className="flex gap-2">
                  <input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value.replace(/\s/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    placeholder="Ajouter un hashtag"
                    className="flex-1 h-11 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <Button onClick={addHashtag} variant="outline" className="h-11">Ajouter</Button>
                </div>
                {formData.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                        #{tag}
                        <button onClick={() => removeHashtag(tag)} className="ml-0.5 hover:text-destructive">&times;</button>
                      </Badge>
                    ))}
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{formData.hashtags.length}/30</span>
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

              {/* Schedule datetime (only if scheduled mode) */}
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
                <p className="text-muted-foreground text-sm">Visualisez votre Reel tel qu'il apparaîtra sur Instagram.</p>
              </div>
              <div className="flex justify-center">
                <MobilePreview
                  mediaUrl={previewUrl}
                  isVideo={isVideo}
                  caption={formData.caption}
                  hashtags={formData.hashtags}
                  variant="reel"
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
                  <Video className="w-5 h-5 text-primary shrink-0" />
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

                {formData.hashtags.length > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <Hash className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Hashtags</p>
                      <p className="text-sm font-medium text-foreground">{formData.hashtags.length} hashtag{formData.hashtags.length > 1 ? 's' : ''}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 ml-auto" />
                  </div>
                )}
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
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isPending}
                  className="flex-1 h-12 text-base font-semibold rounded-2xl"
                >
                  {isPending ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Publication…</>
                  ) : publishMode === 'immediate' ? (
                    'Publier maintenant'
                  ) : (
                    'Planifier le Reel'
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
