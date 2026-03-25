'use client'

import { useState } from 'react'
import {
  Sparkles,
  Image as ImageIcon,
  Type,
  Zap,
  Clock,
  BarChart2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAiHistory, useAiQuota } from '@/hooks/useAi'
import { useOrganisations } from '@/hooks/useOrganisations'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import type { AiGeneration } from '@/lib/api/types'

export default function AiPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')


  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const organisations = orgData?.items ?? []

 
  const orgId = selectedOrgId || organisations[0]?.id || ''

  const { data: quota, isLoading: quotaLoading } = useAiQuota(orgId)
  const { data: history, isLoading: historyLoading } = useAiHistory(orgId)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">
          IA & Quota
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Suivi de votre utilisation de l'intelligence artificielle
        </p>
      </div>

      {/* Sélecteur d'organisation */}
      <div className="max-w-md">
        <label className="text-sm text-slate-500 mb-1.5 block">
          Organisation
        </label>
        <OrganisationSelector
          value={orgId}
          onChange={setSelectedOrgId}
          placeholder="Sélectionner une organisation"
        />
      </div>

      {/* ── Quota ── */}
      {quotaLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : quota ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <QuotaCard
              icon={Type}
              label="Captions générés"
              used={quota.caption_count}
              limit={quota.caption_limit}
              remaining={quota.caption_remaining}
              color="blue"
            />
            <QuotaCard
              icon={ImageIcon}
              label="Images générées"
              used={quota.image_count}
              limit={quota.image_limit}
              remaining={quota.image_remaining}
              color="indigo"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[13px] font-medium text-slate-900 dark:text-white">
                Total tokens utilisés
              </span>
            </div>
            <span className="text-[18px] font-semibold text-slate-900 dark:text-white">
              {quota.total_tokens.toLocaleString('fr-FR')}
            </span>
          </div>
        </>
      ) : null}

      {/* ── Historique ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-[14px] font-medium text-slate-900 dark:text-white">
            Historique des générations
          </h2>
        </div>

        {historyLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !history?.length ? (
          <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aucune génération pour le moment
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((gen: AiGeneration) => (
              <AiHistoryRow key={gen.id} gen={gen} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ==================== Composants internes (inchangés) ==================== */

function QuotaCard({
  icon: Icon,
  label,
  used,
  limit,
  remaining,
  color,
}: {
  icon: any
  label: string
  used: number
  limit: number
  remaining: number
  color: 'blue' | 'indigo'
}) {
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0
  const danger = pct >= 90
  const warning = pct >= 70 && pct < 90

  const colors = {
    blue: {
      bg: 'bg-blue-600',
      light: 'bg-blue-50 dark:bg-blue-950/50',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    indigo: {
      bg: 'bg-indigo-600',
      light: 'bg-indigo-50 dark:bg-indigo-950/50',
      icon: 'text-indigo-600 dark:text-indigo-400',
    },
  }
  const c = colors[color]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg ${c.light} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            danger
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
              : warning
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
          }`}
        >
          {remaining} restants
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">{label}</span>
          <span className="text-[12px] text-slate-900 dark:text-white font-medium">
            {used} / {limit}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              danger ? 'bg-red-500' : warning ? 'bg-amber-500' : c.bg
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function AiHistoryRow({ gen }: { gen: AiGeneration }) {
  const isCaption = gen.generation_type === 'caption'

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isCaption
            ? 'bg-blue-50 dark:bg-blue-950/50'
            : 'bg-purple-50 dark:bg-purple-950/50'
        }`}
      >
        {isCaption ? (
          <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-slate-900 dark:text-white capitalize">
            {isCaption ? 'Caption' : 'Image'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{gen.model_used}</span>
        </div>
        {gen.caption && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
            {gen.caption}
          </p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Zap className="w-3 h-3" />
          {gen.tokens_used.toLocaleString('fr-FR')}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          {format(new Date(gen.created_at), 'd MMM HH:mm', { locale: fr })}
        </div>
      </div>
    </div>
  )
}