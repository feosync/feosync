'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripeCardElementChangeEvent } from '@stripe/stripe-js';

interface CardPaymentProps {
  onSuccess?: (paymentMethodId: string) => void;
  onError?: (error: string) => void;
  amount?: number;
  description?: string;
}

export const CardPaymentForm: React.FC<CardPaymentProps> = ({
  onSuccess,
  onError,
  amount = 0,
  description = 'Paiement',
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardError(event.error?.message || null);
    setCardComplete(event.complete);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setCardError('Stripe n\'est pas disponible');
      return;
    }

    setIsLoading(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setCardError('Élément de carte non trouvé');
        setIsLoading(false);
        return;
      }

      // Créer un payment method avec les données de la carte
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setCardError(error.message || 'Erreur lors du traitement de la carte');
        onError?.(error.message || 'Erreur inconnue');
        setIsLoading(false);
        return;
      }

      if (paymentMethod) {
        onSuccess?.(paymentMethod.id);
        // Réinitialiser le formulaire
        cardElement.clear();
        setCardComplete(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setCardError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="p-4 border border-gray-300 rounded-lg bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations de carte
        </label>
        <CardElement
          options={cardElementOptions}
          onChange={handleCardChange}
        />
      </div>

      {cardError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{cardError}</p>
        </div>
      )}

      <div className="space-y-1 text-sm">
        {amount > 0 && (
          <p className="text-gray-600">
            Montant à payer : <span className="font-semibold">{(amount / 100).toFixed(2)} €</span>
          </p>
        )}
        {description && (
          <p className="text-gray-600">Description : {description}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || !cardComplete || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        {isLoading ? 'Traitement...' : 'Payer maintenant'}
      </button>
    </form>
  );
};

export default CardPaymentForm;
