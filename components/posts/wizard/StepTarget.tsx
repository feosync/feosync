'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Globe } from 'lucide-react'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
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
  onOrgChange?: (orgId: string) => void     
  onNext: (data: { organization_id: string; facebook_page_id: string; publish_at?: string }) => void
}

export function StepTarget({ pages, isLoading, onOrgChange, onNext }: StepTargetProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [pageId, setPageId] = useState('')
  const [publishAt, setPublishAt] = useState('')
  const [timezone, setTimezone] = useState('Indian/Antananarivo')

  // Mise à jour automatique de la page quand les pages changent
  useEffect(() => {
    if (pages.length > 0 && !pageId) {
      setPageId(pages[0].id)
    } else if (pages.length === 0) {
      setPageId('')
    }
  }, [pages])

  // Remonter l'organisation sélectionnée au parent
  useEffect(() => {
    if (selectedOrgId && onOrgChange) {
      onOrgChange(selectedOrgId)
    }
  }, [selectedOrgId, onOrgChange])

  const toUtcIso = (localDatetime: string, tz: string): string => {
    if (!localDatetime) return ''
    try {
      const utcDate = fromZonedTime(new Date(localDatetime), tz)
      return utcDate.toISOString()
    } catch {
      return ''
    }
  }

  const preview = publishAt
    ? (() => {
        try {
          const utc = fromZonedTime(new Date(publishAt), timezone)
          return format(utc, "EEEE d MMMM yyyy 'à' HH:mm 'UTC'", { locale: fr })
        } catch {
          return ''
        }
      })()
    : null

  const handleNext = () => {
    if (!selectedOrgId || !pageId) return

    onNext({
      organization_id: selectedOrgId,
      facebook_page_id: pageId,
      publish_at: publishAt ? toUtcIso(publishAt, timezone) : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[15px] font-medium text-slate-900 dark:text-white mb-1">
          Choisissez une cible
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          Sélectionnez l’organisation, la page et la date de publication.
        </p>
      </div>

      {/* Organisation */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
          Organisation <span className="text-red-500">*</span>
        </label>
        <OrganisationSelector
          value={selectedOrgId}
          onChange={setSelectedOrgId}
          placeholder="Sélectionner une organisation"
        />
      </div>

      {/* Page Facebook */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
          Page Facebook <span className="text-red-500">*</span>
        </label>
          <select
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              disabled={!selectedOrgId || pages.length === 0}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 ... disabled:opacity-50"
            >
              {!selectedOrgId ? (
                <option value="">Sélectionnez d'abord une organisation</option>
              ) : pages.length === 0 ? (
                <option value="">Aucune page Facebook connectée pour cette organisation</option>
              ) : (
                pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.page_name}
                  </option>
                ))
              )}
          </select>
      </div>

      {/* Fuseau horaire */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          Fuseau horaire
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.flag} {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date de publication */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
          Date et heure de publication
        </label>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(e) => setPublishAt(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {preview && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
            <Globe className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              Sera publié le <span className="font-medium">{preview}</span>
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={handleNext}
        disabled={!selectedOrgId || !pageId || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Continuer →
      </Button>
    </div>
  )
}