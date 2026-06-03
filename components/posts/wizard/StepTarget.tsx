'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Globe, Calendar, ArrowRight } from 'lucide-react'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import type { FacebookPageResponse, } from '@/lib/api/types'
import { fromZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const TIMEZONES = [
  { value: 'Indian/Antananarivo', label: 'Madagascar (UTC+3)', flag: '🇲🇬' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)', flag: '🇫🇷' },
  { value: 'Africa/Nairobi', label: 'Nairobi (UTC+3)', flag: '🇰🇪' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+2)', flag: '🇿🇦' },
  { value: 'Europe/London', label: 'Londres (UTC+0/+1)', flag: '🇬🇧' },
  { value: 'America/New_York', label: 'New York (UTC-5/-4)', flag: '🇺🇸' },
  { value: 'Asia/Dubai', label: 'Dubaï (UTC+4)', flag: '🇦🇪' },
  { value: 'Asia/Singapore', label: 'Singapour (UTC+8)', flag: '🇸🇬' },
  { value: 'UTC', label: 'UTC', flag: '🌐' },
]

interface StepTargetProps {
  pages: FacebookPageResponse[]
  isLoading: boolean
  onOrgChange?: (orgId: string) => void
  onNext: (data: { organization_id: string; facebook_page_id: string; publish_at?: string }) => void
}

export function StepTarget({ pages, isLoading, onOrgChange, onNext }: StepTargetProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [pageId, setPageId] = useState('')
  const [publishAt, setPublishAt] = useState('')
  const [timezone, setTimezone] = useState('Indian/Antananarivo')

  // Auto-select first page when pages change (stable dependency)
  useEffect(() => {
    if (pages.length > 0 && !pageId) {
      setPageId(pages[0].id)
    } else if (pages.length === 0) {
      setPageId('')
    }
  }, [pages.length, pages[0]?.id]) // Dépendance plus stable

  // Remonter l’organisation au parent
  useEffect(() => {
    if (selectedOrgId && onOrgChange) {
      onOrgChange(selectedOrgId)
    }
  }, [selectedOrgId, onOrgChange])

  const toUtcIso = useCallback((localDatetime: string, tz: string): string => {
    if (!localDatetime) return ''
    try {
      const utcDate = fromZonedTime(new Date(localDatetime), tz)
      return utcDate.toISOString()
    } catch {
      return ''
    }
  }, [])

  const preview = publishAt
    ? (() => {
        try {
          const utc = fromZonedTime(new Date(publishAt), timezone)
          return format(utc, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
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

  const isFormValid = Boolean(selectedOrgId && pageId)

  return (
    <Card className="p-8 bg-card border-border shadow-xl">
      <div className="space-y-8">

        {/* Organisation */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            Organisation <span className="text-destructive">*</span>
          </Label>
          <OrganisationSelector
            value={selectedOrgId}
            onChange={setSelectedOrgId}
            placeholder="Sélectionner une organisation"
          />
        </div>

        {/* Page Facebook */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            Page Facebook <span className="text-destructive">*</span>
          </Label>
          <Select value={pageId} onValueChange={setPageId} disabled={!selectedOrgId || pages.length === 0}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Sélectionnez une page Facebook" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.page_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fuseau horaire */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Globe className="w-4 h-4" />
            Fuseau horaire
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  <span className="mr-2">{tz.flag}</span> {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date et heure */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Date et heure de publication
          </Label>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className={cn(
              "w-full h-11 px-4 rounded-xl border bg-card text-foreground",
              "focus:ring-2 focus:ring-ring focus:border-transparent transition-all",
              "dark:[color-scheme:dark]"
            )}
          />

          {preview && (
            <div className="mt-3 flex items-start gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl">
              <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-foreground">Publication prévue, </span>
                <span className="text-sm text-muted-foreground mt-0.5">{preview}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bouton */}
        <Button
          onClick={handleNext}
          disabled={!isFormValid || isLoading}
          size="lg"
          className="w-full h-12 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.985]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              Continuer
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}