'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { FacebookPage } from '@/lib/api/types'

interface StepTargetProps {
  pages: FacebookPage[]
  isLoading: boolean
  onNext: (data: { facebook_page_id: string; publish_at?: string }) => void
}

export function StepTarget({ pages, isLoading, onNext }: StepTargetProps) {
  const [pageId, setPageId] = useState(pages[0]?.id || '')
  const [publishAt, setPublishAt] = useState('')

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

      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
          Date de publication (optionnel)
        </label>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={e => setPublishAt(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-[11px] text-slate-400">Laissez vide pour définir plus tard</p>
      </div>

      <Button
        onClick={() => onNext({ facebook_page_id: pageId, publish_at: publishAt || undefined })}
        disabled={!pageId || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Créer le brouillon →
      </Button>
    </div>
  )
}