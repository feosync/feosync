'use client'

import { Sparkles, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanGenerateCaption } from '@/lib/api/plan-limits'

interface Props {
  open: boolean
  onClose: () => void
  captionMode: 'manual' | 'llm'
  setCaptionMode: (m: 'manual' | 'llm') => void
  captionText: string
  setCaptionText: (v: string) => void
  aiTopic: string
  setAiTopic: (v: string) => void
  aiLang: string
  setAiLang: (v: string) => void
  onSave: () => void
  isPending?: boolean
}

export function CaptionSheet({
  open, onClose,
  captionMode, setCaptionMode,
  captionText, setCaptionText,
  aiTopic, setAiTopic,
  aiLang, setAiLang,
  onSave, isPending,
}: Props) {
  const { data: userDetail } = useCurrentUserDetail()

  const saveDisabled =
    isPending ||
    (captionMode === 'manual' && !captionText.trim()) ||
    (captionMode === 'llm' && !aiTopic.trim())

  const handleSave = () => {
    if (captionMode === 'llm' && !checkCanGenerateCaption(userDetail)) return
    onSave()
  }

  return (
    <Sheet open={open} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-slate-900 dark:text-white">Modifier le caption</SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400">
            Rédigez manuellement ou laissez l'IA générer pour vous.
          </SheetDescription>
        </SheetHeader>

        {/* Toggle manuel / IA */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
          {(['manual', 'llm'] as const).map(m => (
            <button
              key={m}
              onClick={() => {
                if (m === 'llm' && !checkCanGenerateCaption(userDetail)) return
                setCaptionMode(m)
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] rounded-md transition-colors ${
                captionMode === m
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-medium'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {m === 'llm' && <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
              {m === 'manual' ? 'Manuel' : 'IA'}
            </button>
          ))}
        </div>

        {captionMode === 'manual' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Caption</label>
              <span className={`text-[11px] ${captionText.length > 2200 ? 'text-red-500' : 'text-slate-400'}`}>
                {captionText.length} / 2200
              </span>
            </div>
            <textarea
              value={captionText}
              onChange={e => setCaptionText(e.target.value)}
              rows={8}
              maxLength={2200}
              placeholder="Rédigez votre caption..."
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
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="Ex: Lancement d'un nouveau produit"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Langue</label>
              <select
                value={aiLang}
                onChange={e => setAiLang(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-700">
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveDisabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending
              ? captionMode === 'llm' ? 'Génération...' : 'Enregistrement...'
              : 'Enregistrer'
            }
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}