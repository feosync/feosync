'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileVideo, FileImage, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadProgress } from '@/types/scheduling'

interface MediaUploadZoneProps {
  accept: string
  acceptLabel: string
  maxSizeMB: number
  file: File | null
  previewUrl: string
  isVideo: boolean
  progress: UploadProgress
  isUploading: boolean
  error: string | null
  onFileSelect: (file: File) => void
  onFileRemove: () => void
}

export function MediaUploadZone({
  accept,
  acceptLabel,
  maxSizeMB,
  file,
  previewUrl,
  isVideo,
  progress,
  isUploading,
  error,
  onFileSelect,
  onFileRemove,
}: MediaUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const validateAndSelect = useCallback(
    (f: File) => {
      const maxBytes = maxSizeMB * 1024 * 1024
      if (f.size > maxBytes) {
        return
      }
      onFileSelect(f)
    },
    [maxSizeMB, onFileSelect],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) validateAndSelect(f)
    },
    [validateAndSelect],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) validateAndSelect(f)
    },
    [validateAndSelect],
  )

  if (file && previewUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden border border-border bg-muted">
        {isVideo ? (
          <video
            src={previewUrl}
            className="w-full max-h-[400px] object-contain"
            controls
            playsInline
          />
        ) : (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-h-[400px] object-contain"
          />
        )}
        <button
          onClick={onFileRemove}
          disabled={isUploading}
          className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-destructive rounded-full flex items-center justify-center text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">
              {progress.percentage}%
            </span>
          </div>
        )}
      </div>
    )
  }

  const Icon = isVideo ? FileVideo : FileImage

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
        )}
      >
        <div className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors',
          isDragOver ? 'bg-primary/10' : 'bg-muted',
        )}>
          <Upload className={cn(
            'w-6 h-6 transition-colors',
            isDragOver ? 'text-primary' : 'text-muted-foreground',
          )} />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          {isDragOver ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier'}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          ou <span className="text-primary underline underline-offset-2 cursor-pointer">parcourez</span>
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          {acceptLabel}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
