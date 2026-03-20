'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import type { ScheduledPost } from '@/lib/api/types'

interface StepCaptionProps {
  post: ScheduledPost
  isLoading: boolean
  onNext: (data: any) => void
  onBack: () => void
}

export function StepCaption({ post, isLoading, onNext, onBack }: StepCaptionProps) {
  const [mode, setMode]       = useState<'manual' | 'llm'>('manual')
  const [caption, setCaption] = useState(post.caption || '')
  const [topic, setTopic]     = useState('')
  const [language, setLang]   = useState('fr')

  const handleNext = () => {
    if (mode === 'manual') {
      onNext({ mode: 'manual', text: caption })
    } else {
      onNext({ mode: 'llm', topic, language })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-medium text-slate-900 dark:text-white mb-1">Rédigez le caption</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Manuel ou généré par IA.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {(['manual', 'llm'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] rounded-md transition-colors ${
              mode === m
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {m === 'llm' && <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
            {m === 'manual' ? 'Manuel' : 'Générer avec IA'}
          </button>
        ))}
      </div>

      {mode === 'manual' ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Caption</label>
            <span className={`text-[11px] ${caption.length > 2200 ? 'text-red-500' : 'text-slate-400'}`}>
              {caption.length} / 2200
            </span>
          </div>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Rédigez votre caption..."
            rows={5}
            maxLength={2200}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
              Sujet <span className="text-red-500">*</span>
            </label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ex: Lancement d'un nouveau produit tech"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Langue</label>
            <select
              value={language}
              onChange={e => setLang(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onBack} className="border-slate-200 dark:border-slate-700">
          ← Retour
        </Button>
        <Button
          onClick={handleNext}
          disabled={isLoading || (mode === 'manual' ? !caption.trim() : !topic.trim())}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? (mode === 'llm' ? 'Génération...' : 'Enregistrement...') : 'Enregistrer →'}
        </Button>
      </div>
    </div>
  )
}