import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useToast } from '@/hooks/use-toast'
import type { FacebookPage, PageInsights } from '@/lib/api/types'

export const FB_QUERY_KEY = (orgId: string) => ['facebook-pages', orgId]
export const FB_INSIGHTS_KEY = (pageId: string) => ['fb-insights', pageId]

export function useFacebookPages(orgId: string) {
  return useQuery({
    queryKey: FB_QUERY_KEY(orgId),
    queryFn: () => apiClient.getFacebookPages(orgId),
    enabled: !!orgId,
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: {
      fb_page_id: string
      page_name: string
      access_token: string
      org_id: string
    }) => apiClient.connectFacebookPage(data),
    onSuccess: (newPage: FacebookPage) => {
      queryClient.invalidateQueries({ queryKey: FB_QUERY_KEY(newPage.organisation_id) })
      toast({ title: 'Page connectée', description: newPage.page_name })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}

export function useToggleFacebookPage(orgId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ pageId }: { pageId: string }) =>
      apiClient.toggleFacebookPage(pageId, orgId),
    onSuccess: (updated: FacebookPage) => {
      queryClient.setQueryData<FacebookPage[]>(FB_QUERY_KEY(orgId), (prev = []) =>
        prev.map(p => p.id === updated.id ? updated : p)
      )
      toast({ title: updated.is_active ? 'Page activée' : 'Page désactivée' })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDisconnectFacebookPage(orgId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (pageId: string) => apiClient.disconnectFacebookPage(pageId, orgId),
    onSuccess: (_, pageId) => {
      queryClient.setQueryData<FacebookPage[]>(FB_QUERY_KEY(orgId), (prev = []) =>
        prev.filter(p => p.id !== pageId)
      )
      toast({ title: 'Page déconnectée' })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}

export function useSyncInsights(orgId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (pageId: string) => apiClient.syncInsights(pageId, orgId),
    onSuccess: (_, pageId) => {
      queryClient.invalidateQueries({ queryKey: FB_INSIGHTS_KEY(pageId) })
      toast({ title: 'Insights synchronisés' })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur sync', description: err.message, variant: 'destructive' })
    },
  })
}