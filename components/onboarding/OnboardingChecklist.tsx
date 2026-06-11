'use client'

import { useRouter } from 'next/navigation'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { useOnboardingContext } from './OnboardingProvider'
import { CHECKLIST_ITEMS, computeProgress } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

export function OnboardingChecklist() {
  const { state, completeChecklistItem } = useOnboardingContext()
  const router = useRouter()
  const progress = computeProgress(state)
  const items = CHECKLIST_ITEMS(state)

  const isComplete = progress === 100

  if (isComplete) return null

  return (
    <div
      id="onboarding-checklist"
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Démarrage
          </h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (!item.done) {
                completeChecklistItem(item.id)
              }
              router.push(item.href)
            }}
            className={cn(
              'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all group',
              item.done
                ? 'opacity-50'
                : 'hover:bg-muted/50 cursor-pointer',
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                item.done
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground/30 group-hover:border-primary/50',
              )}
            >
              {item.done ? (
                <Check className="w-3 h-3" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30 group-hover:bg-primary/50 transition-colors" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-xs font-medium',
                item.done ? 'text-muted-foreground' : 'text-foreground',
              )}>
                {item.label}
              </p>
              {!item.done && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
            {!item.done && (
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
