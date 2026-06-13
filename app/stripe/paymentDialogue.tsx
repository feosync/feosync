"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { Plan } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  stripeCustomerId: string;
  stripe_price_id: string;
  onSuccess: (plan: Plan | null) => void;
}

type Step = "idle" | "processing" | "success" | "error";

// ─── Helpers ───────────────────────────────────────────────────────────

const f = (n: number) => `${n.toLocaleString("fr-MG")} Ar`;

// ─── Component ─────────────────────────────────────────────────────────

export function PaymentDialog(props: PaymentDialogProps) {
  const { open, onOpenChange, plan, stripeCustomerId, stripe_price_id, onSuccess } = props;

  const stripe = useStripe();
  const elements = useElements();
  const ready = !!stripe && !!elements;

  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);

  const isLocked = step === "processing";

  // ── Submit ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !plan) return;

    setStep("processing");
    setError(null);

    try {
      const { setupIntent, error: confirmError } = await stripe.confirmSetup({ elements, redirect: "if_required" });

      if (confirmError || !setupIntent) throw new Error(confirmError?.message || "Erreur de confirmation");

      await apiClient.subscription({
        payment_method_id: setupIntent.payment_method as string,
        stripe_customer_id: stripeCustomerId,
        stripe_price_id,
      });

      setStep("success");
      setTimeout(() => { onSuccess(plan); onOpenChange(false); }, 2000);
    } catch (err: unknown) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  // ── Price ───────────────────────────────────────────────────────────

  const price = plan?.price ?? 0;
  const formatted = f(price);

  // ── Success screen ──────────────────────────────────────────────────

  if (step === "success") {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="w-max rounded-3xl border shadow-2xl bg-background">
          <div className="flex flex-col items-center py-20 px-8 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-success/10 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg shadow-success/20">
                <CheckCircle2 className="w-10 h-10 text-white animate-in zoom-in-50 duration-300" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight mb-3">Paiement réussi</DialogTitle>
            <p className="text-muted-foreground text-balance mb-1">
              Votre abonnement <span className="font-semibold text-foreground">{plan?.name}</span> est actif.
            </p>
            <p className="text-xs text-muted-foreground/50">Redirection en cours…</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main dialog ─────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isLocked) onOpenChange(v); }}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "w-screen h-min overflow-hidden rounded-2xl bg-background p-2",

        )}
      >
        <DialogTitle></DialogTitle>
        <form onSubmit={handleSubmit} className="w-full h-max rounded-2xl p-2">
          <div className="h-max w-full overflow-hidden">
              {/* Stripe iframe */}
              <div className="">
                <div
                  className={cn(
                    "border bg-card transition-colors overflow-auto rounded-2xl",
                    step === "error" ? "border-destructive/30 bg-destructive/2" : "border-border focus-within:border-primary/40",
                  )}
                >
                  <div className=" min-h-55 relative">
                    <div className={cn(
                      "transition-opacity duration-300 w-full  h-full inset-0 p-4",
                      ready ? "opacity-100" : "opacity-0 pointer-events-none",
                    )}>
                      <PaymentElement
                        options={{
                          layout: { type: "tabs", defaultCollapsed: false },
                          defaultValues: { billingDetails: { name: "" } },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>



              {/* Error */}
              {step === "error" && error && (
                <div className="rounded-xl bg-destructive/5 border border-destructive/15 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <span className="text-destructive text-sm font-bold">!</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-destructive">Paiement refusé</p>
                      <p className="text-xs text-destructive/70 mt-1 break-words">{error}</p>
                      <p className="text-xs text-muted-foreground mt-2">Vérifiez vos informations et réessayez.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 uppercase!">
                {step === "error" ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-11 rounded-xl text-sm font-medium">Annuler</Button>
                    <Button type="button" onClick={() => { setStep("idle"); setError(null); }} className="flex-1 h-11 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">Réessayer</Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLocked} className="flex-1 h-11 rounded-xl text-sm font-medium">Retour</Button>
                    <Button type="submit" disabled={isLocked || !ready} className="flex-1 h-11 rounded-xl text-sm font-semibold gap-2 bg-foreground hover:bg-primary/90 text-primary-foreground disabled:opacity-50">
                      {isLocked ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Paiement…</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Payer {formatted}</>
                      )}
                    </Button>
                  </>
                )}
              </div>
          </div>
          {/* ── Processing overlay ──────────────────────────────────── */}
          {isLocked && (
            <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-5 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Loader2 className="w-7 h-7 animate-spin text-white" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">Paiement en cours</p>
                <p className="text-sm text-muted-foreground mt-1">Ne fermez pas cette fenêtre</p>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
