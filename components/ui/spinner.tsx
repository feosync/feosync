import { Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

type SpinnerVariant = 'circle' | 'dots' | 'pulse'

interface SpinnerProps extends React.ComponentProps<'svg'> {
  variant?: SpinnerVariant
}

function Spinner({ className, variant = 'circle', ...props }: SpinnerProps) {
  if (variant === 'dots') {
    return (
      <div className="flex items-center gap-1" role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              'size-1.5 rounded-full bg-current animate-bounce',
              className,
            )}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <span
        role="status"
        aria-label="Loading"
        className={cn(
          'size-2 rounded-full bg-primary animate-pulse',
          className,
        )}
        style={{ animationDuration: '1.5s' }}
      />
    )
  }

  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
export type { SpinnerVariant }
