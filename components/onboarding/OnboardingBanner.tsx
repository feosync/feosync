'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOnboardingContext } from './OnboardingProvider'
import { cn } from '@/lib/utils'

export function OnboardingBanner() {
  const { user } = useAuth()
  const { state, stepsProgress, dismissBanner } = useOnboardingContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDismissed = state.dismissed

  if (!mounted || isDismissed || stepsProgress.percent === 100) return null

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.15 } }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative bg-card border border-border rounded-xl p-5 shadow-sm overflow-hidden"
      >
        {/* Subtle gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">
                Bienvenue, {firstName} 👋
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Préparez votre espace de travail en quelques étapes
              </p>
            </div>
          </div>

          <button
            onClick={dismissBanner}
            aria-label="Fermer le message de bienvenue"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="relative mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">
              Progression
            </span>
            <span className="text-[11px] font-semibold text-primary tabular-nums">
              {stepsProgress.percent}%
            </span>
          </div>
          <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stepsProgress.percent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {stepsProgress.completed}/{stepsProgress.total} étapes terminées
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
