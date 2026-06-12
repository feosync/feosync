import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

export function useMyRole() {
  return useQuery({
    queryKey: ["my-role"],
    queryFn: () => apiClient.getMyCollaboratorRole(),
    staleTime: 1000 * 60 * 5,
  })
}
