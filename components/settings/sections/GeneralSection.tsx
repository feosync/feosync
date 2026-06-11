'use client'

import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsCard } from '../SettingsCard'
import { SettingRow } from '../SettingRow'
import { useOnboardingContext } from '@/components/onboarding/OnboardingProvider'

type Theme = 'light' | 'dark' | 'system'

const THEMES: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light',  label: 'Clair',   Icon: Sun },
  { value: 'dark',   label: 'Sombre',  Icon: Moon },
  { value: 'system', label: 'Système', Icon: Monitor },
]

export function GeneralSection() {
  const { theme, setTheme } = useTheme()
  const { resetOnboarding } = useOnboardingContext()

  return (
    <div className="space-y-4">
      <SettingsCard title="Apparence">
        <SettingRow label="Thème" description="Choisissez l'apparence de l'interface">
          <div className="flex items-center gap-1 p-1 bg-background rounded-lg">
            {THEMES.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium
                  transition-all duration-150
                  ${theme === value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground'
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
          <select className="text-sm bg-muted border-0 rounded-lg px-3 py-1.5 text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </SettingRow>
        <SettingRow label="Fuseau horaire" description="Pour l'affichage des dates et heures">
          <span className="text-sm text-muted-foreground">UTC+3 (Antananarivo)</span>
        </SettingRow>
      </SettingsCard>

      <SettingsCard title="Onboarding">
        <SettingRow
          label="Relancer la visite guidée"
          description="Revoyez les étapes clés de l'application."
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => resetOnboarding()}
            className="gap-2 text-xs border-border"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Relancer
          </Button>
        </SettingRow>
      </SettingsCard>
    </div>
  )
}