'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { useOnboardingContext } from './OnboardingProvider'
import { cn } from '@/lib/utils'

interface ContextualTooltipProps {
  tooltipId: string
  title?: string
  description: string
  className?: string
  children?: React.ReactNode
}

export function ContextualTooltip({
  tooltipId,
  title,
  description,
  className,
  children,
}: ContextualTooltipProps) {
  const { state, dismissTooltip } = useOnboardingContext()
  const [open, setOpen] = useState(!state.dismissedTooltips.includes(tooltipId))

  const isDismissed = state.dismissedTooltips.includes(tooltipId)

  if (isDismissed && !open) return <>{children}</>

  const handleDismiss = () => {
    setOpen(false)
    dismissTooltip(tooltipId)
  }

  return (
    <div className={cn('relative group', className)}>
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-30 top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-card border border-border rounded-xl shadow-xl p-4"
            role="tooltip"
          >
            <button
              onClick={handleDismiss}
              aria-label="Fermer l'info-bulle"
              className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                {title && (
                  <p className="text-xs font-semibold text-foreground">
                    {title}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
