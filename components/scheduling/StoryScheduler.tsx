'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Calendar,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Link,
  User,
  Image,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MediaUploadZone } from './MediaUploadZone'
import { MobilePreview } from './MobilePreview'
import { ImageSourcePicker } from '@/components/posts/ImageSourcePicker'
import { useScheduleStory } from '@/hooks/useScheduleStory'
import type { FacebookPageResponse } from '@/lib/api/types'
import type { ImageSource } from '@/types/scheduling'

const STEPS = [
  { label: 'Upload', description: 'Média de la Story' },
  { label: 'Config', description: 'Lien & horaire' },
  { label: 'Aperçu', description: 'Prévisualisation' },
  { label: 'Confirmer', description: 'Validation' },
]

interface StorySchedulerProps {
  pages: FacebookPageResponse[]
  open: boolean
  onClose: () => void
}

export function StoryScheduler({ pages, open, onClose }: StorySchedulerProps) {
  const {
    step, setStep,
    formData, updateFormData,
    uploadProgress, isPending, error,
    handleSubmit, reset,
  } = useScheduleStory(onClose)

  const [confirmClose, setConfirmClose] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<ImageSource | null>(null)

  const hasData = formData.file || formData.imageUrl || formData.linkUrl || formData.scheduledAt || formData.accountId

  const handleClose = useCallback(() => {
    if (hasData) {
      setConfirmClose(true)
    } else {
      reset()
      onClose()
    }
  }, [hasData, reset, onClose])

  const handleConfirmClose = useCallback(() => {
    reset()
    setConfirmClose(false)
    onClose()
  }, [reset, onClose])

  const handleFileSelect = useCallback(
    (file: File) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']
      if (!validTypes.includes(file.type)) {
        setUploadError('Format non supporté. Utilisez jpg, png, webp, mp4 ou mov.')
        return
      }
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('Fichier trop volumineux. Maximum 15MB.')
        return
      }
      setUploadError(null)
      updateFormData({ file })
      setPreviewUrl(URL.createObjectURL(file))
      setIsVideo(file.type.startsWith('video/'))
    },
    [updateFormData],
  )

  const handleFileRemove = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    updateFormData({ file: null })
  }, [previewUrl, updateFormData])

  const handleImageSourceChange = useCallback((source: ImageSource | null) => {
    setImageSource(source)
    if (source?.type === 'url') {
      updateFormData({ imageUrl: source.url, file: null })
      setPreviewUrl(source.url)
      setIsVideo(false)
    } else if (source?.type === 'file') {
      updateFormData({ imageUrl: '', file: source.file })
      setPreviewUrl(URL.createObjectURL(source.file))
      setIsVideo(false)
    } else {
      updateFormData({ imageUrl: '', file: null })
      setPreviewUrl('')
    }
  }, [updateFormData])

  useEffect(() => {
    if (!open) {
      reset()
      setPreviewUrl('')
      setIsVideo(false)
      setUploadError(null)
      setImageSource(null)
    }
  }, [open, reset])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const selectedPage = pages.find((p) => p.id === formData.accountId)

  const canGoNext = useMemo(() => {
    switch (step) {
      case 0:
        return (!!formData.file || !!formData.imageUrl) && !uploadError
      case 1:
        return !!formData.accountId
      case 2:
        return true
      case 3:
        return true
      default:
        return false
    }
  }, [step, formData.file, formData.imageUrl, formData.accountId, uploadError])

  const scheduledDate = formData.scheduledAt
    ? new Date(formData.scheduledAt)
    : null

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-auto px-4 py-6 min-h-screen">
            {/* Header */}
            <div className="flex items-start gap-3 mb-8">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-0.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                onClick={handleClose}
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
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
            <div className="mb-8" role="navigation" aria-label="Étapes du formulaire">
              <div className="flex gap-1 mb-3">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 h-[3px] rounded-full transition-all duration-500 ease-out',
                      i < step
                        ? 'bg-primary/40'
                        : i === step
                          ? 'bg-primary'
                          : 'bg-border',
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
                      i === 0 ? 'items-start' : i === STEPS.length - 1 ? 'items-end' : 'items-center',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300',
                        i === step
                          ? 'text-primary'
                          : i < step
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground/40',
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div key={step} className="animate-slide-up">
              {step === 0 && (
                <Card className="p-8 bg-card border-border shadow-xl">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2">
                        Ajoutez votre média
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Téléchargez une image/vidéo ou fournissez une URL d'image.
                      </p>
                    </div>

                    <ImageSourcePicker
                      value={imageSource}
                      onChange={handleImageSourceChange}
                      accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                      maxSizeMB={15}
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
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </Button>
                      <Button
                        onClick={() => setStep(1)}
                        disabled={!canGoNext}
                        className="flex-1 h-12 text-base font-semibold rounded-2xl"
                      >
                        Continuer
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {step === 1 && (
                <Card className="p-8 bg-card border-border shadow-xl">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2">
                        Configurez votre Story
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Ajoutez un lien swipe-up optionnel et choisissez la date de publication.
                      </p>
                    </div>

                    {/* Account */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Compte cible <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.accountId}
                        onValueChange={(v) => updateFormData({ accountId: v })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Sélectionnez un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {pages.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-center gap-2">
                                {p.fb_page_picture && (
                                  <img
                                    src={p.fb_page_picture}
                                    alt={p.page_name}
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                )}
                                <span>{p.page_name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Link URL */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Link className="w-4 h-4 text-muted-foreground" />
                        Lien swipe-up (optionnel)
                      </Label>
                      <input
                        type="url"
                        value={formData.linkUrl}
                        onChange={(e) => updateFormData({ linkUrl: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full h-11 px-4 rounded-xl border bg-card text-foreground focus:ring-2 focus:ring-ring transition-all"
                      />
                      {formData.linkUrl && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                          <Link className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {formData.linkUrl}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Date et heure de publication
                      </Label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => updateFormData({ scheduledAt: e.target.value })}
                        className={cn(
                          'w-full h-11 px-4 rounded-xl border bg-card text-foreground',
                          'focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
                          'dark:[color-scheme:dark]',
                        )}
                      />
                    </div>

                    {/* Expiration info */}
                    <div className="flex items-start gap-2.5 p-3 bg-muted rounded-xl">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Les Stories expirent automatiquement 24h après leur publication.
                      </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(0)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Retour
                      </Button>
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!canGoNext}
                        className="flex-1 h-12 text-base font-semibold rounded-2xl"
                      >
                        Continuer
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="p-8 bg-card border-border shadow-xl">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2">
                        Aperçu
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Visualisez votre Story telle qu'elle apparaîtra sur Instagram.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <MobilePreview
                        mediaUrl={previewUrl}
                        isVideo={isVideo}
                        linkUrl={formData.linkUrl}
                        variant="story"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Retour
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1 h-12 text-base font-semibold rounded-2xl"
                      >
                        Continuer
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {step === 3 && (
                <Card className="p-8 bg-card border-border shadow-xl">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2">
                        Confirmation
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Vérifiez les informations avant de planifier.
                      </p>
                    </div>

                    {/* Recap */}
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

                      {selectedPage && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                          <User className="w-5 h-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Compte</p>
                            <p className="text-sm font-medium text-foreground">
                              {selectedPage.page_name}
                            </p>
                          </div>
                        </div>
                      )}

                      {formData.linkUrl && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                          <Link className="w-5 h-5 text-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Lien swipe-up</p>
                            <p className="text-sm text-foreground truncate">
                              {formData.linkUrl}
                            </p>
                          </div>
                        </div>
                      )}

                      {scheduledDate && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                          <Calendar className="w-5 h-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Planifié le</p>
                            <p className="text-sm font-medium text-foreground">
                              {scheduledDate.toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
                        <Clock className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-warning">
                            Expiration automatique
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Cette Story sera visible pendant 24h après sa publication, puis disparaîtra automatiquement.
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2.5 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <p className="text-xs text-destructive">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Retour
                      </Button>
                        <Button
                          onClick={() => handleSubmit()}
                          disabled={isPending}
                        size="lg"
                        className="flex-1 h-14 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.985]"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Upload en cours ({uploadProgress.percentage}%)
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Planifier
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Des données non sauvegardées</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des informations déjà saisies. Si vous fermez, elles seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer la saisie</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Fermer sans sauvegarder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
