'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOUR_STEPS, type TourStep } from '@/lib/onboarding'

interface GuidedTourProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

function getTargetRect(targetId: string): DOMRect | null {
  const el = document.getElementById(targetId)
  return el?.getBoundingClientRect() ?? null
}

function TourTooltip({
  step,
  current,
  total,
  onPrev,
  onNext,
  onClose,
  onComplete,
}: {
  step: TourStep
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onComplete: () => void
}) {
  const isLast = current === total - 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-card border border-border rounded-xl shadow-2xl p-5 max-w-xs w-full"
      role="dialog"
      aria-modal="true"
      aria-label={`Étape ${current + 1} : ${step.title}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {current + 1}/{total}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer la visite"
          className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1.5">
        {step.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        {step.description}
      </p>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={current === 0}
          className="text-xs h-8 px-3 rounded-lg"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Précédent
        </Button>
        {isLast ? (
          <Button
            size="sm"
            onClick={onComplete}
            className="text-xs h-8 px-4 rounded-lg gap-1"
          >
            Terminer
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onNext}
            className="text-xs h-8 px-4 rounded-lg gap-1"
          >
            Suivant
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export function GuidedTour({ open, onClose, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const step = TOUR_STEPS[currentStep]

  const updateRect = useCallback(() => {
    if (step) {
      setRect(getTargetRect(step.targetId))
    }
  }, [step])

  useEffect(() => {
    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [updateRect])

  useEffect(() => {
    if (open && step) {
      const el = document.getElementById(step.targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [open, currentStep, step])

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    setCurrentStep(0)
    onComplete()
  }, [onComplete])

  const handleClose = useCallback(() => {
    setCurrentStep(0)
    onClose()
  }, [onClose])

  if (!open || !step) return null

  const spotlightStyle: React.CSSProperties = rect
    ? {
        left: rect.left - 8,
        top: rect.top - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }
    : { display: 'none' }

  const getTooltipPosition = () => {
    if (!rect) return { top: 0, left: 0 }

    const gap = 16
    const tooltipWidth = 320

    switch (step.position) {
      case 'bottom':
        return {
          top: rect.bottom + gap,
          left: Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
        }
      case 'top':
        return {
          top: rect.top - gap - 200,
          left: Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
        }
      case 'left':
        return {
          top: rect.top,
          left: Math.max(16, rect.left - tooltipWidth - gap),
        }
      case 'right':
        return {
          top: rect.top,
          left: Math.min(window.innerWidth - tooltipWidth - 16, rect.right + gap),
        }
    }
  }

  const tooltipPos = getTooltipPosition()

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === 'Escape') handleClose()
        if (e.key === 'ArrowRight') handleNext()
        if (e.key === 'ArrowLeft') handlePrev()
      }}
    >
      {/* Dark overlay with hole-punch */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 8}
                y={rect.top - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#tour-spotlight-mask)"
          className="transition-all duration-300"
        />
      </svg>

      {/* Spotlight border */}
      {rect && (
        <div
          className="absolute rounded-xl border-2 border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.2)] pointer-events-none transition-all duration-300"
          style={spotlightStyle}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-10"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <AnimatePresence mode="wait">
          <TourTooltip
            key={currentStep}
            step={step}
            current={currentStep}
            total={TOUR_STEPS.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onClose={handleClose}
            onComplete={handleComplete}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}
