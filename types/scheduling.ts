import type { PublishMode } from '@/types/post'

export type ImageSource =
  | { type: 'file'; file: File }
  | { type: 'url'; url: string }

export type ImageSourceMode = 'file' | 'url'

export interface ImageSourceState {
  source: ImageSource | null
  previewUrl: string
  validationStatus: 'idle' | 'validating' | 'valid' | 'invalid'
  validationError: string | null
}

export interface ReelFormData {
  file: File | null
  imageUrl: string
  caption: string
  hashtags: string[]
  scheduledAt: string
  accountId: string
  publishMode: PublishMode
}

export type ReelStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export interface StoryFormData {
  file: File | null
  imageUrl: string
  linkUrl: string
  scheduledAt: string
  accountId: string
  publishMode: PublishMode
}

export type StoryStatus = 'draft' | 'scheduled' | 'published' | 'failed'

export interface UploadProgress {
  percentage: number
  loaded: number
  total: number
}

export interface ScheduleResponse {
  id: string
  status: string
  scheduledAt: string | null
  expiresAt?: string | null
  permalink?: string | null
}
