'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Loader2, LogOut, AlertCircle,
  ArrowUp, ArrowDown, AlertTriangle, Calendar, CreditCard,
} from 'lucide-react'
import { useAuth }    from '@/hooks/useAuth'
import { usePlans, useSubscribeToPlan, useUnsubscribeFromPlan } from '@/hooks/usePlans'
import type { Plan }  from '@/lib/api/types'
import { PlanCard, getPlanAction, type PlanAction } from '@/components/plans/PlanCard'
import { Elements }   from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { toast }      from 'sonner'
import { PaymentDialog } from '@/app/stripe/paymentDialogue'

// ── Stripe singleton ──────────────────────────────────────────────────────────
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Types ─────────────────────────────────────────────────────────────────────
interface PendingChange { plan: Plan; action: PlanAction }

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

// ── Métadonnées confirmation par action ───────────────────────────────────────
const ACTION_META = {
  UPGRADE: {
    Icon: ArrowUp,
    iconCls: 'text-emerald-400',
    ringCls: 'bg-emerald-500/15 border border-emerald-500/25',
    title: "Confirmer l'upgrade",
    actionCls: 'bg-[var(--primary)] text-white hover:opacity-90 border-0 font-semibold shadow-lg shadow-blue-900/30',
    actionLabel: 'Upgrader maintenant',
  },
  DOWNGRADE: {
    Icon: ArrowDown,
    iconCls: 'text-amber-400',
    ringCls: 'bg-amber-500/15 border border-amber-500/25',
    title: 'Confirmer le downgrade',
    actionCls: 'bg-white/10 text-white hover:bg-white/15 border border-white/20 font-medium',
    actionLabel: 'Planifier le downgrade',
  },
  CREATE: {
    Icon: CreditCard,
    iconCls: 'text-white/70',
    ringCls: 'bg-white/8 border border-white/15',
    title: 'Souscrire à ce plan',
    actionCls: 'bg-white text-neutral-900 hover:bg-neutral-100 border-0 font-semibold',
    actionLabel: 'Confirmer',
  },
} as const

