import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { Organisation, CreateOrgRequest, UpdateOrgRequest } from '@/lib/api/types'

const QUERY_KEY = ['organisations']

export function useOrganisations() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.getOrganisations(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateOrganisation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrgRequest) => apiClient.createOrganisation(data),
    onSuccess: (newOrg) => {
      queryClient.setQueryData<Organisation[]>(QUERY_KEY, (prev = []) => [...prev, newOrg])
      toast.success('Organisation créée', { description: newOrg.name })
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
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
      toast.success('Organisation mise à jour')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
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
      toast.success('Organisation supprimée')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}