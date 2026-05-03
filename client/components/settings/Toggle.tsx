interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative w-10 h-[22px] rounded-full transition-colors duration-200 focus:outline-none
        focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}
      `}
    >
      <div
        className={`
          absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
          ${checked ? 'translate-x-[22px]' : 'translate-x-[3px]'}
        `}
      />
    </button>
  )
}