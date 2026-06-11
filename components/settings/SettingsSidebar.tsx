'use client'

import { LucideIcon } from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: string
}

interface SettingsSidebarProps {
  items: NavItem[]
  activeId: string
  onSelect: (id: string) => void
}

export function SettingsSidebar({ items, activeId, onSelect }: SettingsSidebarProps) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
              transition-all duration-150 group cursor-pointer
              ${isActive
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
              }
            `}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              }`}
            />
            <span className="text-sm flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

/* ── Mobile tab bar ───────────────────────────────────────────── */

interface SettingsMobileTabsProps {
  items: NavItem[]
  activeId: string
  onSelect: (id: string) => void
}

export function SettingsMobileTabs({ items, activeId, onSelect }: SettingsMobileTabsProps) {
  return (
    <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap shrink-0
              text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-accent text-muted-foreground hover:text-accent-foreground'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}