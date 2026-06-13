'use client'

import { useRef, useCallback } from 'react'
import { Upload, Link as LinkIcon, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useImageSource } from '@/hooks/useImageSource'
import type { ImageSourceMode, ImageSource } from '@/types/scheduling'

interface ImageSourcePickerProps {
  value: ImageSource | null
  onChange: (source: ImageSource | null) => void
  accept?: string
  maxSizeMB?: number
  showAsVideo?: boolean
  urlPlaceholder?: string
  urlLabel?: string
}

export function ImageSourcePicker({
  value,
  onChange,
  accept = 'image/*',
  maxSizeMB = 10,
  showAsVideo = false,
  urlPlaceholder = 'https://example.com/image.jpg',
  urlLabel = "URL d'image",
}: ImageSourcePickerProps) {
  const {
    state,
    mode,
    setMode,
    handleFileSelect,
    handleUrlChange,
    handleUrlBlur,
    reset,
    hasValidSource,
  } = useImageSource()

  const fileRef = useRef<HTMLInputElement>(null)

  const handleModeChange = useCallback((newMode: ImageSourceMode) => {
    reset()
    onChange(null)
    setMode(newMode)
  }, [reset, onChange, setMode])

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const maxBytes = maxSizeMB * 1024 * 1024
    if (f.size > maxBytes) return
    handleFileSelect(f)
    onChange({ type: 'file', file: f })
  }, [maxSizeMB, handleFileSelect, onChange])

  const onUrlChange = useCallback((url: string) => {
    handleUrlChange(url)
  }, [handleUrlChange])

  const onUrlBlur = useCallback(() => {
    handleUrlBlur()
    if (state.source?.type === 'url') {
      onChange(state.source)
    }
  }, [handleUrlBlur, state.source, onChange])

  const handleRemove = useCallback(() => {
    reset()
    onChange(null)
  }, [reset, onChange])

  const hasPreview = state.previewUrl && (state.validationStatus === 'valid' || state.validationStatus === 'validating')

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-2xl">
        <button
          onClick={() => handleModeChange('file')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
            mode === 'file'
              ? 'bg-card shadow-sm text-foreground border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/60',
          )}
        >
          <Upload className="w-4 h-4" />
          Upload fichier
        </button>
        <button
          onClick={() => handleModeChange('url')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all',
            mode === 'url'
              ? 'bg-card shadow-sm text-foreground border border-border'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/60',
          )}
        >
          <LinkIcon className="w-4 h-4" />
          {urlLabel}
        </button>
      </div>

      {/* File Upload Mode */}
      {mode === 'file' && (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={onFileSelect}
          />
          {!value ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-card"
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-sm text-foreground">Cliquez pour sélectionner</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP — Max {maxSizeMB}MB</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted">
              {showAsVideo ? (
                <video
                  src={state.previewUrl}
                  className="w-full max-h-52 object-contain"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={state.previewUrl}
                  alt="Preview"
                  className="w-full max-h-52 object-contain"
                />
              )}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0.5">
                  <Upload className="w-3 h-3" />
                  Upload
                </Badge>
              </div>
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-destructive rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="space-y-3">
          <input
            type="url"
            value={state.previewUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            onBlur={onUrlBlur}
            placeholder={urlPlaceholder}
            className={cn(
              'w-full h-11 px-4 rounded-xl border bg-card text-foreground placeholder:text-muted-foreground transition-all',
              'focus:ring-2 focus:ring-ring focus:border-transparent',
              state.validationStatus === 'invalid' && 'border-destructive focus:ring-destructive',
              state.validationStatus === 'valid' && 'border-success',
            )}
          />

          {/* URL Preview */}
          {hasPreview && (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-muted animate-fade-in">
              {state.validationStatus === 'validating' && (
                <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Vérification...</span>
                  </div>
                </div>
              )}
              {showAsVideo ? (
                <video
                  src={state.previewUrl}
                  className={cn(
                    'w-full max-h-52 object-contain transition-opacity',
                    state.validationStatus === 'validating' && 'opacity-30',
                  )}
                  controls
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={state.previewUrl}
                  alt="Preview"
                  className={cn(
                    'w-full max-h-52 object-contain transition-opacity',
                    state.validationStatus === 'validating' && 'opacity-30',
                  )}
                  onError={() => {
                    // handled by useImageSource validation
                  }}
                />
              )}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-[10px] gap-1 px-2 py-0.5">
                  <LinkIcon className="w-3 h-3" />
                  Via URL
                </Badge>
              </div>
              {(state.validationStatus === 'valid' || state.validationStatus === 'validating') && (
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-destructive rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Validation Status */}
          {state.validationStatus === 'valid' && state.source && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              <span className="text-xs text-success">Image valide</span>
            </div>
          )}

          {state.validationStatus === 'invalid' && state.validationError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive">{state.validationError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
