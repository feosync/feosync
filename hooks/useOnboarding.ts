'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './useAuth'
import {
  type OnboardingState,
  type ChecklistProgress,
  DEFAULT_ONBOARDING_STATE,
  getStorageKey,
} from '@/lib/onboarding'

function loadState(userId: string): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_ONBOARDING_STATE
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw) as OnboardingState
      return {
        ...DEFAULT_ONBOARDING_STATE,
        ...parsed,
        checklist: { ...DEFAULT_ONBOARDING_STATE.checklist, ...parsed.checklist },
      }
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
    setState(DEFAULT_ONBOARDING_STATE)
    if (userId) {
      localStorage.removeItem(getStorageKey(userId))
    }
  }, [userId])

  const completeChecklistItem = useCallback(
    (itemId: keyof ChecklistProgress) => {
      updateChecklist({ [itemId]: true })
    },
    [updateChecklist],
  )

  const isFirstVisit = !state.welcomeSeen

  return {
    state,
    update,
    updateChecklist,
    dismissTooltip,
    resetOnboarding,
    completeChecklistItem,
    isFirstVisit,
    userId,
  }
}
