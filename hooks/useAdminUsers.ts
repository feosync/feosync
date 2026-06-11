import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { UserDetail, UserSummary, PaginatedResponse } from '@/lib/api/types'

const QUERY_KEY = ['admin', 'users']

export function useAdminUsers(params?: {
  page?: number
  page_size?: number
  search?: string
}) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => apiClient.adminGetAllUsers(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,  
  })
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, userId],
    queryFn: () => apiClient.adminGetUserById(userId),
    enabled: !!userId,
  })
}

export function useAdminPromoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.adminPromoteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Utilisateur promu admin')
    },
    onError: (err: Error) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useAdminDemoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.adminDemoteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Utilisateur rétrogradé')
    },
    onError: (err: Error) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.adminDeleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Utilisateur supprimé')
    },
    onError: (err: Error) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}