// ── SubscriptionDialog ────────────────────────────────────────────────────────
export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const { user }                        = useAuth()
  const { data: plans = [], isLoading } = usePlans()
  const subscribeMutation               = useSubscribeToPlan()
  const unsubscribeMutation             = useUnsubscribeFromPlan()

  // ── State — synchronisé avec user.plan_id ──
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(user?.plan_id ?? null)
  const [pending,       setPending]       = useState<PendingChange | null>(null)
  const [confirmUnsub,  setConfirmUnsub]  = useState(false)
  const [paymentPlan,   setPaymentPlan]   = useState<Plan | null>(null)

  // Resync si user change (ex: refresh token)
  useEffect(() => {
    setCurrentPlanId(user?.plan_id ?? null)
  }, [user?.plan_id])

  // ── Mémos ──
  const activePlans = useMemo(() => plans.filter(p => p.is_active), [plans])
  const currentPlanIndex = useMemo(
    () => activePlans.findIndex(p => p.id === currentPlanId),
    [activePlans, currentPlanId],
  )
  const currentPlan  = currentPlanIndex >= 0 ? activePlans[currentPlanIndex] : null
  const isSubscribed = !!currentPlanId

  // ── Handlers ──
  const handleSubscribeClick = (plan: Plan, action: PlanAction) => {
    if (action === 'CURRENT' || action === 'UNAVAILABLE') return
    // Stripe uniquement pour les nouveaux abonnés — carte déjà enregistrée pour upgrade/downgrade
    if (plan.price > 0 && action === 'CREATE') { setPaymentPlan(plan); return }
    setPending({ plan, action })
  }

  const handleConfirm = async () => {
    if (!pending) return
    try {
      await subscribeMutation.mutateAsync(String(pending.plan.id))
      setCurrentPlanId(pending.plan.id)
      setPending(null)
      if (pending.action === 'UPGRADE')
        toast.success(`Upgrade vers ${pending.plan.name} activé !`)
      else if (pending.action === 'DOWNGRADE')
        toast.info(`Downgrade vers ${pending.plan.name} planifié.`)
      else
        toast.success(`Abonnement ${pending.plan.name} activé !`)
      onOpenChange(false)
    } catch { /* géré dans le hook */ }
  }

  const handlePaymentSuccess = (plan: Plan | null) => {
    if (plan) setCurrentPlanId(plan.id)
    toast.success('Abonnement activé avec succès !')
    setPaymentPlan(null)
    onOpenChange(false)
  }

  const handleConfirmUnsub = async () => {
    try {
      await unsubscribeMutation.mutateAsync()
      setCurrentPlanId(null)
      setConfirmUnsub(false)
      toast.success('Désabonnement effectué.')
      onOpenChange(false)
    } catch { /* géré dans le hook */ }
  }

  const meta = pending && pending.action in ACTION_META
    ? ACTION_META[pending.action as keyof typeof ACTION_META]
    : null

  return (
    <>
      {/* ══════════════════ Dialog principal ══════════════════ */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="
         bg-[oklch(0.269_0_0)]
         border border-white/10
          sm:max-w-280 max-h-[92dvh] overflow-y-auto
          rounded-2xl px-8 py-8
        ">

          {/* ── En-tête ── */}
          <div className="px-8 pt-8 pb-5 border-b border-white/8">
            <DialogHeader>
              <DialogTitle className="text-[22px] font-semibold text-white text-center tracking-tight mb-1.5">
                Des forfaits qui évoluent avec vous
              </DialogTitle>
              <DialogDescription className="text-[13px] text-white/40 text-center" asChild>
                <div className="space-y-3">
                  <p>
                    {isSubscribed ? (
                      <>
                        Plan actuel&nbsp;:&nbsp;
                        <span className="text-white/70 font-medium">{currentPlan?.name}</span>
                        . Changez ou désabonnez-vous.
                      </>
                    ) : (
                      'Choisissez le plan adapté à vos besoins.'
                    )}
                  </p>

                  {/* Date de renouvellement */}
                  {isSubscribed && user?.current_period_end && (
                    <div className="flex items-center justify-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/40">
                        <Calendar className="w-3 h-3 text-white/30" />
                        Renouvellement le&nbsp;
                        <span className="text-white/60 font-medium">
                          {new Date(user.current_period_end).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* ── Grille plans ── */}
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-96 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : activePlans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="w-8 h-8 text-white/15" />
                <p className="text-[13px] text-white/30">Aucun plan disponible.</p>
              </div>
            ) : (
              <div className={`
                grid gap-4 items-start
                ${activePlans.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
                  activePlans.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  'grid-cols-1 sm:grid-cols-3'}
              `}>
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

          {/* ── Footer désabonnement ── */}
          {isSubscribed && (
            <div className="flex items-center justify-between px-8 py-4 border-t border-white/8">
              <p className="text-[11px] text-white/25 tracking-wide">
                Sans engagement · Annulation à tout moment
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmUnsub(true)}
                disabled={unsubscribeMutation.isPending}
                className="text-white/30 hover:text-red-400 hover:bg-red-500/10 text-[12px] gap-1.5 transition-all duration-200 rounded-lg"
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

      {/* ══════════════════ Stripe PaymentDialog ══════════════════ */}
      <Elements stripe={stripePromise}>
        <PaymentDialog
          open={!!paymentPlan}
          onOpenChange={o => !o && setPaymentPlan(null)}
          plan={paymentPlan}
          stripeCustomerId={user?.customer_id ?? ''}
          stripe_price_id={paymentPlan?.price_id ?? ''}
          onSuccess={handlePaymentSuccess}
        />
      </Elements>

      {/* ══════════════════ Confirmation Upgrade / Downgrade / Create ══════════════════ */}
      <AlertDialog open={!!pending} onOpenChange={o => !o && setPending(null)}>
        <AlertDialogContent className="bg-[oklch(0.14_0_0)] border border-white/12 rounded-2xl max-w-sm">
          {meta && pending && (
            <AlertDialogHeader>
              {/* Icône contextuelle */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${meta.ringCls}`}>
                <meta.Icon className={`w-5 h-5 ${meta.iconCls}`} />
              </div>

              <AlertDialogTitle className="text-white text-[16px] font-semibold">
                {meta.title}
              </AlertDialogTitle>

              <AlertDialogDescription className="text-white/50 text-[13px]" asChild>
                <div className="space-y-3 mt-1">

                  {/* ── Upgrade ── */}
                  {pending.action === 'UPGRADE' && (
                    <div className="space-y-2.5">
                      <p>
                        Passage de&nbsp;
                        <span className="text-white/75 font-medium">{currentPlan?.name}</span>
                        &nbsp;→&nbsp;
                        <span className="text-emerald-400 font-medium">{pending.plan.name}</span>
                      </p>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
                        <p className="text-emerald-400 font-medium text-[12px]">✓ Actif immédiatement</p>
                        <p className="text-emerald-400/60 text-[12px]">
                          Montant proraté débité pour le reste du cycle.
                        </p>
                        <p className="text-white/75 font-semibold text-[15px] pt-0.5">
                          {pending.plan.price.toLocaleString('fr-MG')} Ar / mois
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Downgrade ── */}
                  {pending.action === 'DOWNGRADE' && (
                    <div className="space-y-2.5">
                      <p>
                        Passage de&nbsp;
                        <span className="text-white/75 font-medium">{currentPlan?.name}</span>
                        &nbsp;→&nbsp;
                        <span className="text-amber-400 font-medium">{pending.plan.name}</span>
                      </p>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-amber-400 font-medium text-[12px]">Effectif en fin de cycle</p>
                            {user?.current_period_end && (
                              <p className="text-amber-400/60 text-[12px] mt-0.5">
                                Plan actuel conservé jusqu'au&nbsp;
                                {new Date(user.current_period_end).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long',
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="text-white/65 font-semibold text-[14px] pt-0.5">
                          {pending.plan.price === 0
                            ? 'Gratuit'
                            : `${pending.plan.price.toLocaleString('fr-MG')} Ar / mois`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Create ── */}
                  {pending.action === 'CREATE' && (
                    <p>
                      Abonnement au plan&nbsp;
                      <span className="text-white/75 font-medium">{pending.plan.name}</span>
                      {pending.plan.price === 0
                        ? '\u00a0— gratuit.'
                        : `\u00a0— ${pending.plan.price.toLocaleString('fr-MG')} Ar / mois.`}
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          )}

          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              className="bg-white/6 text-white/60 border border-white/12 hover:bg-white/10 hover:text-white rounded-xl flex-1"
              disabled={subscribeMutation.isPending}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={subscribeMutation.isPending}
              className={`rounded-xl flex-1 ${meta?.actionCls}`}
            >
              {subscribeMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement…</>
                : meta?.actionLabel
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ══════════════════ Confirmation Désabonnement ══════════════════ */}
      <AlertDialog open={confirmUnsub} onOpenChange={setConfirmUnsub}>
        <AlertDialogContent className="bg-[oklch(0.14_0_0)] border border-white/12 rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-red-500/10 border border-red-500/20">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <AlertDialogTitle className="text-white text-[16px] font-semibold">
              Se désabonner ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 text-[13px]" asChild>
              <div className="space-y-3 mt-1">
                <p>Vous repasserez sur le plan gratuit avec des fonctionnalités limitées.</p>

                {/* Fonctionnalités perdues */}
                {currentPlan?.features && currentPlan.features.length > 0 && (
                  <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-3">
                    <p className="text-red-400 font-medium text-[11px] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertTriangle className="w-3 h-3" />
                      Fonctionnalités perdues
                    </p>
                    <ul className="space-y-1.5">
                      {currentPlan.features.slice(0, 4).map(f => (
                        <li key={f} className="text-white/35 text-[12px] line-clamp-1 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-red-400/40 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-white/30 text-[11px]">
                  Vous pouvez vous réabonner à tout moment.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel
              className="bg-white/6 text-white/60 border border-white/12 hover:bg-white/10 hover:text-white rounded-xl flex-1"
              disabled={unsubscribeMutation.isPending}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnsub}
              disabled={unsubscribeMutation.isPending}
              className="bg-red-500/80 hover:bg-red-500 text-white border-0 rounded-xl flex-1 transition-all duration-200"
            >
              {unsubscribeMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Traitement…</>
                : 'Confirmer le désabonnement'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}