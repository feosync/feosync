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
import { usePlans, useSubscribeToPlan, useUnsubscribeFromPlan } from "@/hooks/usePlans";
import type { Plan } from "@/lib/api/types";
import { PlanCard, type PlanAction } from "@/components/plans/PlanCard";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { PaymentDialog } from "@/app/stripe/paymentDialogue";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PendingChange {
  plan: Plan;
  action: PlanAction;
}

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const STYLES = {
  dialog: "bg-background/95 backdrop-blur-2xl sm:max-w-full lg:max-w-full w-full h-full flex flex-col  border border-border/70 shadow-2xl overflow-hidden",
  alertDialog: "bg-card/95 backdrop-blur-xl border border-border rounded-3xl max-w-md w-[calc(100%-2rem)] shadow-xl",
  header: "flex-shrink-0 px-6 sm:px-8 pt-6 pb-4",
  grid: "flex-1 overflow-y-auto px-6 sm:px-8 py-6 flex justify-center items-center",
  footer: "flex-shrink-0 px-6 sm:px-8 py-5 border-t border-border flex items-center gap-3",
} as const;

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { user } = useAuth();
  const { data: plans = [], isLoading } = usePlans();
  const subscribeMutation = useSubscribeToPlan();
  const unsubscribeMutation = useUnsubscribeFromPlan();

  const [currentPlanId, setCurrentPlanId] = useState<number | null>(user?.plan_id ?? null);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [confirmUnsub, setConfirmUnsub] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null);

  useEffect(() => {
    setCurrentPlanId(user?.plan_id ?? null);
  }, [user?.plan_id]);

  const activePlans = useMemo(() => plans.filter((p) => p.is_active), [plans]);
  const currentPlanIndex = useMemo(() => activePlans.findIndex((p) => p.id === currentPlanId), [activePlans, currentPlanId]);
  const currentPlan = currentPlanIndex >= 0 ? activePlans[currentPlanIndex] : null;
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

  const gridCls = activePlans.length <= 2
    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
    : "grid grid-cols-1 lg:grid-cols-3 gap-6";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={STYLES.dialog}>
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
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[420px] rounded-3xl" />)}
              </div>
            ) : (
              <div className={`${gridCls} md:w-2/3 lg:w-full xl:w-5/6 2xl:w-2/3 h-full gap-8`}>
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

      {/* ===================== ALERT DIALOG UPGRADE / DOWNGRADE / CREATE ===================== */}
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent className={STYLES.alertDialog}>
          {pending && (
            <AlertDialogHeader>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4
                ${pending.action === 'UPGRADE' ? 'bg-primary/10 border border-primary/20' : ''}
                ${pending.action === 'DOWNGRADE' ? 'bg-destructive/10 border border-destructive/20' : ''}
                ${pending.action === 'CREATE' ? 'bg-muted border border-border' : ''}">
                
                {pending.action === "UPGRADE" && <ArrowUp className="w-6 h-6 text-primary" />}
                {pending.action === "DOWNGRADE" && <ArrowDown className="w-6 h-6 text-destructive" />}
                {pending.action === "CREATE" && <CreditCard className="w-6 h-6 text-foreground" />}
              </div>

              <AlertDialogTitle className="text-center text-xl">
                {pending.action === "UPGRADE" && "Confirmer l'upgrade"}
                {pending.action === "DOWNGRADE" && "Confirmer le downgrade"}
                {pending.action === "CREATE" && `Souscrire au plan ${pending.plan.name}`}
              </AlertDialogTitle>

              <AlertDialogDescription asChild>
                <div className="text-center text-sm space-y-3 mt-2">
                  {pending.action === "UPGRADE" && (
                    <p>
                      Vous allez passer du plan <strong>{currentPlan?.name}</strong> au plan{" "}
                      <strong>{pending.plan.name}</strong>.
                    </p>
                  )}
                  {pending.action === "DOWNGRADE" && (
                    <p>
                      Vous allez passer du plan <strong>{currentPlan?.name}</strong> au plan{" "}
                      <strong>{pending.plan.name}</strong>.
                    </p>
                  )}
                  {pending.action === "CREATE" && (
                    <p>
                      Vous allez souscrire au plan <strong>{pending.plan.name}</strong>.
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          )}

          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-2xl flex-1">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={subscribeMutation.isPending}
              className={`rounded-2xl flex-1 ${
                pending?.action === "UPGRADE" ? "bg-primary hover:bg-primary/90" : 
                pending?.action === "DOWNGRADE" ? "bg-destructive hover:bg-destructive/90" : 
                "bg-primary hover:bg-primary/90"
              }`}
            >
              {subscribeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                pending?.action === "UPGRADE" ? "Confirmer l'upgrade" :
                pending?.action === "DOWNGRADE" ? "Confirmer le downgrade" : "Confirmer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog Désabonnement (inchangé) */}
      <AlertDialog open={confirmUnsub} onOpenChange={setConfirmUnsub}>
        <AlertDialogContent className={STYLES.alertDialog}>
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Se désabonner ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-center space-y-4 text-sm">
                <p>Vous repasserez sur le plan gratuit avec des fonctionnalités limitées.</p>

                {currentPlan?.features && currentPlan.features.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-left">
                    <p className="text-destructive font-medium text-xs mb-2">VOUS PERDREZ :</p>
                    <ul className="space-y-1 text-xs">
                      {currentPlan.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">•</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-2xl flex-1">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnsub}
              disabled={unsubscribeMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 rounded-2xl flex-1"
            >
              {unsubscribeMutation.isPending ? (
                <>Désabonnement en cours...</>
              ) : (
                "Confirmer le désabonnement"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}