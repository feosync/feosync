import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { User, UserSummary, PaginatedResponse } from '@/lib/api/types'

const QUERY_KEY = ['admin', 'users']

export function useAdminUsers(params?: {
  page?: number
  page_size?: number
  search?: string
}) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => apiClient.adminGetAllUsers(params) as Promise<PaginatedResponse<UserSummary>>,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,  
  })
}

export function useAdminUserDetail(userId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, userId],
    queryFn: () => apiClient.adminGetUserById(userId) as Promise<User>,
    enabled: !!userId,
  })
}

export function useAdminPromoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.adminPromoteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<UserSummary[]>(QUERY_KEY, (prev = []) =>
        prev.map(u => u.id === userId ? { ...u, is_admin: true } : u)
      )
      toast.success('Utilisateur promu admin')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useAdminDemoteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.adminDemoteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<UserSummary[]>(QUERY_KEY, (prev = []) =>
        prev.map(u => u.id === userId ? { ...u, is_admin: false } : u)
      )
      toast.success('Utilisateur rétrogradé')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => apiClient.adminDeleteUser(userId),
    onSuccess: (_, userId) => {
      queryClient.setQueryData<UserSummary[]>(QUERY_KEY, (prev = []) =>
        prev.filter(u => u.id !== userId)
      )
      toast.success('Utilisateur supprimé')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}