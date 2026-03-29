import { AlertTriangle } from 'lucide-react'

interface Props {
  errors: Record<string, string>
}

export function AnalyticsErrorBanner({ errors }: Props) {
  const entries = Object.entries(errors)
  if (!entries.length) return null

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[13px] font-medium text-amber-800 dark:text-amber-300 mb-1">
          Certaines métriques sont indisponibles
        </p>
        <ul className="space-y-0.5">
          {entries.map(([k, v]) => (
            <li key={k} className="text-[12px] text-amber-700 dark:text-amber-400">
              <span className="font-medium">{k}</span> — {v}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}