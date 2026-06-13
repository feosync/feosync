'use client'

import { cn } from '@/lib/utils'

export type ScopeFilter = "owned" | "assigned" | "all"

const SCOPE_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: "owned", label: "Mes organisations" },
  { value: "assigned", label: "Collaborations" },
  { value: "all", label: "Toutes" },
]

interface OrgScopeFilterProps {
  value: ScopeFilter
  onChange: (scope: ScopeFilter) => void
}

export function OrgScopeFilter({ value, onChange }: OrgScopeFilterProps) {
  return (
    <div className="flex gap-1.5">
      {SCOPE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
            value === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
