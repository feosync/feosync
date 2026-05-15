// components/SubscriptionForm.tsx
"use client";
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { apiClient } from "@/lib/api/client"; 
import { SubscriptionRequest } from "@/lib/api/types";

interface Props {
  stripeCustomerId: string;
  stripePriceId: string;
}

export default function SubscriptionForm({ stripeCustomerId, stripePriceId }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Créer le PaymentMethod via Stripe.js
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)!,
      });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || "Erreur carte");
      }

      // 2. Appeler ton backend via apiClient
      const sub: SubscriptionRequest = {
        payment_method_id: paymentMethod.id,
        stripe_customer_id: stripeCustomerId,
        stripe_price_id: stripePriceId,
      };
      await apiClient.subscription(sub); // ta méthode existante ✅
      setSuccess(true);

    } catch (err: any) {
      setError(err.message || "Erreur lors de la souscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) return <p>✅ Abonnement activé !</p>;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <CardElement options={{ hidePostalCode: true }} />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading || !stripe}>
        {loading ? "Traitement..." : "S'abonner"}
      </button>
    </form>
  );
}