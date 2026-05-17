'use client'

import { Button } from '@/components/ui/button'
import { Check, Loader2, ArrowUp, ArrowDown, Lock, Sparkles } from 'lucide-react'
import type { Plan } from '@/lib/api/types'

// ── Logique upgrade / downgrade ───────────────────────────────────────────────
export type PlanAction = 'CREATE' | 'UPGRADE' | 'DOWNGRADE' | 'CURRENT' | 'UNAVAILABLE'

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

// ── Icônes SVG organiques ─────────────────────────────────────────────────────
const PlanIcons = [
  // Starter
  () => (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
      <path d="M20 35V16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 25C20 25 13 21 11 14C15.5 12 21 16 20 25Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 20C20 20 26 16.5 29 9.5C24 7.5 18.5 12 20 20Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M16 33C17.5 31 18.5 30 20 30C21.5 30 23 31 24.5 33" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  // Pro
  () => (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
      <path d="M20 35V13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 26C20 26 12 21 10 12C15 10 21.5 15.5 20 26Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 21C20 21 27 17 30 8C24.5 6 18 12 20 21Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 30C20 30 14 27 12 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 30C20 30 26 27 28 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  // Enterprise
  () => (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
      <path d="M20 35V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 24C20 24 11 19 9 10C14 8 21.5 14 20 24Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 19C20 19 28 14.5 31 5C25.5 3 18.5 10 20 19Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M20 29C20 29 13 25 10 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 29C20 29 27 25 30 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M20 15C20 15 15 12 13 7"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
]

// ── Config bouton — tokens CSS uniquement, pas de couleurs hardcodées ─────────
function getButtonConfig(action: PlanAction, planName: string) {
  switch (action) {
    case 'CURRENT':
      return {
        label: 'Plan actuel',
        icon: <Check className="w-3.5 h-3.5 mr-1.5" />,
        cls: 'bg-muted text-muted-foreground cursor-default border border-border hover:bg-muted',
        disabled: true,
      }
    case 'UPGRADE':
      return {
        label: `Upgrader vers ${planName}`,
        icon: <ArrowUp className="w-3.5 h-3.5 mr-1.5" />,
        // bg-primary = bleu clair en light, bleu en dark — text-primary-foreground s'adapte
        cls: 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm',
        disabled: false,
      }
    case 'DOWNGRADE':
      return {
        label: `Passer à ${planName}`,
        icon: <ArrowDown className="w-3.5 h-3.5 mr-1.5" />,
        cls: 'bg-background text-foreground hover:bg-muted border border-border font-medium',
        disabled: false,
      }
    case 'UNAVAILABLE':
      return {
        label: 'Indisponible',
        icon: <Lock className="w-3.5 h-3.5 mr-1.5" />,
        cls: 'bg-muted text-muted-foreground/40 cursor-not-allowed',
        disabled: true,
      }
    default: // CREATE
      return {
        label: `Obtenir le plan ${planName}`,
        icon: null,
        cls: 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm',
        disabled: false,
      }
  }
}

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

  const previousPlanLabel =
    index === 1 ? 'Tout ce qui est dans Starter et :' :
    index === 2 ? 'Tout ce qui est dans Pro, plus :' :
    null

  return (
    <div
      className={[
        // Base — bg-card et text-card-foreground switchent automatiquement light ↔ dark
        'relative flex flex-col rounded-2xl p-6 transition-all duration-200 h-full bg-card text-card-foreground',
        isCurrent
          ? 'border-2 border-primary/40 shadow-lg shadow-primary/8'
          : isPopular
            ? 'border border-primary/20 shadow-md shadow-primary/5 hover:border-primary/35'
            : 'border border-border hover:border-primary/25 hover:shadow-sm',
      ].join(' ')}
    >
      {/* Tint subtil sur le plan Pro — fonctionne en light et dark */}
      {isPopular && (
        <div className="absolute inset-0 rounded-2xl bg-primary/[0.03] pointer-events-none" />
      )}

      {/* ── Badges ── */}
      <div className="absolute top-4 right-4 flex gap-1.5">
        {isPopular && action !== 'CURRENT' && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-2.5 h-2.5" />
            Populaire
          </span>
        )}
        {isCurrent && (
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            ✓ Actuel
          </span>
        )}
        {action === 'UPGRADE' && (
          // dark: variant atténuée car fond sombre / light: vert saturé lisible
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-400/20">
            ↑ Upgrade
          </span>
        )}
        {action === 'DOWNGRADE' && (
          <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:text-amber-400 dark:border-amber-400/20">
            ↓ Downgrade
          </span>
        )}
      </div>

      {/* ── Icône ── */}
      <div className="text-muted-foreground mb-5">
        <PlanIcon />
      </div>

      {/* ── Nom + description ── */}
      <div className="mb-4">
        <h3 className="text-[20px] font-semibold text-foreground tracking-tight mb-1">
          {plan.name}
        </h3>
        {plan.description && (
          <p className="text-[13px] text-muted-foreground leading-snug">
            {plan.description}
          </p>
        )}
      </div>

      {/* ── Prix ── */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="text-[38px] font-bold text-foreground leading-none tracking-tighter">
            {plan.price === 0 ? '0' : plan.price.toLocaleString('fr-MG')}
          </span>
          <span className="text-[13px] text-muted-foreground">
            {plan.price === 0 ? 'Gratuit' : 'Ar\xa0/\xa0mois'}
          </span>
        </div>
        {action === 'UPGRADE' && (
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1.5 leading-snug">
            Actif immédiatement · montant proraté débité
          </p>
        )}
        {action === 'DOWNGRADE' && (
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1.5 leading-snug">
            Effectif à la fin du cycle en cours
          </p>
        )}
      </div>

      {/* ── CTA ── */}
      <Button
        onClick={() => onSubscribe(plan, action)}
        disabled={btn.disabled || isLoading}
        tabIndex={action === 'CURRENT' ? -1 : 0}
        className={`w-full h-10 rounded-xl text-[13px] mb-5 transition-all ${btn.cls}`}
      >
        {isLoading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <>{btn.icon}{btn.label}</>
        }
      </Button>

      {/* ── Métriques 2×2 ── */}
      <div className="grid grid-cols-2 gap-1.5 mb-5">
        {[
          { label: 'Organisations', value: plan.max_org },
          { label: 'Posts / mois',  value: plan.max_post_month },
          { label: 'Légendes IA',   value: plan.max_ai_caption },
          { label: 'Images IA',     value: plan.max_ai_image },
        ].map(({ label, value }) => (
          <div
            key={label}
            // bg-muted est clair en light, sombre en dark — border-border suit
            className="rounded-xl p-2.5 text-center bg-muted/50 border border-border"
          >
            <div className="text-[15px] font-semibold text-foreground leading-none mb-0.5">{value}</div>
            <div className="text-[9px] text-muted-foreground leading-tight uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      {plan.features.length > 0 && (
        <div className="border-t border-border pt-4 flex-1">
          {previousPlanLabel && (
            <p className="text-[11px] text-muted-foreground mb-3.5 font-medium">
              {previousPlanLabel}
            </p>
          )}
          <ul className="space-y-2.5">
            {plan.features.slice(0, 6).map(f => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-[13px] text-muted-foreground leading-snug">{f}</span>
              </li>
            ))}
            {plan.features.length > 6 && (
              <li className="text-[11px] text-muted-foreground/60 pl-6">
                +{plan.features.length - 6} autres fonctionnalités
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}