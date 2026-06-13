'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type {
  ScheduledPost, CaptionPatchRequest, CaptionPatchResponse, ImageAddRequest,
  AddImageResponse, PostStatus,
} from '@/lib/api/types'

export const POSTS_QUERY_KEY = (orgId: string) => ['scheduled-posts', orgId]
export const POST_QUERY_KEY  = (postId: string) => ['scheduled-post', postId]

export interface ScheduledPostsParams {
  page?: number
  page_size?: number
  status?: PostStatus | 'all'
  search?: string
  year?: number
  month?: number
  week?: number
}

export function useScheduledPosts(orgId: string, params?: ScheduledPostsParams) {
  const apiParams = {
    ...params,
    status: params?.status === 'all' ? undefined : params?.status,
  }
  return useQuery({
    queryKey: [...POSTS_QUERY_KEY(orgId), apiParams],
    queryFn: () => apiClient.getScheduledPosts(orgId, apiParams),
    enabled: !!orgId,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2,
  })
}

export function useScheduledPost(postId: string | null | undefined) {
  return useQuery({
    queryKey: POST_QUERY_KEY(postId ?? ''),
    queryFn:  () => apiClient.getScheduledPostById(postId!),
    enabled:  !!postId,
  })
}

export function useCreateScheduledPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { facebook_page_id: string; publish_at?: string }) =>
      apiClient.createScheduledPost(data),
    onSuccess: (post: ScheduledPost) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(post.organisation_id) })
      toast.success('Brouillon créé')
    },
    onError: (err: Error) => toast.error('Erreur', { description: err.message }),
  })
}

export function usePatchCaption(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CaptionPatchRequest }) =>
      apiClient.patchCaption(postId, data),
    onSuccess: (res: CaptionPatchResponse) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.setQueryData(POST_QUERY_KEY(res.scheduled_post.id), res.scheduled_post)
      toast.success('Caption enregistré')
    },
    onError: (err: Error) => toast.error('Erreur', { description: err.message }),
  })
}

// ── Image mutations ───────────────────────────────────────────────────────────

export function useAddImage(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: ImageAddRequest }) =>
      apiClient.addImage(postId, data),
    onSuccess: (res: AddImageResponse) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.setQueryData(POST_QUERY_KEY(res.scheduled_post.id), res.scheduled_post)
      toast.success('Image ajoutée')
    },
    onError: (err: Error) => toast.error('Erreur', { description: err.message }),
  })
}

export function useAddImageUpload(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, file }: { postId: string; file: File }) =>
      apiClient.addImageUpload(postId, file),
    onSuccess: (res: AddImageResponse) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.setQueryData(POST_QUERY_KEY(res.scheduled_post.id), res.scheduled_post)
      toast.success('Image uploadée')
    },
    onError: (err: Error) => toast.error('Erreur upload', { description: err.message }),
  })
}

export function useRemoveImage(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      apiClient.removeImage(postId, imageId),
    onSuccess: (updatedPost: ScheduledPost) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.setQueryData(POST_QUERY_KEY(updatedPost.id), updatedPost)
      toast.success('Image supprimée')
    },
    onError: (err: Error) => toast.error('Erreur', { description: err.message }),
  })
}

export function useReorderImages(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, orderedIds }: { postId: string; orderedIds: string[] }) =>
      apiClient.reorderImages(postId, orderedIds),
    onSuccess: (updatedPost: ScheduledPost) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.setQueryData(POST_QUERY_KEY(updatedPost.id), updatedPost)
    },
    onError: (err: Error) => toast.error('Erreur', { description: err.message }),
  })
}

// ── Confirm / Delete ──────────────────────────────────────────────────────────

export function useConfirmPost(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, publish_at }: { postId: string; publish_at?: string }) =>
      apiClient.confirmScheduledPost(postId, { publish_at }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      toast.success('Post planifié !')
    },
    onError: (err: Error) => toast.error('Erreur', { description: err.message }),
  })
}

export function useDeleteScheduledPost(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) => apiClient.deleteScheduledPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      toast.success('Post supprimé')
    },
    onError: (err: Error) => toast.error('Erreur', { description: err.message }),
  })
}


