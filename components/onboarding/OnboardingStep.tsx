'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import type { StepDefinition } from '@/lib/onboarding'
import { cn } from '@/lib/utils'

interface OnboardingStepProps {
  step: StepDefinition
  completed: boolean
  isActive: boolean
  isExpanded: boolean
  onToggle: () => void
  onComplete: () => void
}

export function OnboardingStep({
  step,
  completed,
  isActive,
  isExpanded,
  onToggle,
  onComplete,
}: OnboardingStepProps) {
  const router = useRouter()
  const Icon = step.icon

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200 ease-in-out',
        !completed && 'hover:bg-accent',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 p-3 text-left transition-all duration-200',
          isActive && 'border-l-2 border-primary pl-[10px]',
          completed && 'opacity-80',
        )}
      >
        {/* Circle indicator */}
        <div className="relative shrink-0">
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              completed
                ? 'bg-primary/10 border-primary text-primary'
                : isActive
                  ? 'border-primary'
                  : 'border-muted-foreground/30',
            )}
          >
            {completed ? (
              <Check className="w-3 h-3" />
            ) : isActive ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : null}
          </div>
        </div>

        {/* Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200',
            completed
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <span
            className={cn(
              'text-sm font-medium transition-colors duration-200',
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

        {!completed && (
          <ArrowRight
            className={cn(
              'w-4 h-4 shrink-0 transition-all duration-200',
              isExpanded
                ? 'text-primary rotate-90'
                : 'text-muted-foreground/40',
            )}
          />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && !completed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-16">
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {step.description}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onComplete()
                    router.push(step.href)
                  }}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
                >
                  Commencer
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
