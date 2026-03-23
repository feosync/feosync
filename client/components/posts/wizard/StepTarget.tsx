'use client'

import { useState , useEffect} from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Globe } from 'lucide-react'
import type { FacebookPage } from '@/lib/api/types'
import { fromZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const TIMEZONES = [
  { value: 'Indian/Antananarivo', label: 'Madagascar (UTC+3)',       flag: '🇲🇬' },
  { value: 'Europe/Paris',        label: 'Paris (UTC+1/+2)',         flag: '🇫🇷' },
  { value: 'Africa/Nairobi',      label: 'Nairobi (UTC+3)',          flag: '🇰🇪' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+2)',     flag: '🇿🇦' },
  { value: 'Europe/London',       label: 'Londres (UTC+0/+1)',       flag: '🇬🇧' },
  { value: 'America/New_York',    label: 'New York (UTC-5/-4)',      flag: '🇺🇸' },
  { value: 'Asia/Dubai',          label: 'Dubaï (UTC+4)',            flag: '🇦🇪' },
  { value: 'Asia/Singapore',      label: 'Singapour (UTC+8)',        flag: '🇸🇬' },
  { value: 'UTC',                 label: 'UTC',                      flag: '🌐' },
]

interface StepTargetProps {
  pages: FacebookPage[]
  isLoading: boolean
  onNext: (data: { facebook_page_id: string; publish_at?: string }) => void
}

export function StepTarget({ pages, isLoading, onNext }: StepTargetProps) {
  const [pageId,    setPageId]    = useState(pages[0]?.id || '')
  const [publishAt, setPublishAt] = useState('')
  const [timezone,  setTimezone]  = useState('Indian/Antananarivo')

  useEffect(() => {
    if (pages.length > 0 && !pageId) {
      setPageId(pages[0].id)
    }
  }, [pages])

  // Convertit la date locale (dans le timezone choisi) → UTC ISO string
  const toUtcIso = (localDatetime: string, tz: string): string => {
    if (!localDatetime) return ''
    try {
      const utcDate = fromZonedTime(new Date(localDatetime), tz)
      return utcDate.toISOString()
    } catch {
      return ''
    }
  }

  // Aperçu lisible
  const preview = publishAt
    ? (() => {
        try {
          const utc = fromZonedTime(new Date(publishAt), timezone)
          return format(utc, "EEEE d MMMM yyyy 'à' HH:mm 'UTC'", { locale: fr })
        } catch { return '' }
      })()
    : null

  const handleNext = () => {
    onNext({
      facebook_page_id: pageId,
      publish_at: publishAt ? toUtcIso(publishAt, timezone) : undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-medium text-slate-900 dark:text-white mb-1">
          Choisissez une cible
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          Sélectionnez la page et la date de publication.
        </p>
      </div>

      {/* Page Facebook */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
          Page Facebook <span className="text-red-500">*</span>
        </label>
        <select
          value={pageId}
          onChange={e => setPageId(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {pages.length === 0 && <option value="">Aucune page connectée</option>}
          {pages.map(p => (
            <option key={p.id} value={p.id}>{p.page_name}</option>
          ))}
        </select>
      </div>

      {/* Timezone */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          Fuseau horaire
        </label>
        <select
          value={timezone}
          onChange={e => setTimezone(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          Date de publication
        </label>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={e => setPublishAt(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <Button
        onClick={handleNext}
        disabled={!pageId ||pages.length === 0 || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Créer le brouillon →
      </Button>
    </div>
  )
}