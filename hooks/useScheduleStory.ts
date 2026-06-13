'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { config } from '@/lib/config'
import type { StoryFormData, UploadProgress, ScheduleResponse } from '@/types/scheduling'

const API_BASE_URL = config.apiUrl || ''

interface UseScheduleStoryReturn {
  step: number
  setStep: (step: number) => void
  formData: StoryFormData
  updateFormData: (data: Partial<StoryFormData>) => void
  uploadProgress: UploadProgress
  isPending: boolean
  error: string | null
  handleSubmit: (overridePublishMode?: string) => Promise<void>
  reset: () => void
}

const STORAGE_KEY = 'feosync_story_draft'

function loadDraft(): Partial<StoryFormData> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveDraft(data: Partial<StoryFormData>) {
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

export function useScheduleStory(onSuccess?: () => void): UseScheduleStoryReturn {
  const draft = loadDraft()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<StoryFormData>({
    file: null,
    imageUrl: draft.imageUrl ?? '',
    linkUrl: draft.linkUrl ?? '',
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

  const updateFormData = useCallback((data: Partial<StoryFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...data }
      saveDraft(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setStep(0)
    setFormData({ file: null, imageUrl: '', linkUrl: '', scheduledAt: '', accountId: '', publishMode: 'scheduled' })
    setUploadProgress({ percentage: 0, loaded: 0, total: 0 })
    setError(null)
    clearDraft()
  }, [])

  const handleSubmit = useCallback(async (overridePublishMode?: string) => {
    const hasFile = !!formData.file
    const hasUrl = !!formData.imageUrl
    if (!hasFile && !hasUrl) return

    const effectivePublishMode = overridePublishMode || formData.publishMode

    setIsPending(true)
    setError(null)

    try {
      const body = new FormData()
      if (hasUrl) {
        body.append('image_url', formData.imageUrl)
      }
      if (formData.linkUrl) {
        body.append('link_url', formData.linkUrl)
      }
      if (formData.scheduledAt) {
        body.append('scheduled_at', new Date(formData.scheduledAt).toISOString())
      }
      body.append('publish_mode', effectivePublishMode)
      body.append('account_id', formData.accountId)

      const response = await new Promise<ScheduleResponse>((resolve, reject) => {
        if (hasUrl) {
          fetch(`${API_BASE_URL}/api/v1/posts/stories`, {
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
          xhr.open('POST', `${API_BASE_URL}/api/v1/posts/stories`)
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
        toast.success('Story publiée sur Facebook avec succès')
      } else {
        toast.success('Story planifiée avec succès')
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
