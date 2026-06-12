'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from './useAuth'
import {
  type OnboardingState,
  type ChecklistProgress,
  type StepProgress,
  DEFAULT_ONBOARDING_STATE,
  getStorageKey,
  computeStepsProgress,
  migrateState,
} from '@/lib/onboarding'

function loadState(userId: string): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_ONBOARDING_STATE
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OnboardingState>
      return migrateState({
        ...DEFAULT_ONBOARDING_STATE,
        ...parsed,
        checklist: { ...DEFAULT_ONBOARDING_STATE.checklist, ...parsed.checklist },
      })
    }
  } catch {}
  return DEFAULT_ONBOARDING_STATE
}

function saveState(userId: string, state: OnboardingState) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state))
  } catch {}
}

export function useOnboarding() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [state, setState] = useState<OnboardingState>(() =>
    userId ? loadState(userId) : DEFAULT_ONBOARDING_STATE,
  )

  useEffect(() => {
    if (userId) {
      setState(loadState(userId))
    }
  }, [userId])

  const persist = useCallback(
    (next: OnboardingState) => {
      setState(next)
      if (userId) saveState(userId, next)
    },
    [userId],
  )

  const update = useCallback(
    (patch: Partial<OnboardingState>) => {
      setState((prev) => {
        const next = { ...prev, ...patch }
        if (userId) saveState(userId, next)
        return next
      })
    },
    [userId],
  )

  const updateChecklist = useCallback(
    (patch: Partial<ChecklistProgress>) => {
      setState((prev) => {
        const next = {
          ...prev,
          checklist: { ...prev.checklist, ...patch },
        }
        if (userId) saveState(userId, next)
        return next
      })
    },
    [userId],
  )

  const dismissTooltip = useCallback(
    (tooltipId: string) => {
      setState((prev) => {
        if (prev.dismissedTooltips.includes(tooltipId)) return prev
        const next = {
          ...prev,
          dismissedTooltips: [...prev.dismissedTooltips, tooltipId],
        }
        if (userId) saveState(userId, next)
        return next
      })
    },
    [userId],
  )

  const resetOnboarding = useCallback(() => {
    persist(DEFAULT_ONBOARDING_STATE)
  }, [persist])

  const dismissBanner = useCallback(() => {
    setState((prev) => {
      if (prev.dismissed) return prev
      const next = { ...prev, dismissed: true }
      if (userId) saveState(userId, next)
      return next
    })
  }, [userId])

  const getSteps = useCallback((): StepProgress[] => {
    return state.steps
  }, [state.steps])

  const completeStep = useCallback(
    (stepId: string) => {
      setState((prev) => {
        const already = prev.steps.find((s) => s.id === stepId)
        if (already?.completed) return prev

        const steps = prev.steps.map((s) =>
          s.id === stepId
            ? { ...s, completed: true, completedAt: new Date().toISOString() }
            : s,
        )

        const next = { ...prev, steps }
        if (userId) saveState(userId, next)
        return next
      })
    },
    [userId],
  )

  const completeChecklistItem = useCallback(
    (itemId: keyof ChecklistProgress) => {
      updateChecklist({ [itemId]: true })
    },
    [updateChecklist],
  )

  const stepsProgress = useMemo(
    () => computeStepsProgress(state.steps),
    [state.steps],
  )

  const isFirstVisit = !state.welcomeSeen
  const allStepsComplete = stepsProgress.percent === 100

  return {
    state,
    update,
    updateChecklist,
    dismissTooltip,
    resetOnboarding,
    completeChecklistItem,
    dismissBanner,
    completeStep,
    getSteps,
    stepsProgress,
    isFirstVisit,
    allStepsComplete,
    userId,
  }
}
