'use client'

import { Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { PostStatus } from '@/lib/api/types'

interface Props {
  open: boolean
  onClose: () => void
  status: PostStatus
  newDate: string
  setNewDate: (v: string) => void
  onSave: () => void   // ← sauvegarde draft (juste state local)
  onConfirm: () => void // ← confirme/replanifie via API
  isPending?: boolean
}

export function DateSheet({
  open, onClose, status,
  newDate, setNewDate,
  onSave, onConfirm, isPending,
}: Props) {
  const isScheduled = status === 'SCHEDULED'

  return (
    <Sheet open={open} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-slate-900 dark:text-white">
            Date de publication
          </SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400">
            {isScheduled
              ? 'Modifier la date replanifiera automatiquement la tâche Celery.'
              : 'Définissez quand ce post sera publié.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-1.5 mb-6">
          <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
            Date et heure
          </label>
          <input
            type="datetime-local"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {newDate && (
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              Publication le {format(new Date(newDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-700">
            Annuler
          </Button>

          {/* DRAFT → juste enregistrer la date localement + confirmer au moment de planifier */}
          {!isScheduled ? (
            <Button
              onClick={onSave}
              disabled={!newDate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Enregistrer
            </Button>
          ) : (
            /* SCHEDULED → replanifie via API immédiatement */
            <Button
              onClick={onConfirm}
              disabled={!newDate || isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Replanifier
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}