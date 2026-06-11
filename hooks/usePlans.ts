import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import type {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "@/lib/api/types";
import { useAuth } from "@/hooks/useAuth";

const QUERY_KEY = ["plans"];
const ADMIN_QUERY_KEY = ["admin", "plans"];

// ── Public ────────────────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiClient.getPlans(),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePlanById(planId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, planId],
    queryFn: () => apiClient.getPlanById(planId),
    enabled: !!planId,
  });
}

export function useSubscribeToPlan() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: (planId: string) => apiClient.subscribeToPlan(planId),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      //  Invalide aussi la liste admin users (plan_id affiché dans le tableau)
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Abonnement crée");
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message });
    },
  });
}

export function useUpgradeSubcription() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();
  return useMutation({
    mutationFn: ({
      stripe_price_id,
      stripe_subscription_id,
    }: {
      stripe_price_id: string;
      stripe_subscription_id: string;
    }) => apiClient.upgradePlan(stripe_price_id, stripe_subscription_id),
    onSuccess: (subcription) => {
      updateUser(subcription.user)
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Abonnement mis à jour");
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useUnsubscribeFromPlan() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: () => apiClient.unsubscribeFromPlan(),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Désabonnement effectué");
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useAdminAllPlans() {
  return useQuery({
    queryKey: ADMIN_QUERY_KEY,
    queryFn: () => apiClient.adminGetAllPlans(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanRequest) =>
      apiClient.adminCreatePlan(data),
    onSuccess: (newPlan) => {
      queryClient.setQueryData<Plan[]>(ADMIN_QUERY_KEY, (prev = []) => [
        ...prev,
        newPlan,
      ]);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Plan créé", { description: newPlan.name });
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message });
    },
  });
}

export function useAdminUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      data,
    }: {
      planId: string;
      data: UpdatePlanRequest;
    }) => apiClient.adminUpdatePlan(planId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Plan[]>(ADMIN_QUERY_KEY, (prev = []) =>
        prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)),
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Plan mis à jour");
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message });
    },
  });
}

export function useAdminDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => apiClient.adminDeletePlan(planId),
    onSuccess: (_, planId) => {
      queryClient.setQueryData<Plan[]>(ADMIN_QUERY_KEY, (prev = []) =>
        prev.filter((p) => String(p.id) !== planId),
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Plan supprimé");
    },
    onError: (err: Error) => {
      toast.error("Erreur", { description: err.message });
    },
  });
}
