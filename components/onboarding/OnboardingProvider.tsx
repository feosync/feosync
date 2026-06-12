'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import type { ChecklistProgress, OnboardingState, StepProgress } from '@/lib/onboarding'

interface OnboardingContextType {
  state: OnboardingState
  update: (patch: Partial<OnboardingState>) => void
  updateChecklist: (patch: Partial<ChecklistProgress>) => void
  dismissTooltip: (tooltipId: string) => void
  resetOnboarding: () => void
  completeChecklistItem: (itemId: keyof ChecklistProgress) => void
  isFirstVisit: boolean
  dismissBanner: () => void
  completeStep: (stepId: string) => void
  getSteps: () => StepProgress[]
  stepsProgress: { completed: number; total: number; percent: number }
  allStepsComplete: boolean
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const onboarding = useOnboarding()

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboardingContext must be used within OnboardingProvider')
  return ctx
}
