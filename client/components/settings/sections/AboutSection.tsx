import { SettingsCard } from '../SettingsCard'
import { SettingRow } from '../SettingRow'

const STACK = [
  { label: 'Frontend',  value: 'Next.js 14 · React 18 · Tailwind CSS' },
  { label: 'Backend',   value: 'FastAPI · PostgreSQL' },
  { label: 'Auth',      value: 'Google OAuth 2.0' },
  { label: 'Socials',   value: 'Meta Graph API' },
]

export function AboutSection() {
  return (
    <div className="space-y-4">
      <SettingsCard title="FeoSync" variant="info">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-blue-100 dark:border-blue-900">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">FeoSync</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Version 1.0.0</p>
          </div>
        </div>

        {STACK.map(({ label, value }) => (
          <SettingRow key={label} label={label}>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-right">{value}</span>
          </SettingRow>
        ))}
      </SettingsCard>

      <SettingsCard title="Liens">
        <SettingRow label="Documentation">
          <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            docs.feosync.io ↗
          </a>
        </SettingRow>
        <SettingRow label="Politique de confidentialité">
          <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Lire ↗
          </a>
        </SettingRow>
        <SettingRow label="Conditions d'utilisation">
          <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Lire ↗
          </a>
        </SettingRow>
      </SettingsCard>
    </div>
  )
}