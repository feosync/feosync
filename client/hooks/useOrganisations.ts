import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from '@/hooks/use-toast'
import type { Organisation, CreateOrgRequest, UpdateOrgRequest } from '@/lib/api/types'

const QUERY_KEY = ['organisations']

export function useOrganisations() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.getOrganisations(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useCreateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrgRequest) => apiClient.createOrganisation(data),
    onSuccess: (newOrg) => {
      // Mise à jour optimiste du cache — pas de refetch
      queryClient.setQueryData<Organisation[]>(QUERY_KEY, (prev = []) => [...prev, newOrg])
      toast({ title: 'Organisation créée', description: newOrg.name })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}

export function useUpdateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgRequest }) =>
      apiClient.updateOrganisation(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Organisation[]>(QUERY_KEY, (prev = []) =>
        prev.map(o => o.id === updated.id ? updated : o)
      )
      toast({ title: 'Organisation mise à jour' })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteOrganisation(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Organisation[]>(QUERY_KEY, (prev = []) =>
        prev.filter(o => o.id !== id)
      )
      toast({ title: 'Organisation supprimée' })
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' })
    },
  })
}