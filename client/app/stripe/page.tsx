'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CardPaymentForm from './stripe';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export default function StripePage() {
  const handlePaymentSuccess = async (paymentMethodId: string) => {
    console.log('Payment Method créé:', paymentMethodId);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/subscription/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method_id: paymentMethodId,
          customer_id: "cus_UJFnEF8ldqjn0D",
          price_id: "price_1TKdGT3HJEqPOoIdFhCjtiSm",
        }),
      });

      const data = await response.json();
      
      if (data) {
        console.log('Subscription créée:', data);
        alert('Paiement effectué avec succès !');
        // Rediriger ou mettre à jour l'état
      } else {
        alert('Erreur lors du paiement: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Erreur de paiement:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement</h1>
        <p className="text-gray-600 mb-6">
          Entrez vos informations de carte pour effectuer le paiement
        </p>
        
        <Elements stripe={stripePromise}>
          <CardPaymentForm
            amount={5000}
            description="Abonnement FeoSync"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      </div>
    </div>
  );
}
