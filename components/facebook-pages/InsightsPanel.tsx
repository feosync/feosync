'use client'

import { useFacebookInsights } from '@/hooks/useFacebookPages'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

interface InsightsPanelProps {
  pageId: string
  orgId: string
}

export function InsightsPanel({ pageId, orgId }: InsightsPanelProps) {
  const { data: insights = [], isLoading } = useFacebookInsights(pageId, orgId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-slate-500">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin" style={{ width: '1rem', height: '1rem' }} />
        Chargement des insights...
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
        Aucun insight disponible. Cliquez sur sync pour récupérer les données.
      </div>
    )
  }

  const latest = insights[0]

  return (
    <div className="p-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Abonnés',       value: latest.fans_total },
          { label: 'Impressions',   value: latest.impressions_unique },
          { label: 'Engagés',       value: latest.engaged_users },
          { label: 'Nouveaux',      value: latest.new_followers },
        ].map(({ label, value }) => (
          <div key={label} className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-3 text-center">
            <div className="text-lg font-medium text-blue-700 dark:text-blue-300">{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}