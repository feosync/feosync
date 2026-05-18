'use client'

import { Button } from '@/components/ui/button'
import { Check, Loader2, ArrowUp, ArrowDown, Lock, Sparkles } from 'lucide-react'
import type { Plan } from '@/lib/api/types'

// ── Types ─────────────────────────────────────────────────────────────────────
export type PlanAction = 'CREATE' | 'UPGRADE' | 'DOWNGRADE' | 'CURRENT' | 'UNAVAILABLE'

// ── Logique action ────────────────────────────────────────────────────────────
export function getPlanAction(
  plan: Plan,
  currentPlanId: number | null,
  planIndex: number,
  currentPlanIndex: number,
): PlanAction {
  if (!plan.is_active)           return 'UNAVAILABLE'
  if (plan.id === currentPlanId) return 'CURRENT'
  if (!currentPlanId)            return 'CREATE'
  return planIndex > currentPlanIndex ? 'UPGRADE' : 'DOWNGRADE'
}

// ── Tokens de style (CSS variables du thème) ──────────────────────────────────
const STYLES = {
  card: {
    base:    'relative flex flex-col rounded-2xl p-5 sm:p-6 transition-all duration-200 bg-card border border-border',
    current: 'border-primary/60 shadow-lg shadow-primary/8 ring-1 ring-primary/20',
    popular: 'border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5',
    default: 'border-border hover:border-border/80 hover:shadow-sm',
  },
  badge: {
    base:    'text-[10px] font-medium px-2.5 py-1 rounded-full border',
    current: 'bg-primary/10 text-primary border-primary/25',
    popular: 'bg-muted text-muted-foreground border-border',
    upgrade: 'bg-primary/10 text-primary border-primary/20',
    down:    'bg-destructive/10 text-destructive border-destructive/20',
  },
  metric: 'rounded-xl p-2.5 text-center bg-muted/60 border border-border',
  divider: 'border-t border-border',
} as const

// ── Config bouton par action ───────────────────────────────────────────────────
function getButtonConfig(action: PlanAction, planName: string) {
  switch (action) {
    case 'CURRENT':
      return {
        label:    'Plan actuel',
        icon:     <Check className="w-3.5 h-3.5 mr-1.5 opacity-50" />,
        cls:      'bg-muted text-muted-foreground border border-border cursor-default hover:bg-muted',
        disabled: true,
      }
    case 'UPGRADE':
      return {
        label:    `Upgrader vers ${planName}`,
        icon:     <ArrowUp className="w-3.5 h-3.5 mr-1.5" />,
        cls:      'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm shadow-primary/20',
        disabled: false,
      }
    case 'DOWNGRADE':
      return {
        label:    `Passer à ${planName}`,
        icon:     <ArrowDown className="w-3.5 h-3.5 mr-1.5" />,
        cls:      'bg-secondary text-secondary-foreground border border-border hover:bg-accent hover:text-accent-foreground font-medium',
        disabled: false,
      }
    case 'UNAVAILABLE':
      return {
        label:    'Indisponible',
        icon:     <Lock className="w-3.5 h-3.5 mr-1.5 opacity-40" />,
        cls:      'bg-muted text-muted-foreground cursor-not-allowed border border-border opacity-50',
        disabled: true,
      }
    default: // CREATE
      return {
        label:    `Obtenir ${planName}`,
        icon:     null,
        cls:      'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm shadow-primary/20',
        disabled: false,
      }
  }
}

// ── Icônes SVG organiques (inchangées) ───────────────────────────────────────
const PlanIcons = [
  () => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M20 35V16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 25C20 25 13 21 11 14C15.5 12 21 16 20 25Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 20C20 20 26 16.5 29 9.5C24 7.5 18.5 12 20 20Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M16 33C17.5 31 18.5 30 20 30C21.5 30 23 31 24.5 33" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  () => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M20 35V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 26C20 26 12 21 10 12C15 10 21.5 15.5 20 26Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 21C20 21 27 17 30 8C24.5 6 18 12 20 21Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 30C20 30 14 27 12 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 30C20 30 26 27 28 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  () => (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <path d="M20 35V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 24C20 24 11 19 9 10C14 8 21.5 14 20 24Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 19C20 19 28 14.5 31 5C25.5 3 18.5 10 20 19Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 29C20 29 13 25 10 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 29C20 29 27 25 30 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 15C20 15 15 12 13 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
]

// ── Props ─────────────────────────────────────────────────────────────────────
interface PlanCardProps {
  plan: Plan & { description?: string }
  index: number
  currentPlanId: number | null
  currentPlanIndex: number
  onSubscribe: (plan: Plan, action: PlanAction) => void
  isLoading: boolean
}

