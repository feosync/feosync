import { Eye, TrendingUp, Heart, Users } from 'lucide-react'
import type { PeriodSummary, AnalyticsPeriod } from '@/lib/api/types'

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "Aujourd'hui", week: '7 jours', days_28: '28 jours',
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

function KpiCard({ label, value, sub, icon: Icon, iconClass, valueClass }: {
  label: string
  value: string | number
  sub: string
  icon: React.ElementType
  iconClass?: string
  valueClass?: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${iconClass ?? 'text-muted-foreground'}`} />
      </div>
      <div className={`text-2xl font-semibold leading-none ${valueClass ?? 'text-foreground'}`}>
        {typeof value === 'number' ? fmt(value) : value}
      </div>
      <div className="text-xs text-muted-foreground">{sub}</div>
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
  const netPositive = summary.net_followers >= 0
  console.log(summary)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <KpiCard
        label="Vues"
        value={summary.total_views}
        sub={periodLabel}
        icon={Eye}
        iconClass="text-primary"
      />
      <KpiCard
        label="Engagements"
        value={summary.total_engagements}
        sub="Likes · Com. · Partages"
        icon={TrendingUp}
        iconClass="text-primary"
      />
      <KpiCard
        label="Taux eng."
        value={`${summary.engagement_rate}%`}
        sub="Eng. / Vues"
        icon={TrendingUp}
        iconClass="text-muted-foreground"
      />
      <KpiCard
        label="Réactions"
        value={summary.total_reactions}
        sub={periodLabel}
        icon={Heart}
        iconClass="text-primary"
      />
      <KpiCard
        label="Abonnés nets"
        value={netPositive ? `+${summary.net_followers}` : String(summary.net_followers)}
        sub="Follows − unfollows"
        icon={Users}
        iconClass={netPositive ? 'text-primary' : 'text-destructive'}
        valueClass={netPositive ? 'text-foreground' : 'text-destructive'}
      />
      <KpiCard
        label="Top réaction"
        value={`${topEmoji} ${summary.top_reaction}`}
        sub={`${fmt(summary.reaction_breakdown[summary.top_reaction] ?? 0)} fois`}
        icon={Heart}
        iconClass="text-muted-foreground"
      />
    </div>
  )
}