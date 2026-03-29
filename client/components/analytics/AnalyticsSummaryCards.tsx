import type { PeriodSummary, AnalyticsPeriod } from '@/lib/api/types'

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "aujourd'hui", week: '7 jours', days_28: '28 jours',
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

interface Props {
  summary: PeriodSummary
  period: AnalyticsPeriod
}

export function AnalyticsSummaryCards({ summary, period }: Props) {
  const periodLabel = PERIOD_LABELS[period]

  const cards = [
    {
      title: 'Portée',
      value: fmt(summary.total_views),
      detail: `${fmt(summary.total_views)} personnes ont vu votre contenu sur ${periodLabel}.`,
      detail2: `Moyenne : ${summary.avg_daily_views} vues / jour`,
      color: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20',
    },
    {
      title: 'Engagement',
      value: `${summary.engagement_rate}%`,
      detail: `${fmt(summary.total_engagements)} interactions sur ${fmt(summary.total_views)} vues.`,
      detail2: `Moyenne : ${summary.avg_daily_engagements} eng. / jour`,
      color: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20',
    },
    {
      title: 'Réactions',
      value: fmt(summary.total_reactions),
      detail: Object.entries(summary.reaction_breakdown)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([k, v]) => `${fmt(v)} ${k}`)
        .join(' · '),
      detail2: `Réaction dominante : ${summary.top_reaction}`,
      color: 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map(({ title, value, detail, detail2, color }) => (
        <div key={title} className={`rounded-xl border p-4 ${color}`}>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-[20px] font-semibold text-slate-900 dark:text-white mb-1">{value}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">{detail}</p>
          <p className="text-[11px] text-slate-400 mt-1">{detail2}</p>
        </div>
      ))}
    </div>
  )
}