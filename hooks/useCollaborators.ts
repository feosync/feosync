import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { toast } from "sonner"

const QUERY_KEY = ["collaborators"]

export function useCollaborators() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.getCollaborators(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useInviteCollaborator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => apiClient.inviteCollaborator(email),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(res.detail)
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message })
    },
  })
}

export function useRevokeCollaborator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (collaboratorId: string) => apiClient.revokeCollaborator(collaboratorId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(res.detail)
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message })
    },
  })
}

export function useAssignOrganizations() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      collaboratorId,
      organizationIds,
    }: {
      collaboratorId: string
      organizationIds: string[]
    }) => apiClient.assignOrganizations(collaboratorId, organizationIds),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success(res.detail)
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message })
    },
  })
}
