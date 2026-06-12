'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check } from 'lucide-react'
import { useOnboardingContext } from './OnboardingProvider'
import { OnboardingStep } from './OnboardingStep'
import { ONBOARDING_STEPS } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

export function OnboardingChecklist() {
  const { state, stepsProgress, completeStep, allStepsComplete } =
    useOnboardingContext()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const stepsWithState = ONBOARDING_STEPS.map((def) => {
    const prog = state.steps.find((s) => s.id === def.id)
    return {
      ...def,
      completed: prog?.completed ?? false,
    }
  })

  const completedCount = stepsWithState.filter((s) => s.completed).length
  const isComplete = allStepsComplete

  if (isComplete) return null

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleComplete = (id: string) => {
    completeStep(id)
  }

  const activeStep = stepsWithState.find(
    (s) => !s.completed && s.id === expandedId,
  )

  return (
    <div
      id="onboarding-checklist"
      className="bg-card border border-border rounded-xl shadow-sm"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Checklist de démarrage
          </h3>
        </div>
        <span className="text-xs font-semibold text-primary tabular-nums">
          {completedCount}/{stepsWithState.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-primary/20">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${stepsProgress.percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
      <div className="p-3 space-y-0.5">
        {stepsWithState.map((step, index) => (
          <div key={step.id}>
            {index > 0 && (
              <div className="ml-[52px] border-t border-border/50 last:hidden" />
            )}
            <OnboardingStep
              step={step}
              completed={step.completed}
              isActive={
                !step.completed &&
                (expandedId === step.id ||
                  (!expandedId && !stepsWithState[index - 1]?.completed))
              }
              isExpanded={expandedId === step.id}
              onToggle={() => handleToggle(step.id)}
              onComplete={() => handleComplete(step.id)}
            />
          </div>
        ))}
      </div>

      {/* Completion state */}
      {completedCount > 0 && completedCount < stepsWithState.length && (
        <div className="px-5 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-success" />
            <p className="text-xs text-muted-foreground">
              {completedCount} étape{completedCount > 1 ? 's' : ''} terminée
              {completedCount > 1 ? 's' : ''} — continuez comme ça !
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
