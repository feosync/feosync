'use client'

import { useState } from 'react'
import { Loader2, Globe } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { fromZonedTime } from 'date-fns-tz'
import type { PostStatus } from '@/lib/api/types'

const TIMEZONES = [
  { value: 'Indian/Antananarivo', label: 'Madagascar (UTC+3)',   flag: '🇲🇬' },
  { value: 'Europe/Paris',        label: 'Paris (UTC+1/+2)',     flag: '🇫🇷' },
  { value: 'Africa/Nairobi',      label: 'Nairobi (UTC+3)',      flag: '🇰🇪' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+2)', flag: '🇿🇦' },
  { value: 'Europe/London',       label: 'Londres (UTC+0/+1)',   flag: '🇬🇧' },
  { value: 'America/New_York',    label: 'New York (UTC-5/-4)',  flag: '🇺🇸' },
  { value: 'Asia/Dubai',          label: 'Dubaï (UTC+4)',        flag: '🇦🇪' },
  { value: 'Asia/Singapore',      label: 'Singapour (UTC+8)',    flag: '🇸🇬' },
  { value: 'UTC',                 label: 'UTC',                  flag: '🌐' },
]

interface Props {
  open: boolean
  onClose: () => void
  status: PostStatus
  newDate: string
  setNewDate: (v: string) => void
  onSave: (utcIso: string) => void
  onConfirm: (utcIso: string) => void
  isPending?: boolean
}

export function DateSheet({
  open, onClose, status,
  newDate, setNewDate,
  onSave, onConfirm, isPending,
}: Props) {
  const isScheduled = status === 'SCHEDULED'
  const [timezone, setTimezone] = useState('Indian/Antananarivo')

  // Convertit la date locale → UTC ISO
  const toUtcIso = (localDatetime: string, tz: string): string => {
    if (!localDatetime) return ''
    try {
      return fromZonedTime(new Date(localDatetime), tz).toISOString()
    } catch { return '' }
  }

  // Aperçu UTC lisible
  const preview = newDate
    ? (() => {
        try {
          const utc = fromZonedTime(new Date(newDate), timezone)
          return format(utc, "EEEE d MMMM yyyy 'à' HH:mm 'UTC'", { locale: fr })
        } catch { return '' }
      })()
    : null

  const utcIso = toUtcIso(newDate, timezone)

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

        <div className="space-y-4 mb-6">

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Fuseau horaire
            </label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.flag} {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date locale */}
          <div className="space-y-1.5">
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

            {/* Aperçu UTC */}
            {preview && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                <Globe className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Sera publié le <span className="font-medium">{preview}</span>
                </p>
              </div>
            ) }
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-700">
            Annuler
          </Button>

          {!isScheduled ? (
            <Button
              onClick={() => onSave(utcIso)}
              disabled={!newDate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Enregistrer
            </Button>
          ) : (
            <Button
              onClick={() => onConfirm(utcIso)}
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