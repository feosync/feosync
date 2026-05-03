'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CardPaymentForm from './stripe';
import { SubscriptionRequest } from '@/lib/api/types';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { config } from '@/lib/config';

const stripePromise = loadStripe(config.stripePublishableKey);

export default function StripePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handlePaymentSuccess = async (paymentMethodId: string) => {
    console.log('Payment Method créé:', paymentMethodId);
    setLoading(true);
    setError(null);

    try {
      // ✅ Syntaxe correcte pour déclarer une variable
      const data: SubscriptionRequest = {
        payment_method_id: paymentMethodId,
        stripe_customer_id: 'cus_ULJOWAMWQoXSTZ', // À remplacer par l'ID du client Stripe
        stripe_price_id: 'price_1TLeq93HJEqPOoIdkq5sD7GK', // À remplacer par l'ID du prix Stripe
      };
      console.log('Données de la requête:', data);

      // ✅ Appeler l'API et récupérer la réponse
      const response: any = await apiClient.subscription(data);

      if (response && response.data) {
        console.log('Subscription créée:', response.data);
        alert('Paiement effectué avec succès !');
        
        // Rediriger vers le dashboard
        router.push('/dashboard');
      } else {
        const errorMessage = response?.error?.message || 'Erreur inconnue';
        setError(errorMessage);
        alert('Erreur lors du paiement: ' + errorMessage);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      const errorMessage = error?.response?.data?.detail || 'Erreur de connexion au serveur';
      setError(errorMessage);
      alert('Erreur: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Erreur de paiement:', error);
    setError(error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement</h1>
        <p className="text-gray-600 mb-6">
          Entrez vos informations de carte pour effectuer le paiement
        </p>

        {/* Afficher les erreurs */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Elements stripe={stripePromise}>
          <CardPaymentForm
            amount={5000}
            description="Abonnement FeoSync"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>

        {loading && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Traitement du paiement en cours...
          </div>
        )}
      </div>
    </div>
  );
}