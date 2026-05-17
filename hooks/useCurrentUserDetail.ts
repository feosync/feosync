import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { UserDetail } from '@/lib/api/types'

const QUERY_KEY = ['user', 'me']

export function useCurrentUserDetail() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: (): Promise<UserDetail> => apiClient.getCurrentUserDetail(),
    staleTime: 1000 * 60 * 5,
  })
}