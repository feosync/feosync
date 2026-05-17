import { LucideIcon } from 'lucide-react'

const COLOR_MAP = {
  blue: {
    bar:  'bg-blue-600',
    light: 'bg-blue-50 dark:bg-blue-950/50',
    icon:  'text-blue-600 dark:text-blue-400',
  },
  indigo: {
    bar:  'bg-indigo-600',
    light: 'bg-indigo-50 dark:bg-indigo-950/50',
    icon:  'text-indigo-600 dark:text-indigo-400',
  },
}

interface QuotaCardProps {
  icon: LucideIcon
  label: string
  used: number
  limit: number
  remaining: number
  color: keyof typeof COLOR_MAP
}

export function QuotaCard({ icon: Icon, label, used, limit, remaining, color }: QuotaCardProps) {
  const pct     = limit > 0 ? Math.round((used / limit) * 100) : 0
  const danger  = pct >= 90
  const warning = pct >= 70 && pct < 90
  const c       = COLOR_MAP[color]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg ${c.light} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          danger
            ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
            : warning
            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
        }`}>
          {remaining} restants
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">{label}</span>
          <span className="text-[12px] font-medium text-slate-900 dark:text-white">
            {used} / {limit}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              danger ? 'bg-red-500' : warning ? 'bg-amber-500' : c.bar
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}