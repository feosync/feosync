'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Check, Loader2, Star, Zap, Crown,
  CreditCard, LogOut, AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  usePlans, useSubscribeToPlan, useUnsubscribeFromPlan
} from '@/hooks/usePlans'
import type { Plan } from '@/lib/api/types'

// ── Icône selon rang du plan ──────────────────────────────────────────────────
const PLAN_ICONS = [Star, Zap, Crown]
const PLAN_COLORS = [
  {
    bg: 'bg-slate-50 dark:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-700',
    active: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    icon: 'text-slate-500',
    btn: 'bg-slate-900 hover:bg-slate-700 dark:bg-slate-100 dark:hover:bg-slate-300 dark:text-slate-900 text-white',
  },
  {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    active: 'border-blue-500 ring-2 ring-blue-500/20',
    badge: 'bg-blue-600 text-white',
    icon: 'text-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    active: 'border-purple-500 ring-2 ring-purple-500/20',
    badge: 'bg-purple-600 text-white',
    icon: 'text-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
]

// ── PlanCard ──────────────────────────────────────────────────────────────────
function PlanCard({
  plan, index, isCurrent, onSubscribe, isLoading
}: {
  plan: Plan
  index: number
  isCurrent: boolean
  onSubscribe: (plan: Plan) => void
  isLoading: boolean
}) {
  const colorIdx = Math.min(index, PLAN_COLORS.length - 1)
  const color    = PLAN_COLORS[colorIdx]
  const Icon     = PLAN_ICONS[colorIdx] ?? Star
  const isPopular = index === 1

  return (
    <div className={`
      relative rounded-xl border-2 p-4 transition-all duration-200 flex flex-col
      ${isCurrent
        ? color.active
        : `${color.border} ${color.bg} hover:border-blue-300 dark:hover:border-blue-700`
      }
    `}>
      {/* Badges */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color.bg} border ${color.border}`}>
          <Icon className={`w-4 h-4 ${color.icon}`} />
        </div>
        <div className="flex gap-1.5">
          {isPopular && (
            <Badge className="bg-blue-600 text-white border-0 text-[10px] px-2">
              Populaire
            </Badge>
          )}
          {isCurrent && (
            <Badge className="bg-green-600 text-white border-0 text-[10px] px-2 gap-1">
              <Check className="w-2.5 h-2.5" />
              Actuel
            </Badge>
          )}
          {!plan.is_active && (
            <Badge variant="secondary" className="text-[10px] px-2">
              Inactif
            </Badge>
          )}
        </div>
      </div>

      {/* Nom + Prix */}
      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white mb-0.5">
        {plan.name}
      </h3>
      <div className="flex items-end gap-1 mb-3">
        <span className="text-[26px] font-bold text-slate-900 dark:text-white leading-none">
          {plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString('fr-MG')}
        </span>
        {plan.price > 0 && (
          <span className="text-[12px] text-slate-400 mb-0.5">Ar/mois</span>
        )}
      </div>

      {/* Limites */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {[
          { label: 'Pages',      value: plan.max_page },
          { label: 'Posts/mois', value: plan.max_post_month },
          { label: 'IA/mois',    value: plan.max_ai_gen },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white/60 dark:bg-slate-900/60 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-800"
          >
            <div className="text-[15px] font-semibold text-slate-900 dark:text-white">{value}</div>
            <div className="text-[9px] text-slate-400 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      {plan.features.length > 0 && (
        <ul className="space-y-1.5 mb-4 flex-1">
          {plan.features.slice(0, 5).map(f => (
            <li key={f} className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-slate-400">
              <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span className="line-clamp-1">{f}</span>
            </li>
          ))}
          {plan.features.length > 5 && (
            <li className="text-[11px] text-slate-400 pl-5">
              +{plan.features.length - 5} autres fonctionnalités
            </li>
          )}
        </ul>
      )}

      {/* CTA */}
      <Button
        onClick={() => onSubscribe(plan)}
        disabled={isCurrent || !plan.is_active || isLoading}
        className={`w-full text-[13px] h-9 mt-auto ${
          isCurrent
            ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
            : color.btn
        }`}
        variant={isCurrent ? 'ghost' : 'default'}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isCurrent ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Plan actuel
          </>
        ) : !plan.is_active ? (
          'Indisponible'
        ) : (
          <>
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Choisir ce plan
          </>
        )}
      </Button>
    </div>
  )
}

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

  const handleSubscribeClick = (plan: Plan) => {
    if (plan.id === currentPlanId) return
    setConfirmPlan(plan)
  }

  const handleConfirmSubscribe = async () => {
    if (!confirmPlan) return
    await subscribeMutation.mutateAsync(String(confirmPlan.id))
    setConfirmPlan(null)
    onOpenChange(false)
  }

  const handleConfirmUnsubscribe = async () => {
    await unsubscribeMutation.mutateAsync()
    setConfirmUnsubscribe(false)
    onOpenChange(false)
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