import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'



export function useAiHistory(orgId: string) {
  return useQuery({
    queryKey: ['ai-history', orgId],
    queryFn: () => apiClient.getAiHistory(orgId),
    enabled: !!orgId,
  })
}

export function useAiQuota(orgId: string) {
  return useQuery({
    queryKey: ['ai-quota', orgId],
    queryFn: () => apiClient.getAiQuota(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60,
  })
}