import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { FacebookPage } from '@/lib/api/types'

export const FB_QUERY_KEY = (orgId: string) => ['facebook-pages', orgId] as const
export const FB_INSIGHTS_KEY = (pageId: string) => ['fb-insights', pageId]

export function useFacebookPages(orgId: string) {
  return useQuery({
    queryKey: FB_QUERY_KEY(orgId),
    queryFn: () => apiClient.getFacebookPages(orgId),  
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2,     
    placeholderData: (prev) => prev, 
  })
}

export function useFacebookInsights(pageId: string, orgId: string) {
  return useQuery({
    queryKey: FB_INSIGHTS_KEY(pageId),
    queryFn: () => apiClient.getInsights(pageId, orgId),
    enabled: !!pageId && !!orgId,
  })
}

export function useConnectFacebookPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      fb_page_id: string
      page_name: string
      access_token: string
      org_id: string
    }) => apiClient.connectFacebookPage(data),
    onSuccess: (newPage: FacebookPage) => {
      queryClient.invalidateQueries({ queryKey: FB_QUERY_KEY(newPage.organisation_id) })
      toast.success('Page connectée', { description: newPage.page_name })
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useToggleFacebookPage(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pageId }: { pageId: string }) =>
      apiClient.toggleFacebookPage(pageId, orgId),
    onSuccess: (updated: FacebookPage) => {
      queryClient.setQueryData<FacebookPage[]>(FB_QUERY_KEY(orgId), (prev = []) =>
        prev.map(p => p.id === updated.id ? updated : p)
      )
      toast.success(updated.is_active ? 'Page activée' : 'Page désactivée')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useDisconnectFacebookPage(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pageId: string) => apiClient.disconnectFacebookPage(pageId, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FB_QUERY_KEY(orgId) })
      toast.success('Page déconnectée')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useSyncInsights(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pageId: string) => apiClient.syncInsights(pageId, orgId),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: FB_INSIGHTS_KEY(pageId) })
      toast.success('Insights synchronisés !')
    },
    onError: (err: any) => {
      toast.error('Échec de la synchronisation', { description: err.message })
    },
  })
}