// ── PlanCard ──────────────────────────────────────────────────────────────────
export function PlanCard({
  plan,
  index,
  currentPlanId,
  currentPlanIndex,
  onSubscribe,
  isLoading,
}: PlanCardProps) {
  const PlanIcon  = PlanIcons[Math.min(index, PlanIcons.length - 1)]
  const action    = getPlanAction(plan, currentPlanId, index, currentPlanIndex)
  const isCurrent = action === 'CURRENT'
  const isPopular = index === 1
  const btn       = getButtonConfig(action, plan.name)

  const inheritLabel =
    index === 1 ? 'Tout Starter, plus :' :
    index === 2 ? 'Tout Pro, plus :' :
    null

  const cardCls = [
    STYLES.card.base,
    isCurrent ? STYLES.card.current : isPopular ? STYLES.card.popular : STYLES.card.default,
    'md:h-full',
  ].join(' ')

  return (
    <div className={cardCls} role="article" aria-label={`Plan ${plan.name}`}>

      {/* Tint primary subtil sur le plan actuel */}
      {isCurrent && (
        <div className="absolute inset-0 rounded-2xl bg-primary/3 pointer-events-none" />
      )}

      {/* Ligne d'accent top pour plan actuel */}
      {isCurrent && (
        <div className="absolute top-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent rounded-full" />
      )}

   

      {/* ── Icône plan ───────────────────────────────────────── */}
      <div
        className={`mb-5 mt-1 transition-colors ${isCurrent ? 'text-primary/50' : 'text-muted-foreground/40'}`}
        aria-hidden
      >
        <PlanIcon />
      </div>

      {/* ── Nom + description ────────────────────────────────── */}
      <div className="mb-4 pr-16">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-snug mb-1">
          {plan.name}
        </h3>
        {plan.description && (
          <p className="text-[13px] text-muted-foreground leading-snug">
            {plan.description}
          </p>
        )}
      </div>

      {/* ── Prix ────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[36px] sm:text-[40px] font-bold text-foreground leading-none tracking-tighter">
            {plan.price === 0 ? '0' : plan.price.toLocaleString('fr-MG')}
          </span>
          <span className="text-[12px] text-muted-foreground leading-tight">
            {plan.price === 0 ? 'Gratuit' : 'Ar\u00a0/\u00a0mois'}
          </span>
        </div>

        {/* Hints contextuels sous le prix */}
        {action === 'UPGRADE' && (
          <p className="text-xs text-primary mt-1.5 leading-snug">
            Actif immédiatement · montant proraté débité
          </p>
        )}
        {action === 'DOWNGRADE' && (
          <p className="text-xs text-destructive mt-1.5 leading-snug">
            Effectif à la fin du cycle en cours
          </p>
        )}
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <Button
        onClick={() => !btn.disabled && onSubscribe(plan, action)}
        disabled={btn.disabled || isLoading}
        tabIndex={action === 'CURRENT' || action === 'UNAVAILABLE' ? -1 : 0}
        aria-label={btn.label}
        className={`w-full h-10 rounded-xl text-[13px] mb-5 transition-all duration-200 ${btn.cls}`}
      >
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" aria-label="Chargement" />
          : <>{btn.icon}{btn.label}</>
        }
      </Button>

      {/* ── Métriques 2×2 ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-1.5 mb-5">
        {[
          { label: 'Organisations', value: plan.max_org },
          { label: 'Posts / mois',  value: plan.max_post_month },
          { label: 'Légendes IA',   value: plan.max_ai_caption },
          { label: 'Images IA',     value: plan.max_ai_image },
        ].map(({ label, value }) => (
          <div key={label} className={STYLES.metric}>
            <div className={`text-[14px] font-semibold leading-none mb-0.5 ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
              {value}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider leading-tight">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Features ────────────────────────────────────────── */}
      {plan.features.length > 0 && (
        <div className={`${STYLES.divider} pt-4 flex-1`}>
          {inheritLabel && (
            <p className="text-[11px] text-muted-foreground mb-3 font-medium uppercase tracking-wide">
              {inheritLabel}
            </p>
          )}
          <ul className="space-y-2.5" role="list">
            {plan.features.slice(0, 6).map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <Check
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isCurrent ? 'text-primary/60' : 'text-muted-foreground/50'}`}
                  aria-hidden
                />
                <span className="text-[13px] text-muted-foreground leading-snug">{f}</span>
              </li>
            ))}
            {plan.features.length > 6 && (
              <li className="text-[11px] text-muted-foreground pl-6">
                +{plan.features.length - 6} autres fonctionnalités
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}