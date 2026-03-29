import { Eye, TrendingUp, Heart, Users } from 'lucide-react'
import type { PeriodSummary, AnalyticsPeriod } from '@/lib/api/types'

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "Aujourd'hui", week: '7 jours', days_28: '28 jours',
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium opacity-80">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <div className="text-[24px] font-semibold leading-none mb-1">
        {typeof value === 'number' ? fmt(value) : value}
      </div>
      <div className="text-[11px] opacity-70">{sub}</div>
    </div>
  )
}

interface Props {
  summary: PeriodSummary
  period: AnalyticsPeriod
}

const REACTION_EMOJI: Record<string, string> = {
  like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😠', care: '🤗',
}

export function AnalyticsKpiGrid({ summary, period }: Props) {
  const periodLabel = PERIOD_LABELS[period]
  const topEmoji = REACTION_EMOJI[summary.top_reaction] ?? '👍'

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <KpiCard
        label="Vues" value={summary.total_views} sub={periodLabel}
        icon={Eye} color="bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200"
      />
      <KpiCard
        label="Engagements" value={summary.total_engagements} sub="Likes · Com. · Partages"
        icon={TrendingUp} color="bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-200"
      />
      <KpiCard
        label="Taux eng." value={`${summary.engagement_rate}%`} sub="Eng. / Vues"
        icon={TrendingUp} color="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
      />
      <KpiCard
        label="Réactions" value={summary.total_reactions} sub={periodLabel}
        icon={Heart} color="bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200"
      />
      <KpiCard
        label="Abonnés nets" value={summary.net_followers >= 0 ? `+${summary.net_followers}` : String(summary.net_followers)}
        sub="Follows − unfollows"
        icon={Users} color={
          summary.net_followers >= 0
            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200"
            : "bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200"
        }
      />
      <KpiCard
        label={`Top réaction`} value={`${topEmoji} ${summary.top_reaction}`}
        sub={`${fmt(summary.reaction_breakdown[summary.top_reaction] ?? 0)} fois`}
        icon={Heart} color="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200"
      />
    </div>
  )
}