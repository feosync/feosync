'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeModalProps {
  open: boolean
  onStartTour: () => void
  onDismiss: () => void
}

export function WelcomeModal({ open, onStartTour, onDismiss }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onDismiss}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Bienvenue sur FeoSync"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl"
          >
            <button
              onClick={onDismiss}
              aria-label="Fermer"
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Bienvenue sur FeoSync
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Automatisez votre présence Facebook avec l&apos;IA.
                  Planifiez, publiez et analysez vos contenus en un clin d&apos;œil.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 w-full pt-2">
                <Button
                  onClick={onStartTour}
                  className="h-11 rounded-xl gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Commencer la visite guidée
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={onDismiss}
                  className="h-11 rounded-xl text-sm border-border text-muted-foreground hover:text-foreground"
                >
                  Passer
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
