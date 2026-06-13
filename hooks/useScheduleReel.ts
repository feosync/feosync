'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { config } from '@/lib/config'
import type { ReelFormData, UploadProgress, ScheduleResponse } from '@/types/scheduling'

const API_BASE_URL = config.apiUrl || ''

interface UseScheduleReelReturn {
  step: number
  setStep: (step: number) => void
  formData: ReelFormData
  updateFormData: (data: Partial<ReelFormData>) => void
  uploadProgress: UploadProgress
  isPending: boolean
  error: string | null
  handleSubmit: () => Promise<void>
  reset: () => void
}

const STORAGE_KEY = 'feosync_reel_draft'

function loadDraft(): Partial<ReelFormData> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveDraft(data: Partial<ReelFormData>) {
  try {
    const { file, ...rest } = data
    const serializable = { ...rest, file: file ? '__file__' : null }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {}
}

function clearDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export function useScheduleReel(onSuccess?: () => void): UseScheduleReelReturn {
  const draft = loadDraft()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<ReelFormData>({
    file: null,
    imageUrl: draft.imageUrl ?? '',
    caption: draft.caption ?? '',
    hashtags: draft.hashtags ?? [],
    scheduledAt: draft.scheduledAt ?? '',
    accountId: draft.accountId ?? '',
    publishMode: 'scheduled',
  })
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percentage: 0,
    loaded: 0,
    total: 0,
  })
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startTimeRef = useRef<number>(0)

  const updateFormData = useCallback((data: Partial<ReelFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...data }
      saveDraft(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setStep(0)
    setFormData({ file: null, imageUrl: '', caption: '', hashtags: [], scheduledAt: '', accountId: '', publishMode: 'scheduled' })
    setUploadProgress({ percentage: 0, loaded: 0, total: 0 })
    setError(null)
    clearDraft()
  }, [])

  const handleSubmit = useCallback(async () => {
    const hasFile = !!formData.file
    const hasUrl = !!formData.imageUrl
    if (!hasFile && !hasUrl) return

    setIsPending(true)
    setError(null)
    startTimeRef.current = Date.now()

    try {
      const body = new FormData()
      if (hasUrl) {
        body.append('image_url', formData.imageUrl)
      }
      body.append('caption', formData.caption)
      body.append('hashtags', formData.hashtags.join(','))
      if (formData.scheduledAt) {
        body.append('scheduled_at', new Date(formData.scheduledAt).toISOString())
      } else if (formData.publishMode === 'immediate') {
        body.append('publish_mode', 'immediate')
      }
      body.append('account_id', formData.accountId)

      const response = await new Promise<ScheduleResponse>((resolve, reject) => {
        if (hasUrl) {
          fetch(`${API_BASE_URL}/api/v1/posts/reels`, {
            method: 'POST',
            body,
            credentials: 'include',
          })
            .then(async (res) => {
              if (res.ok) return res.json()
              const err = await res.json().catch(() => ({}))
              throw new Error(err.detail || 'Erreur lors de la planification')
            })
            .then(resolve)
            .catch(reject)
        } else {
          body.append('file', formData.file!)
          const xhr = new XMLHttpRequest()
          xhr.open('POST', `${API_BASE_URL}/api/v1/posts/reels`)
          xhr.withCredentials = true

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress({
                percentage: Math.round((e.loaded / e.total) * 100),
                loaded: e.loaded,
                total: e.total,
              })
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              try {
                const err = JSON.parse(xhr.responseText)
                reject(new Error(err.detail || 'Upload échoué'))
              } catch {
                reject(new Error('Upload échoué — vérifiez le format du fichier'))
              }
            }
          }

          xhr.onerror = () => reject(new Error('Erreur réseau'))
          xhr.send(body)
        }
      })

      if (response.status === 'published') {
        toast.success('Reel publié sur Facebook avec succès')
      } else {
        toast.success('Reel planifié avec succès')
      }
      clearDraft()
      onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
      toast.error('Échec de la planification', { description: msg })
    } finally {
      setIsPending(false)
    }
  }, [formData, onSuccess])

  return {
    step,
    setStep,
    formData,
    updateFormData,
    uploadProgress,
    isPending,
    error,
    handleSubmit,
    reset,
  }
}
