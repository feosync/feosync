import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { AutoCommentRequest, PublishedPost } from '@/lib/api/types'

export const PUBLISHED_KEY  = (orgId: string)  => ['published-posts', orgId]
export const PUBLISHED_ONE  = (postId: string) => ['published-post', postId]

export interface PublishedPostsParams {
  page?: number
  page_size?: number
  search?: string
  year?: number
  month?: number
  week?: number
}

export function usePublishedPosts(orgId: string, params?: PublishedPostsParams) {
  return useQuery({
    queryKey: [...PUBLISHED_KEY(orgId), params],
    queryFn: () => apiClient.getPublishedPosts(orgId, params),
    enabled: !!orgId,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2,
  })
}

export function usePublishedPost(postId: string) {
  return useQuery({
    queryKey: PUBLISHED_ONE(postId),
    queryFn: () => apiClient.getPublishedPostById(postId),
    enabled: !!postId,
  })
}

export function usePublishNow(orgId: string) {
  const queryClient = useQueryClient()
  

  return useMutation({
    mutationFn: (scheduledPostId: string) => apiClient.publishPost(scheduledPostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLISHED_KEY(orgId) })
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts', orgId] })
      toast.success('Post publié. Visible sur Facebook dans quelques secondes.')
    },
    onError: (err: any) => {
        toast.error('Erreur', { description: err.message })
    },
  })
}

export function useSyncMetrics(orgId: string) {
  const queryClient = useQueryClient()
  

  return useMutation({
    mutationFn: (publishedPostId: string) => apiClient.syncMetrics(publishedPostId),
    onSuccess: (updated: PublishedPost) => {
      queryClient.setQueryData<PublishedPost[]>(PUBLISHED_KEY(orgId), (prev = []) =>
        prev.map(p => p.id === updated.id ? updated : p)
      )
      queryClient.setQueryData(PUBLISHED_ONE(updated.id), updated)
      toast.success('Métriques synchronisées')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useDeletePublishedPost(orgId: string) {
  const queryClient = useQueryClient()
  

  return useMutation({
    mutationFn: (postId: string) => apiClient.deletePublishedPost(postId),
    onSuccess: (_, postId) => {
      queryClient.setQueryData<PublishedPost[]>(PUBLISHED_KEY(orgId), (prev = []) =>
        prev.filter(p => p.id !== postId)
      )
      toast.success('Post supprimé localement. Il peut rester visible sur Facebook.')        
    },
    onError: (err: any) => {
        toast.error('Erreur', { description: err.message })
    },
  })
}



export function useSetAutoComment(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: string
      payload: AutoCommentRequest
    }) => apiClient.setAutoComment(postId, payload),
    onSuccess: (updated: PublishedPost) => {
      // Met à jour la liste paginée
      queryClient.setQueryData<any>([...PUBLISHED_KEY(orgId)], (prev: any) => {
        if (!prev?.items) return prev
        return {
          ...prev,
          items: prev.items.map((p: PublishedPost) => p.id === updated.id ? updated : p),
        }
      })
      queryClient.setQueryData(PUBLISHED_ONE(updated.id), updated)
      toast.success(
        updated.is_auto_comment ? 'Auto-commentaire activé' : 'Auto-commentaire désactivé'
      )
    },
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}