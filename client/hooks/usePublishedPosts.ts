import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { PublishedPost } from '@/lib/api/types'

export const PUBLISHED_KEY  = (orgId: string)  => ['published-posts', orgId]
export const PUBLISHED_ONE  = (postId: string) => ['published-post', postId]

export function usePublishedPosts(orgId: string) {
  return useQuery({
    queryKey: PUBLISHED_KEY(orgId),
    queryFn: () => apiClient.getPublishedPosts(orgId),
    enabled: !!orgId,
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