import { LucideIcon } from 'lucide-react'

const COLOR_MAP = {
  blue: {
    bar:   'bg-primary',
    light: 'bg-primary/10',
    icon:  'text-primary',
  },
  indigo: {
    bar:   'bg-primary',
    light: 'bg-primary/10',
    icon:  'text-primary',
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
    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg ${c.light} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          danger
            ? 'bg-destructive/10 text-destructive'
            : warning
            ? 'bg-primary/10 text-primary'
            : 'bg-primary/15 text-primary'
        }`}>
          {remaining} restants
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-medium text-foreground">
            {used} / {limit}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              danger ? 'bg-destructive' : warning ? 'bg-primary/70' : c.bar
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}