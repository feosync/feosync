// components/plans/PaymentDialog.tsx
'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Lock } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import type { Plan } from '@/lib/api/types'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: Plan | null
  stripeCustomerId: string,
  stripe_price_id: string,
  onSuccess: () => void
}

export function PaymentDialog({
  open, onOpenChange, plan, stripeCustomerId, stripe_price_id, onSuccess
}: PaymentDialogProps) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !plan) return

    setLoading(true)
    setError(null)

    try {
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      })

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || 'Erreur carte')
      }

      // 2. Envoyer au backend via apiClient
      await apiClient.subscription({
        payment_method_id:   paymentMethod.id,
        stripe_customer_id:  stripeCustomerId,
        stripe_price_id:    stripe_price_id
      })

      onSuccess()
      onOpenChange(false)

    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white text-[16px] font-medium">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Paiement — {plan?.name}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-[13px]">
            {plan?.price?.toLocaleString('fr-MG')} Ar/mois · Résiliable à tout moment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Champ carte Stripe */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#1e293b',
                    '::placeholder': { color: '#94a3b8' },
                  },
                },
              }}
            />
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-[12px] text-red-500 bg-red-50 dark:bg-red-950 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Boutons */}
          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-slate-200 dark:border-slate-700 text-[13px]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !stripe}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] gap-1.5"
            >
              {loading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Traitement...</>
                : <><Lock className="w-3.5 h-3.5" />Payer {plan?.price?.toLocaleString('fr-MG')} Ar</>
              }
            </Button>
          </div>

          {/* Mention sécurité */}
          <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Paiement sécurisé par Stripe
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}