'use client'

import { useState } from 'react'
import { Loader2, Globe, CalendarClock } from 'lucide-react'
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

  const toUtcIso = (localDatetime: string, tz: string): string => {
    if (!localDatetime) return ''
    try {
      return fromZonedTime(new Date(localDatetime), tz).toISOString()
    } catch { return '' }
  }

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
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-background border-border flex flex-col gap-0 p-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-foreground text-base leading-tight">
                Date de publication
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-xs mt-0.5">
                {isScheduled
                  ? 'Modifier la date replanifiera automatiquement la tâche.'
                  : 'Définissez quand ce post sera publié.'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 px-6 py-6 space-y-5">

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Fuseau horaire
            </label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
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
            <label className="text-xs font-medium text-muted-foreground">
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />

            {/* Preview UTC */}
            {preview && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-primary/5 rounded-lg border border-primary/20 mt-2">
                <Globe className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sera publié le{' '}
                  <span className="font-medium text-foreground">{preview}</span>
                </p>
              </div>
            )}
          </div>

          {/* Divider hint */}
          {isScheduled && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2.5 border border-border">
              ⚠️ La modification replanifiera automatiquement la tâche Celery associée.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border"
          >
            Annuler
          </Button>

          {!isScheduled ? (
            <Button
              onClick={() => onSave(utcIso)}
              disabled={!newDate}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Enregistrer
            </Button>
          ) : (
            <Button
              onClick={() => onConfirm(utcIso)}
              disabled={!newDate || isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
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