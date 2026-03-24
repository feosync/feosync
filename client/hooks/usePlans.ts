import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { Plan, CreatePlanRequest, UpdatePlanRequest } from '@/lib/api/types'

const QUERY_KEY = ['plans']
const ADMIN_QUERY_KEY = ['admin', 'plans']

// ── Public ────────────────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.getPlans() as Promise<Plan[]>,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlanById(planId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, planId],
    queryFn: () => apiClient.getPlanById(planId) as Promise<Plan>,
    enabled: !!planId,
  })
}

export function useSubscribeToPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => apiClient.subscribeToPlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Abonnement souscrit avec succès')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useUnsubscribeFromPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.unsubscribeFromPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Désabonnement effectué')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useAdminAllPlans() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEY,
    queryFn: () => apiClient.adminGetAllPlans() as Promise<Plan[]>,
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePlanRequest) => apiClient.adminCreatePlan(data) as Promise<Plan>,
    onSuccess: (newPlan) => {
      queryClient.setQueryData<Plan[]>(ADMIN_QUERY_KEY, (prev = []) => [...prev, newPlan])
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Plan créé', { description: newPlan.name })
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useAdminUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: UpdatePlanRequest }) =>
      apiClient.adminUpdatePlan(planId, data) as Promise<Plan>,
    onSuccess: (updated) => {
      queryClient.setQueryData<Plan[]>(ADMIN_QUERY_KEY, (prev = []) =>
        prev.map(p => String(p.id) === String(updated.id) ? updated : p)
      )
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Plan mis à jour')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}

export function useAdminDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planId: string) => apiClient.adminDeletePlan(planId),
    onSuccess: (_, planId) => {
      queryClient.setQueryData<Plan[]>(ADMIN_QUERY_KEY, (prev = []) =>
        prev.filter(p => String(p.id) !== planId)
      )
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Plan supprimé')
    },
    onError: (err: any) => {
      toast.error('Erreur', { description: err.message })
    },
  })
}