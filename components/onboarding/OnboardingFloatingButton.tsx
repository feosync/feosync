'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, X, Check, ArrowRight } from 'lucide-react'
import { useOnboardingContext } from './OnboardingProvider'
import { ONBOARDING_STEPS } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

export function OnboardingFloatingButton() {
  const { stepsProgress } = useOnboardingContext()
  const [open, setOpen] = useState(false)

  if (stepsProgress.percent === 100) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground rounded-full pl-4 pr-3 py-2.5 shadow-lg hover:bg-primary/90 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Rocket className="w-4 h-4" />
        <span className="text-sm font-medium">Démarrage</span>
        <span className="bg-primary-foreground/20 text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full ml-0.5">
          {stepsProgress.completed}/{stepsProgress.total}
        </span>
      </button>
      <OnboardingModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function OnboardingModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { state, stepsProgress, completeStep } = useOnboardingContext()
  const router = useRouter()

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onKeyDown])

  const steps = ONBOARDING_STEPS.map((def) => ({
    ...def,
    completed: state.steps.find((s) => s.id === def.id)?.completed ?? false,
  }))

  const activeIndex = steps.findIndex((s) => !s.completed)
  const allComplete = activeIndex === -1
  const activeStepLabel = !allComplete ? steps[activeIndex].label : null

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl mx-4 overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Checklist de démarrage
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {allComplete
                      ? 'Toutes les étapes sont terminées'
                      : `Prochaine étape : ${activeStepLabel}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">
                  Progression
                </span>
                <span className="text-xs font-semibold text-primary tabular-nums">
                  {stepsProgress.percent}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full w-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stepsProgress.percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="p-3">
              {steps.map((step, index) => {
                const completed = step.completed
                const isActive = !completed && index === activeIndex
                const isTodo = !completed && !isActive
                const Icon = step.icon

                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200',
                      isTodo && 'opacity-50',
                      isActive &&
                        'border-l-2 border-primary pl-[14px] bg-accent/50',
                      isActive && 'cursor-default',
                    )}
                  >
                    <div className="shrink-0">
                      {completed ? (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      ) : isActive ? (
                        <div className="w-5 h-5 rounded-full border-2 border-primary" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-border" />
                      )}
                    </div>

                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                        completed
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          'text-sm font-medium block leading-tight transition-colors',
                          completed
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground',
                        )}
                      >
                        {step.label}
                      </span>
                      {!completed && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          completeStep(step.id)
                          router.push(step.href)
                        }}
                        className="shrink-0 inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium h-7 px-3 rounded-md hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        Commencer
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {allComplete && (
              <div className="px-6 py-4 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Toutes les étapes sont terminées ! 🎉
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
