// components/plans/PaymentDialog.tsx
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { Plan } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  stripeCustomerId: string;
  stripe_price_id: string;
  onSuccess: (plan: Plan | null) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  plan,
  stripeCustomerId,
  stripe_price_id,
  onSuccess,
}: PaymentDialogProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !plan) return;

    setLoading(true);
    setError(null);

    try {
      const { setupIntent, error: confirmError } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (confirmError || !setupIntent) {
        throw new Error(confirmError?.message || "Erreur de confirmation");
      }

      await apiClient.subscription({
        payment_method_id: setupIntent.payment_method as string,
        stripe_customer_id: stripeCustomerId,
        stripe_price_id: stripe_price_id,
      });

      onSuccess(plan);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  const priceFormatted = plan?.price?.toLocaleString("fr-MG") || "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bg-background border border-border/60 backdrop-blur-2xl",
          "max-w-md w-[calc(100%-2rem)] rounded-3xl shadow-2xl",
          "overflow-hidden"
        )}
      >
        <DialogHeader className="px-6 pt-8 pb-6 text-center border-b border-border/50">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>

          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Paiement sécurisé
          </DialogTitle>
          <DialogDescription className="text-base mt-1.5 text-muted-foreground">
            {plan?.name} — {priceFormatted} Ar / mois
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Payment Element */}
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <PaymentElement 
              options={{ 
                layout: 'tabs',
                defaultValues: { billingDetails: { name: '' } }
              }} 
            />
          </div>

          {/* Sécurité */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Protégé par Stripe • Chiffrement SSL 256-bit</span>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 h-12 rounded-2xl text-sm font-medium border-border hover:bg-muted"
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={loading || !stripe}
              className={cn(
                "flex-1 h-12 rounded-2xl text-sm font-semibold",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "transition-all active:scale-[0.985] flex items-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Payer {priceFormatted} Ar
                </>
              )}
            </Button>
          </div>

          {/* Mention légale */}
          <p className="text-center text-[11px] text-muted-foreground">
            Vous serez débité immédiatement. Résiliable à tout moment.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}