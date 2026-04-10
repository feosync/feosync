'use client'


import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
  Check, Loader2, Star, Zap, Crown,
  CreditCard
} from 'lucide-react'

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
export function PlanCard({
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
          { label: 'Organisations',      value: plan.max_org },
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