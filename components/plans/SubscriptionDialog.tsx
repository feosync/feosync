"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  LogOut,
  ArrowUp,
  ArrowDown,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  usePlans,
  useSubscribeToPlan,
  useUnsubscribeFromPlan,
} from "@/hooks/usePlans";
import type { Plan } from "@/lib/api/types";
import { PlanCard, type PlanAction } from "@/components/plans/PlanCard";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { PaymentDialog } from "@/app/stripe/paymentDialogue";
import { UnsubscribeConfirmDialog } from "@/components/plans/UnsubcribeDialog";
import { UpDowngradeCreateDialogue } from "./UpDowngradeCreateDialogue";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface PendingChange {
  plan: Plan;
  action: PlanAction;
}

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const STYLES = {
  dialog:
    "bg-background/95 backdrop-blur-2xl sm:max-w-full lg:max-w-full w-full h-full flex flex-col  border border-border/70 shadow-2xl overflow-hidden",
  alertDialog:
    "bg-accent backdrop-blur-xl border border-border h-2/3 rounded-3xl max-w-md w-[calc(100%-2rem)]",
  header: "flex-shrink-0 px-6 sm:px-8 pt-6 pb-4",
  grid: "flex-1 overflow-y-auto px-6 sm:px-8 py-6 flex justify-center items-center",
  footer:
    "flex-shrink-0 px-6 sm:px-8 py-5 border-t border-border flex items-center gap-3",
} as const;

export function SubscriptionDialog({
  open,
  onOpenChange,
}: SubscriptionDialogProps) {
  const { user } = useAuth();
  const { data: plans = [], isLoading } = usePlans();
  const subscribeMutation = useSubscribeToPlan();
  const unsubscribeMutation = useUnsubscribeFromPlan();

  const [currentPlanId, setCurrentPlanId] = useState<number | null>(
    user?.plan_id ?? null,
  );
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [confirmUnsub, setConfirmUnsub] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null);

  useEffect(() => {
    setCurrentPlanId(user?.plan_id ?? null);
  }, [user?.plan_id]);

  const activePlans = useMemo(() => plans.filter((p) => p.is_active), [plans]);
  const currentPlanIndex = useMemo(
    () => activePlans.findIndex((p) => p.id === currentPlanId),
    [activePlans, currentPlanId],
  );
  const currentPlan =
    currentPlanIndex >= 0 ? activePlans[currentPlanIndex] : null;
  const isSubscribed = !!currentPlanId;

  // ==================== HANDLERS ====================
  const handleSubscribeClick = (plan: Plan, action: PlanAction) => {
    if (action === "CURRENT" || action === "UNAVAILABLE") return;
    if (plan.price > 0 && action === "CREATE") {
      setPaymentPlan(plan);
      return;
    }
    setPending({ plan, action });
  };

  const handleConfirm = async () => {
    if (!pending) return;
    try {
      await subscribeMutation.mutateAsync(String(pending.plan.id));
      setCurrentPlanId(pending.plan.id);
      setPending(null);

      if (pending.action === "UPGRADE") {
        toast.success(`Upgrade vers ${pending.plan.name} activé !`);
      } else if (pending.action === "DOWNGRADE") {
        toast.info(`Downgrade vers ${pending.plan.name} planifié.`);
      } else {
        toast.success(`Abonnement à ${pending.plan.name} activé !`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'opération");
    }
  };

  const handleConfirmUnsub = async () => {
    try {
      await unsubscribeMutation.mutateAsync();
      setCurrentPlanId(null);
      setConfirmUnsub(false);
      toast.success("Désabonnement effectué avec succès.");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors du désabonnement");
    }
  };

  const gridCls =
    activePlans.length <= 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
      : "grid grid-cols-1 lg:grid-cols-3 gap-6";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={STYLES.dialog}>
          {pending && (
            <div className="absolute inset-0 z-10 backdrop-blur-lg bg-background/40 transition-all duration-300" />
          )}
          {confirmUnsub && (
            <div className="absolute inset-0 z-10 backdrop-blur-lg bg-background/40 transition-all duration-300" />
          )}
          <div className={STYLES.header}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-center">
                Choisissez votre forfait
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className={STYLES.grid}>
            {isLoading ? (
              <div className={gridCls}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-105 rounded-3xl" />
                ))}
              </div>
            ) : (
              <div
                className={`${gridCls} md:w-2/3 lg:w-full xl:w-5/6 2xl:w-2/3 h-full gap-8`}
              >
                {activePlans.map((plan, i) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    index={i}
                    currentPlanId={currentPlanId}
                    currentPlanIndex={currentPlanIndex}
                    onSubscribe={handleSubscribeClick}
                    isLoading={subscribeMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bouton Se désabonner */}
          {isSubscribed && (
            <div className={STYLES.footer}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmUnsub(true)}
                disabled={unsubscribeMutation.isPending}
                className="ml-auto text-destructive hover:bg-destructive/10 gap-2"
              >
                {unsubscribeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Se désabonner
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Payment Dialog */}
      <Elements stripe={stripePromise}>
        <PaymentDialog
          open={!!paymentPlan}
          onOpenChange={(o) => !o && setPaymentPlan(null)}
          plan={paymentPlan}
          stripeCustomerId={user?.customer_id ?? ""}
          stripe_price_id={paymentPlan?.price_id ?? ""}
          onSuccess={(plan) => {
            if (plan) setCurrentPlanId(plan.id);
            toast.success("Abonnement activé !");
            setPaymentPlan(null);
            onOpenChange(false);
          }}
        />
      </Elements>
      {pending && (
        <UpDowngradeCreateDialogue
          currentPlan={currentPlan}
          open={pending}
          onOpenChange={(o) => !o && setPending(null)}
          onClick={handleConfirm}
          subscribeMutation={subscribeMutation}
        />
      )}
      {/* Dialog Désabonnement */}
      <UnsubscribeConfirmDialog
        open={confirmUnsub}
        onOpenChange={setConfirmUnsub}
        onConfirm={handleConfirmUnsub}
        isPending={unsubscribeMutation.isPending}
        currentPlan={currentPlan}
      />
    </>
  );
}
