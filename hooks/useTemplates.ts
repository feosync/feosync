import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import type { PostTemplate, CreateTemplateRequest } from '@/lib/api/types'

export const TEMPLATES_KEY = (orgId: string) => ['templates', orgId]

export function useTemplates(orgId: string) {
  return useQuery({
    queryKey: TEMPLATES_KEY(orgId),
    queryFn: () => apiClient.getTemplates(orgId),
    enabled: !!orgId,
  })
}

export function useCreateTemplate(orgId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => apiClient.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY(orgId) })
      toast.success('Template créé')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateTemplate(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTemplateRequest> }) =>
      apiClient.updateTemplate(id, orgId, data),  // ← passe orgId
    onSuccess: (updated: PostTemplate) => {
      queryClient.setQueryData<PostTemplate[]>(TEMPLATES_KEY(orgId), (prev = []) =>
        prev.map(t => t.id === updated.id ? updated : t)
      )
      toast.success('Template mis à jour')
    },
    onError: (err: Error) => toast.error(err.message ?? "Something went wrong")
,
  })
}

export function useDeleteTemplate(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTemplate(id, orgId),  // ← passe orgId
    onSuccess: (_, id) => {
      queryClient.setQueryData<PostTemplate[]>(TEMPLATES_KEY(orgId), (prev = []) =>
        prev.filter(t => t.id !== id)
      )
      toast.success('Template supprimé')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}