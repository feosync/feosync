import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { Organisation, CreateOrgRequest, UpdateOrgRequest, PaginatedResponse } from '@/lib/api/types'

const QUERY_KEY = ['organisations']

export function useOrganisations(params?: {
  page?: number
  page_size?: number
  search?: string
}) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => apiClient.getOrganisations(params) as Promise<PaginatedResponse<Organisation>>,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  })
}

export function useCreateOrganisation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrgRequest) => apiClient.createOrganisation(data),
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Organisation créée', { description: newOrg.name })
    },
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}

export function useUpdateOrganisation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgRequest }) =>
      apiClient.updateOrganisation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Organisation mise à jour')
    },
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}

export function useDeleteOrganisation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteOrganisation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Organisation supprimée')
    },
    onError: (err: any) => toast.error('Erreur', { description: err.message }),
  })
}