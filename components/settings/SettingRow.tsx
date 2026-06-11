interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
  danger?: boolean
}

export function SettingRow({ label, description, children, danger }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div className="mr-4">
        <p className={`text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}