'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ImageSource, ImageSourceMode, ImageSourceState } from '@/types/scheduling'

const URL_REGEX = /^https?:\/\/.+\/.+$/i

interface UseImageSourceReturn {
  state: ImageSourceState
  mode: ImageSourceMode
  setMode: (mode: ImageSourceMode) => void
  handleFileSelect: (file: File) => void
  handleUrlChange: (url: string) => void
  handleUrlBlur: () => void
  reset: () => void
  hasValidSource: boolean
}

export function useImageSource(initialUrl?: string): UseImageSourceReturn {
  const [mode, setMode] = useState<ImageSourceMode>('file')
  const [state, setState] = useState<ImageSourceState>({
    source: null,
    previewUrl: initialUrl ?? '',
    validationStatus: 'idle',
    validationError: null,
  })
  const validationTimer = useRef<ReturnType<typeof setTimeout>>()
  const abortRef = useRef<AbortController>()

  useEffect(() => {
    return () => {
      if (validationTimer.current) clearTimeout(validationTimer.current)
      abortRef.current?.abort()
    }
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    if (state.previewUrl && !state.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.previewUrl)
    }
    const previewUrl = URL.createObjectURL(file)
    setState({
      source: { type: 'file', file },
      previewUrl,
      validationStatus: 'valid',
      validationError: null,
    })
  }, [state.previewUrl])

  const reset = useCallback(() => {
    if (state.previewUrl && state.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(state.previewUrl)
    }
    setState({
      source: null,
      previewUrl: '',
      validationStatus: 'idle',
      validationError: null,
    })
  }, [state.previewUrl])

  const validateUrl = useCallback(async (url: string) => {
    abortRef.current?.abort()

    if (!URL_REGEX.test(url)) {
      setState(prev => ({
        ...prev,
        validationStatus: 'invalid',
        validationError: 'URL invalide — doit commencer par http:// ou https://',
      }))
      return
    }

    setState(prev => ({ ...prev, validationStatus: 'validating', validationError: null }))

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
      const contentType = res.headers.get('content-type') || ''

      if (!contentType.startsWith('image/') && !contentType.startsWith('video/') && contentType !== 'application/octet-stream') {
        setState(prev => ({
          ...prev,
          validationStatus: 'invalid',
          validationError: 'Média inaccessible — vérifiez le lien',
        }))
        return
      }

      setState(prev => ({
        ...prev,
        source: { type: 'url', url },
        validationStatus: 'valid',
        validationError: null,
      }))
    } catch {
      if (!controller.signal.aborted) {
        setState(prev => ({
          ...prev,
          validationStatus: 'invalid',
          validationError: 'Image inaccessible — vérifiez le lien',
        }))
      }
    }
  }, [])

  const handleUrlChange = useCallback((url: string) => {
    setState(prev => ({ ...prev, previewUrl: url, source: null, validationStatus: url ? 'idle' : 'idle' }))

    if (validationTimer.current) clearTimeout(validationTimer.current)

    if (!url.trim()) {
      setState(prev => ({ ...prev, validationStatus: 'idle', validationError: null }))
      return
    }

    validationTimer.current = setTimeout(() => validateUrl(url.trim()), 600)
  }, [validateUrl])

  const handleUrlBlur = useCallback(() => {
    if (validationTimer.current) clearTimeout(validationTimer.current)
    if (state.previewUrl.trim()) {
      validateUrl(state.previewUrl.trim())
    }
  }, [state.previewUrl, validateUrl])

  const hasValidSource = state.source !== null && state.validationStatus === 'valid'

  return {
    state,
    mode,
    setMode,
    handleFileSelect,
    handleUrlChange,
    handleUrlBlur,
    reset,
    hasValidSource,
  }
}
