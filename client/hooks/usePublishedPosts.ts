import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useToast } from '@/hooks/use-toast'
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (scheduledPostId: string) => apiClient.publishPost(scheduledPostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLISHED_KEY(orgId) })
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts', orgId] })
      toast({ title: 'Post publié !', description: 'Visible sur Facebook.' })
    },
    onError: (err: any) => {
      toast({ title: 'Échec', description: err.message, variant: 'destructive' })
    },
  })
}

export function useSyncMetrics(orgId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (publishedPostId: string) => apiClient.syncMetrics(publishedPostId),
    onSuccess: (updated: PublishedPost) => {
      queryClient.setQueryData<PublishedPost[]>(PUBLISHED_KEY(orgId), (prev = []) =>
        prev.map(p => p.id === updated.id ? updated : p)
      )
      queryClient.setQueryData(PUBLISHED_ONE(updated.id), updated)
      toast({ title: 'Métriques synchronisées' })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur sync', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeletePublishedPost(orgId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (postId: string) => apiClient.deletePublishedPost(postId),
    onSuccess: (_, postId) => {
      queryClient.setQueryData<PublishedPost[]>(PUBLISHED_KEY(orgId), (prev = []) =>
        prev.filter(p => p.id !== postId)
      )
      toast({ title: 'Post supprimé localement' })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}