import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type {
  PageAnalysisResponse,
  PostsWithReactionsResponse,
  AnalyticsPeriod,
} from '@/lib/api/types'

export const PAGE_ANALYSIS_KEY = (fbModelId: string, period: string) =>
  ['page-analysis', fbModelId, period]

export const POSTS_REACTIONS_KEY = (fbModelId: string) =>
  ['posts-reactions', fbModelId]

export function usePageAnalysis(
  fbModelId: string,
  orgId: string,
  period: AnalyticsPeriod = 'week'
) {
  return useQuery({
    queryKey: PAGE_ANALYSIS_KEY(fbModelId, period),
    queryFn: () => apiClient.getPageAnalysis(fbModelId, orgId, period),
    enabled: !!fbModelId && !!orgId,
    staleTime: 1000 * 60 * 5,   // 5 min — données Meta pas temps réel
    placeholderData: (prev) => prev,
  })
}

export function usePostsWithReactions(
  fbModelId: string,
  orgId: string,
  params?: { limit?: number; after?: string }
) {
  return useQuery({
    queryKey: [...POSTS_REACTIONS_KEY(fbModelId), params],
    queryFn: () => apiClient.getPostsWithReactions(fbModelId, orgId, params),
    enabled: !!fbModelId && !!orgId,
    staleTime: 1000 * 60 * 3,
    placeholderData: (prev) => prev,
  })
}
