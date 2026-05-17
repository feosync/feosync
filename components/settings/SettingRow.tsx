interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
  danger?: boolean
}

export function SettingRow({ label, description, children, danger }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="mr-4">
        <p className={`text-sm font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}