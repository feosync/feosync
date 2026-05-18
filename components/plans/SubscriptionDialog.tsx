"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  AlertCircle,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlans, useSubscribeToPlan, useUnsubscribeFromPlan } from "@/hooks/usePlans";
import type { Plan } from "@/lib/api/types";
import { PlanCard, getPlanAction, type PlanAction } from "@/components/plans/PlanCard";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { PaymentDialog } from "@/app/stripe/paymentDialogue";

// ── Stripe singleton ──────────────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendingChange {
  plan: Plan;
  action: PlanAction;
}

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

// ── Tokens de style (CSS variables du thème global) ───────────────────────────
const STYLES = {
  // Dialog principal — fond bg-background, bordure border-border
  dialog:
    "bg-background sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl w-full max-h-[92dvh] flex flex-col rounded-2xl border border-border px-6 py-0 overflow-hidden shadow-xl",

  // AlertDialog de confirmation
  alertDialog:
    "bg-card border border-border rounded-2xl max-w-sm w-[calc(100%-2rem)] mx-auto shadow-lg",

  // Header sticky
  header: "flex-shrink-0 px-5 sm:px-6 pt-6 pb-5 border-b border-border",

  // Zone scrollable des plans
  grid: "flex-1 overflow-y-auto px-4 sm:px-5 lg:px-6 py-5 sm:py-6",

  // Footer désabonnement
  footer: "flex-shrink-0 flex items-center gap-3 px-5 sm:px-6 py-3.5 border-t border-border",

  // Pill badge renouvellement
  renewBadge:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border text-[11px] text-muted-foreground",

  // Blocs info dans l'AlertDialog
  infoBlock: {
    upgrade: "bg-primary/8 border border-primary/20 rounded-xl p-3 space-y-1.5",
    down:    "bg-destructive/8 border border-destructive/15 rounded-xl p-3 space-y-1.5",
    lost:    "bg-destructive/8 border border-destructive/15 rounded-xl p-3",
  },

  // Boutons AlertDialog
  btn: {
    cancel:  "bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-accent-foreground rounded-xl flex-1 transition-colors",
    upgrade: "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl flex-1",
    down:    "bg-secondary text-secondary-foreground border border-border hover:bg-accent font-medium rounded-xl flex-1",
    create:  "bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl flex-1",
    unsub:   "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl flex-1 transition-colors",
  },

  // Icon rings dans l'AlertDialog
  iconRing: {
    upgrade: "bg-primary/10 border border-primary/20",
    down:    "bg-destructive/10 border border-destructive/20",
    create:  "bg-muted border border-border",
    unsub:   "bg-destructive/10 border border-destructive/20",
  },
} as const;

// ── Métadonnées par action ────────────────────────────────────────────────────
const ACTION_META = {
  UPGRADE: {
    Icon:         ArrowUp,
    iconCls:      "text-primary",
    ringCls:      STYLES.iconRing.upgrade,
    title:        "Confirmer l'upgrade",
    actionBtnCls: STYLES.btn.upgrade,
    actionLabel:  "Upgrader maintenant",
  },
  DOWNGRADE: {
    Icon:         ArrowDown,
    iconCls:      "text-destructive",
    ringCls:      STYLES.iconRing.down,
    title:        "Confirmer le downgrade",
    actionBtnCls: STYLES.btn.down,
    actionLabel:  "Planifier le downgrade",
  },
  CREATE: {
    Icon:         CreditCard,
    iconCls:      "text-muted-foreground",
    ringCls:      STYLES.iconRing.create,
    title:        "Souscrire à ce plan",
    actionBtnCls: STYLES.btn.create,
    actionLabel:  "Confirmer",
  },
} as const;

