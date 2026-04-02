'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
   Loader2,
  CreditCard, LogOut, AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  usePlans, useSubscribeToPlan, useUnsubscribeFromPlan
} from '@/hooks/usePlans'
import type { Plan } from '@/lib/api/types'
import { PlanCard } from '@/components/plans/PlanCard'


// ── SubscriptionDialog ────────────────────────────────────────────────────────
interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { user }              = useAuth()
  const { data: plans = [], isLoading } = usePlans()
  const subscribeMutation     = useSubscribeToPlan()
  const unsubscribeMutation   = useUnsubscribeFromPlan()

  const [confirmPlan,        setConfirmPlan]        = useState<Plan | null>(null)
  const [confirmUnsubscribe, setConfirmUnsubscribe] = useState(false)

  const activePlans     = plans.filter(p => p.is_active)
  const currentPlanId   = user?.plan_id ?? null
  const currentPlan     = plans.find(p => p.id === currentPlanId) ?? null
  const isSubscribed    = !!currentPlanId

  console.log('User plan:', currentPlanId, currentPlan?.name)
  // plan id
  console.log('Available plans:', activePlans.map(p => `${p.name} (${p.id})`).join(', '))

  const handleSubscribeClick = (plan: Plan) => {
    if (plan.id === currentPlanId) return
    setConfirmPlan(plan)
  }

  const handleConfirmSubscribe = async () => {
    if (!confirmPlan) return
    try {
      await subscribeMutation.mutateAsync(String(confirmPlan.id))
      setConfirmPlan(null)
      onOpenChange(false)
    } catch  {
     // erreur déjà gérée dans le hook
    }
  }

  const handleConfirmUnsubscribe = async () => {
    try{
      await unsubscribeMutation.mutateAsync()
      setConfirmUnsubscribe(false)
      onOpenChange(false)
    } catch {
      // erreur déjà gérée dans le hook
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sm:max-w-3xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-slate-900 dark:text-white text-[18px] font-medium flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Choisir un plan
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-[13px]">
              {isSubscribed
                ? <>Vous êtes actuellement sur le plan <span className="font-medium text-slate-900 dark:text-white">{currentPlan?.name}</span>. Vous pouvez changer ou vous désabonner.</>
                : 'Sélectionnez le plan adapté à vos besoins.'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Plans */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : activePlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-[13px] text-slate-500">Aucun plan disponible pour le moment.</p>
            </div>
          ) : (
            <div className={`grid gap-3 py-2 ${
              activePlans.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
              activePlans.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
              'grid-cols-1 sm:grid-cols-3'
            }`}>
              {activePlans.map((plan, i) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  index={i}
                  isCurrent={plan.id === currentPlanId}
                  onSubscribe={handleSubscribeClick}
                  isLoading={subscribeMutation.isPending && confirmPlan?.id === plan.id}
                />
              ))}
            </div>
          )}

          {/* Footer — désabonnement */}
          {isSubscribed && (
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[12px] text-slate-400">
                Résiliez votre abonnement et repassez sur le plan gratuit.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmUnsubscribe(true)}
                disabled={unsubscribeMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 text-[13px] gap-1.5"
              >
                {unsubscribeMutation.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <LogOut className="w-3.5 h-3.5" />
                }
                Se désabonner
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm subscribe */}
      <AlertDialog open={!!confirmPlan} onOpenChange={open => !open && setConfirmPlan(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              {isSubscribed ? 'Changer de plan ?' : 'Souscrire à ce plan ?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              {isSubscribed
                ? <>Vous passez du plan <span className="font-medium text-slate-900 dark:text-white">{currentPlan?.name}</span> au plan <span className="font-medium text-slate-900 dark:text-white">{confirmPlan?.name}</span> ({confirmPlan?.price === 0 ? 'Gratuit' : `${confirmPlan?.price?.toLocaleString('fr-MG')} Ar/mois`}).</>
                : <>Vous souscrivez au plan <span className="font-medium text-slate-900 dark:text-white">{confirmPlan?.name}</span> — {confirmPlan?.price === 0 ? 'gratuit' : `${confirmPlan?.price?.toLocaleString('fr-MG')} Ar/mois`}.</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-slate-200 dark:border-slate-700"
              disabled={subscribeMutation.isPending}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubscribe}
              disabled={subscribeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {subscribeMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</>
                : 'Confirmer'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm unsubscribe */}
      <AlertDialog open={confirmUnsubscribe} onOpenChange={setConfirmUnsubscribe}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Se désabonner ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Vous repasserez sur le plan gratuit avec des fonctionnalités limitées. Vous pouvez vous réabonner à tout moment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-slate-200 dark:border-slate-700"
              disabled={unsubscribeMutation.isPending}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnsubscribe}
              disabled={unsubscribeMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {unsubscribeMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement...</>
                : 'Se désabonner'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}