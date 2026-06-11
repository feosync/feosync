import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { Notification } from '@/lib/api/types'

const NOTIF_KEY = ['notifications']
const SUMMARY_KEY = ['notif-summary']

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: [...NOTIF_KEY, unreadOnly],
    queryFn: () => apiClient.getNotifications(unreadOnly),
  })
}

export function useNotificationSummary() {
  return useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: () => apiClient.getNotificationSummary(),
    staleTime: 1000 * 30,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_KEY })
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_KEY })
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY })
      toast.success('Toutes les notifications marquées comme lues')
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_KEY })
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY })
      toast.success('Notification supprimée')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}