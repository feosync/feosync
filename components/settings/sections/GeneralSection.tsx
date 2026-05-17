'use client'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { SettingsCard } from '../SettingsCard'
import { SettingRow } from '../SettingRow'

type Theme = 'light' | 'dark' | 'system'

const THEMES: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light',  label: 'Clair',   Icon: Sun },
  { value: 'dark',   label: 'Sombre',  Icon: Moon },
  { value: 'system', label: 'Système', Icon: Monitor },
]

export function GeneralSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <SettingsCard title="Apparence">
        <SettingRow label="Thème" description="Choisissez l'apparence de l'interface">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
                  transition-all duration-150
                  ${theme === value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }
                `}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Langue & région">
        <SettingRow label="Langue de l'interface" description="Langue utilisée dans l'application">
          <select className="text-sm bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </SettingRow>
        <SettingRow label="Fuseau horaire" description="Pour l'affichage des dates et heures">
          <span className="text-sm text-slate-500 dark:text-slate-400">UTC+3 (Antananarivo)</span>
        </SettingRow>
      </SettingsCard>
    </div>
  )
}