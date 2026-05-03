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
              transition-colors duration-150 group cursor-pointer
              ${isActive
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
              }`}
            />
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-medium">
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
    <div className="flex overflow-x-auto gap-1 pb-1 ">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap shrink-0
              text-sm font-medium transition-colors
              ${isActive
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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