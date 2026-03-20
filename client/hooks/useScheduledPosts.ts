import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { ScheduledPost, CaptionPatchRequest, ImagePatchRequest } from '@/lib/api/types'

export const POSTS_QUERY_KEY = (orgId: string) => ['scheduled-posts', orgId]
export const POST_QUERY_KEY  = (postId: string) => ['scheduled-post', postId]

export function useScheduledPosts(orgId: string) {
  return useQuery({
    queryKey: POSTS_QUERY_KEY(orgId),
    queryFn:  () => apiClient.getScheduledPosts(orgId),
    enabled:  !!orgId,
  })
}

export function useScheduledPost(postId: string) {
  return useQuery({
    queryKey: POST_QUERY_KEY(postId),
    queryFn:  () => apiClient.getScheduledPostById(postId),
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
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}

export function usePatchCaption(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CaptionPatchRequest }) =>
      apiClient.patchCaption(postId, data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.invalidateQueries({ queryKey: POST_QUERY_KEY(res.scheduled_post.id) })
      toast.success('Caption enregistré')
    },
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}

export function usePatchImage(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: ImagePatchRequest }) =>
      apiClient.patchImage(postId, data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.invalidateQueries({ queryKey: POST_QUERY_KEY(res.scheduled_post.id) })
      toast.success('Image enregistrée')
    },
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}

export function useUploadImage(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, file }: { postId: string; file: File }) =>
      apiClient.uploadImage(postId, file),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      queryClient.invalidateQueries({ queryKey: POST_QUERY_KEY(res.scheduled_post.id) })
      toast.success('Image uploadée')
    },
    onError: (err: any) => toast.error('Erreur upload', { description: err.message }),
  })
}

export function useConfirmPost(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, publish_at }: { postId: string; publish_at?: string }) =>
      apiClient.confirmScheduledPost(postId, { publish_at }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY(orgId) })
      toast.success('Post planifié !')
    },
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
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
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}