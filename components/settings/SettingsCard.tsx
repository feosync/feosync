interface SettingsCardProps {
  title: string
  children: React.ReactNode
  variant?: 'default' | 'info' | 'danger'
}

export function SettingsCard({ title, children, variant = 'default' }: SettingsCardProps) {
  const styles = {
    default: 'bg-card border-border',
    info:    'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900',
    danger:  'bg-destructive/10 border-destructive/20',
  }

  const titleStyles = {
    default: 'text-muted-foreground',
    info:    'text-blue-700 dark:text-blue-300',
    danger:  'text-destructive',
  }

  return (
    <div className={`rounded-xl border p-4 ${styles[variant]}`}>
      <h2 className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${titleStyles[variant]}`}>
        {title}
      </h2>
      {children}
    </div>
  )
}