// ── SubscriptionDialog ────────────────────────────────────────────────────────
export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { user }                        = useAuth();
  const { data: plans = [], isLoading } = usePlans();
  const subscribeMutation               = useSubscribeToPlan();
  const unsubscribeMutation             = useUnsubscribeFromPlan();

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(user?.plan_id ?? null);
  const [pending, setPending]             = useState<PendingChange | null>(null);
  const [confirmUnsub, setConfirmUnsub]   = useState(false);
  const [paymentPlan, setPaymentPlan]     = useState<Plan | null>(null);

  useEffect(() => {
    setCurrentPlanId(user?.plan_id ?? null);
  }, [user?.plan_id]);

  // ── Mémos ──────────────────────────────────────────────────────────────────
  const activePlans      = useMemo(() => plans.filter((p) => p.is_active), [plans]);
  const currentPlanIndex = useMemo(
    () => activePlans.findIndex((p) => p.id === currentPlanId),
    [activePlans, currentPlanId],
  );
  const currentPlan  = currentPlanIndex >= 0 ? activePlans[currentPlanIndex] : null;
  const isSubscribed = !!currentPlanId;

  // ── Handlers ───────────────────────────────────────────────────────────────
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
      if (pending.action === "UPGRADE")        toast.success(`Upgrade vers ${pending.plan.name} activé !`);
      else if (pending.action === "DOWNGRADE") toast.info(`Downgrade vers ${pending.plan.name} planifié.`);
      else                                     toast.success(`Abonnement ${pending.plan.name} activé !`);
      onOpenChange(false);
    } catch { /* géré dans le hook */ }
  };

  const handlePaymentSuccess = (plan: Plan | null) => {
    if (plan) setCurrentPlanId(plan.id);
    toast.success("Abonnement activé avec succès !");
    setPaymentPlan(null);
    onOpenChange(false);
  };

  const handleConfirmUnsub = async () => {
    try {
      await unsubscribeMutation.mutateAsync();
      setCurrentPlanId(null);
      setConfirmUnsub(false);
      toast.success("Désabonnement effectué.");
      onOpenChange(false);
    } catch { /* géré dans le hook */ }
  };

  const meta = pending && pending.action in ACTION_META
    ? ACTION_META[pending.action as keyof typeof ACTION_META]
    : null;

  // ── Grid adaptative ────────────────────────────────────────────────────────
  const gridCls =
    activePlans.length === 1
      ? "grid grid-cols-1 max-w-xs mx-auto gap-4"
      : activePlans.length === 2
        ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <>
      {/* ══ Dialog principal ══════════════════════════════════════════════ */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={STYLES.dialog}>

          {/* ── En-tête ────────────────────────────────────────────────── */}
          <div className={STYLES.header}>
            <DialogHeader>
              <DialogTitle className="text-[19px] sm:text-[22px] font-semibold text-foreground text-center tracking-tight mb-1">
                Des forfaits qui évoluent avec vous
              </DialogTitle>

              <DialogDescription asChild>
                <div className="space-y-2.5 text-center">
                  <p className="text-[13px] text-muted-foreground">
                    {isSubscribed ? (
                      <>
                        Plan actuel&nbsp;:{" "}
                        <span className="text-foreground font-medium">{currentPlan?.name}</span>
                        . Changez ou désabonnez-vous.
                      </>
                    ) : (
                      "Choisissez le plan adapté à vos besoins."
                    )}
                  </p>

                  {/* Badge renouvellement */}
                  {isSubscribed && user?.current_period_end && (
                    <div className="flex justify-center">
                      <div className={STYLES.renewBadge}>
                        <Calendar className="w-3 h-3 text-muted-foreground/50" aria-hidden />
                        Renouvellement le{" "}
                        <span className="text-foreground/70 font-medium">
                          {new Date(user.current_period_end).toLocaleDateString("fr-FR", {
                            day:   "numeric",
                            month: "long",
                            year:  "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* ── Grille des plans ───────────────────────────────────────── */}
          <div className={STYLES.grid}>
            {isLoading ? (
              <div className={gridCls}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-80 sm:h-96 rounded-2xl bg-muted/50" />
                ))}
              </div>
            ) : activePlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <AlertCircle className="w-8 h-8 text-muted-foreground/30" aria-hidden />
                <p className="text-[13px] text-muted-foreground">Aucun plan disponible.</p>
              </div>
            ) : (
              <div className={gridCls}>
                {activePlans.map((plan, i) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    index={i}
                    currentPlanId={currentPlanId}
                    currentPlanIndex={currentPlanIndex}
                    onSubscribe={handleSubscribeClick}
                    isLoading={subscribeMutation.isPending && pending?.plan.id === plan.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Footer désabonnement ───────────────────────────────────── */}
          {isSubscribed && (
            <div className={STYLES.footer}>
              <p className="text-[11px] text-muted-foreground/50 tracking-wide hidden sm:block">
                Sans engagement · Annulation à tout moment
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmUnsub(true)}
                disabled={unsubscribeMutation.isPending}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/8 text-[12px] gap-1.5 rounded-lg transition-all duration-200 ml-auto"
              >
                {unsubscribeMutation.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <LogOut className="w-3.5 h-3.5" aria-hidden />
                }
                Se désabonner
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══ Stripe PaymentDialog ══════════════════════════════════════════ */}
      <Elements stripe={stripePromise}>
        <PaymentDialog
          open={!!paymentPlan}
          onOpenChange={(o) => !o && setPaymentPlan(null)}
          plan={paymentPlan}
          stripeCustomerId={user?.customer_id ?? ""}
          stripe_price_id={paymentPlan?.price_id ?? ""}
          onSuccess={handlePaymentSuccess}
        />
      </Elements>

      {/* ══ Confirmation Upgrade / Downgrade / Create ═════════════════════ */}
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent className={STYLES.alertDialog}>
          {meta && pending && (
            <AlertDialogHeader>

              {/* Icon ring */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${meta.ringCls}`}>
                <meta.Icon className={`w-5 h-5 ${meta.iconCls}`} aria-hidden />
              </div>

              <AlertDialogTitle className="text-foreground text-[16px] font-semibold">
                {meta.title}
              </AlertDialogTitle>

              <AlertDialogDescription asChild>
                <div className="text-muted-foreground text-[13px] space-y-3 mt-1">

                  {/* ── Upgrade ── */}
                  {pending.action === "UPGRADE" && (
                    <div className="space-y-2.5">
                      <p>
                        Passage de{" "}
                        <span className="text-foreground/80 font-medium">{currentPlan?.name}</span>
                        {" → "}
                        <span className="text-primary font-medium">{pending.plan.name}</span>
                      </p>
                      <div className={STYLES.infoBlock.upgrade}>
                        <p className="text-primary font-medium text-[12px]">✓ Actif immédiatement</p>
                        <p className="text-primary/55 text-[12px]">Montant proraté débité pour le reste du cycle.</p>
                        <p className="text-foreground font-semibold text-[15px] pt-0.5">
                          {pending.plan.price.toLocaleString("fr-MG")} Ar / mois
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Downgrade ── */}
                  {pending.action === "DOWNGRADE" && (
                    <div className="space-y-2.5">
                      <p>
                        Passage de{" "}
                        <span className="text-foreground/80 font-medium">{currentPlan?.name}</span>
                        {" → "}
                        <span className="text-destructive font-medium">{pending.plan.name}</span>
                      </p>
                      <div className={STYLES.infoBlock.down}>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" aria-hidden />
                          <div>
                            <p className="text-destructive font-medium text-[12px]">Effectif en fin de cycle</p>
                            {user?.current_period_end && (
                              <p className="text-destructive/55 text-[12px] mt-0.5">
                                Plan actuel conservé jusqu'au{" "}
                                {new Date(user.current_period_end).toLocaleDateString("fr-FR", {
                                  day:   "numeric",
                                  month: "long",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-foreground/70 font-semibold text-[14px] pt-1">
                          {pending.plan.price === 0
                            ? "Gratuit"
                            : `${pending.plan.price.toLocaleString("fr-MG")} Ar / mois`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Create ── */}
                  {pending.action === "CREATE" && (
                    <p>
                      Abonnement au plan{" "}
                      <span className="text-foreground font-medium">{pending.plan.name}</span>
                      {pending.plan.price === 0
                        ? "\u00a0— gratuit."
                        : `\u00a0— ${pending.plan.price.toLocaleString("fr-MG")} Ar / mois.`}
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          )}

          <AlertDialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
            <AlertDialogCancel
              className={STYLES.btn.cancel}
              disabled={subscribeMutation.isPending}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={subscribeMutation.isPending}
              className={meta?.actionBtnCls}
            >
              {subscribeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement…</>
              ) : (
                meta?.actionLabel
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══ Confirmation Désabonnement ════════════════════════════════════ */}
      <AlertDialog open={confirmUnsub} onOpenChange={setConfirmUnsub}>
        <AlertDialogContent className={STYLES.alertDialog}>
          <AlertDialogHeader>

            {/* Icon ring */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${STYLES.iconRing.unsub}`}>
              <LogOut className="w-5 h-5 text-destructive" aria-hidden />
            </div>

            <AlertDialogTitle className="text-foreground text-[16px] font-semibold">
              Se désabonner ?
            </AlertDialogTitle>

            <AlertDialogDescription asChild>
              <div className="text-muted-foreground text-[13px] space-y-3 mt-1">
                <p>Vous repasserez sur le plan gratuit avec des fonctionnalités limitées.</p>

                {/* Fonctionnalités perdues */}
                {currentPlan?.features && currentPlan.features.length > 0 && (
                  <div className={STYLES.infoBlock.lost}>
                    <p className="text-destructive font-medium text-[11px] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertTriangle className="w-3 h-3" aria-hidden />
                      Fonctionnalités perdues
                    </p>
                    <ul className="space-y-1.5" role="list">
                      {currentPlan.features.slice(0, 4).map((f) => (
                        <li
                          key={f}
                          className="text-muted-foreground text-[12px] flex items-center gap-1.5 leading-snug"
                        >
                          <span className="w-1 h-1 rounded-full bg-destructive/40 flex-shrink-0" aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-muted-foreground/50 text-[11px]">
                  Vous pouvez vous réabonner à tout moment.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
            <AlertDialogCancel
              className={STYLES.btn.cancel}
              disabled={unsubscribeMutation.isPending}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnsub}
              disabled={unsubscribeMutation.isPending}
              className={STYLES.btn.unsub}
            >
              {unsubscribeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement…</>
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