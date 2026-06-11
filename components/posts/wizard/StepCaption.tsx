'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Eye,
  RotateCcw,
  CheckCircle2,
  Facebook,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react'
import type { ScheduledPost } from '@/lib/api/types'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { canGenerateCaption, checkCanGenerateCaption } from '@/lib/api/plan-limits'
import { cn } from '@/lib/utils'
import { log } from 'console'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepCaptionProps {
  post: ScheduledPost
  isLoading: boolean
  onNext: (data: CaptionPayload) => void
  onBack: () => void
  onSkip: () => void
  /** Génère le caption via LLM et retourne le texte produit */
  onGenerateCaption?: (data: { mode: 'llm'; topic: string; language: string }) => Promise<{ caption: string }>
}

type CaptionMode = 'manual' | 'llm'
type UIState = 'editing' | 'generating' | 'preview'

interface CaptionPayload {
  mode: CaptionMode
  text?: string
  topic?: string
  language?: string
}

// ─── Styles extraits ─────────────────────────────────────────────────────────

const S = {
  card: 'rounded-2xl bg-neutral-800/50 border border-white/8 overflow-hidden shadow-xl shadow-black/20',
  tabActive: 'bg-white/10 shadow-sm text-white border border-white/12',
  tabInactive: 'text-white/50 hover:text-white/80 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed',
  input: 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-white/25 focus:ring-0 resize-none text-[13px] leading-relaxed',
  label: 'text-[12px] font-medium text-white/60 uppercase tracking-wider',
  ghost: 'bg-white/6 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white/90 rounded-xl',
  primary: 'bg-white text-neutral-900 hover:bg-neutral-100 font-semibold rounded-xl',
  skeletonLine: 'h-3 rounded-full bg-white/8 animate-pulse',
} as const

// ─── Composant ───────────────────────────────────────────────────────────────

export function StepCaption({
  post,
  isLoading,
  onNext,
  onBack,
  onSkip,
  onGenerateCaption,
}: StepCaptionProps) {
  const { data: userDetail } = useCurrentUserDetail()
  const canGenerateAI = canGenerateCaption(userDetail)

  // ── État local ──
  const [mode, setMode] = useState<CaptionMode>('manual')
  const [uiState, setUiState] = useState<UIState>('editing')

  // Mode manuel
  const [caption, setCaption] = useState(post.caption || '')

  // Mode LLM
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('fr')
  const [generatedCaption, setGeneratedCaption] = useState('')
  const [generationError, setGenerationError] = useState<string | null>(null)

  // UI
  const [copied, setCopied] = useState(false)
  // Caption affiché en preview selon le mode
  const previewText = mode === 'manual' ? caption : generatedCaption

  let charCount = 0
  if (previewText!==undefined) {
     charCount = previewText.length
  }
  const isOverLimit = charCount > 2200

  // ── Handlers ──

  const handleSwitchMode = (m: CaptionMode) => {
    if (m === 'llm' && !canGenerateAI) return
    setMode(m)
    setUiState('editing')
    setGenerationError(null)
  }

  /** Manuel → preview directe | LLM → génération API puis preview */
  const handlePreview = async () => {
    if (mode === 'manual') {
      if (!caption.trim() || isOverLimit) return
      setUiState('preview')
      return
    }

    // Mode LLM
    if (!topic.trim() || !canGenerateAI) return
    setGenerationError(null)
    setUiState('generating')

    try {
      if (!onGenerateCaption) {
        throw new Error('Générateur non disponible.')
      }
      let data: { mode: 'llm'; topic: string; language: string } = { mode: 'llm', topic: topic.trim(), language: language }
      const result = await onGenerateCaption(data)
      setGeneratedCaption(result.caption)
      setUiState('preview')
    } catch (err: unknown) {
      setGenerationError(err instanceof Error ? err.message : 'Erreur lors de la génération.')
      setUiState('editing')
    }
  }

  const handleConfirmAndNext = () => {
    if (mode === 'manual') {
      onNext({ mode: 'manual', text: caption.trim() })
    } else {
      onNext({ mode: 'llm', text: generatedCaption, topic: topic.trim(), language: language })
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // CTA principal dans la barre de navigation
  const isEditingDisabled =
    uiState === 'editing' &&
    ((mode === 'manual' && (!caption.trim() || isOverLimit)) ||
      (mode === 'llm' && (!topic.trim() || !canGenerateAI)))

  // ── Render ──

  return (
    <div className="space-y-5">

      {/* ── Tabs mode ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white/4 rounded-xl border border-white/8">
        {(['manual', 'llm'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleSwitchMode(m)}
            disabled={m === 'llm' && !canGenerateAI}
            aria-selected={mode === m}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-medium transition-all duration-200',
              mode === m ? S.tabActive : S.tabInactive
            )}
          >
            {m === 'manual'
              ? <><Edit3 className="w-3.5 h-3.5" /> Manuel</>
              : <><Sparkles className={cn('w-3.5 h-3.5', mode === 'llm' ? 'text-success' : 'text-white/30')} /> Générer avec IA</>
            }
          </button>
        ))}
      </div>

      {/* ── Zone principale ────────────────────────────────────────────────── */}

      {/* ÉTAT : Édition */}
      {uiState === 'editing' && (
        <div className="space-y-4">

          {/* Erreur génération */}
          {generationError && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-[12px] text-red-300">{generationError}</p>
            </div>
          )}

          {mode === 'manual' ? (
            /* ── Mode manuel ── */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={S.label}>Caption</Label>
                {/* <span className={cn(
                  'text-[11px] tabular-nums transition-colors',
                  isOverLimit ? 'text-red-400 font-medium' : 'text-white/35'
                )}>
                  {charCount.toLocaleString()} / 2 200
                </span> */}
              </div>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Écrivez un caption captivant pour votre publication Facebook…"
                rows={7}
                maxLength={2200}
                className={cn(S.input, 'font-mono tracking-tight placeholder:font-sans placeholder:tracking-normal')}
              />
            </div>
          ) : (
            /* ── Mode LLM ── */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={S.label}>
                  Sujet de la publication <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex : Lancement de notre nouvelle collection été 2026, focus sur l'innovation durable…"
                  rows={4}
                  className={S.input}
                />
              </div>
              <div className="space-y-2">
                <Label className={S.label}>Langue</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className={cn(S.ghost, 'w-44 h-9 text-[13px]')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border border-white/10 rounded-xl">
                    <SelectItem value="fr" className="text-[13px] text-white/80 focus:bg-white/8">🇫🇷 Français</SelectItem>
                    <SelectItem value="en" className="text-[13px] text-white/80 focus:bg-white/8">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Bouton Prévisualiser inline */}
          <button
            onClick={handlePreview}
            disabled={isEditingDisabled}
            className={cn(
              'w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-dashed text-[13px] transition-all duration-200',
              isEditingDisabled
                ? 'border-white/8 text-white/25 cursor-not-allowed'
                : 'border-white/20 text-white/60 hover:border-white/35 hover:text-white/90 hover:bg-white/4'
            )}
          >
            {mode === 'llm' ? (
              <><Sparkles className="w-4 h-4 text-success" /> Générer & prévisualiser</>
            ) : (
              <><Eye className="w-4 h-4" /> Prévisualiser</>
            )}
          </button>
        </div>
      )}

      {/* ÉTAT : Génération en cours (LLM uniquement) */}
      {uiState === 'generating' && (
        <div className={S.card}>
          {/* Header skeleton */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 bg-white/3">
            <div className="w-8 h-8 rounded-full bg-success/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-success animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className={cn(S.skeletonLine, 'w-24')} />
              <div className={cn(S.skeletonLine, 'w-36')} />
            </div>
          </div>
          {/* Lignes skeleton du contenu */}
          <div className="p-4 space-y-2.5">
            {[100, 85, 92, 70, 88, 60].map((w, i) => (
              <div
                key={i}
                className={cn(S.skeletonLine)}
                style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
          <div className="px-4 py-3 border-t border-white/8 bg-white/2 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-success" />
            <span className="text-[12px] text-white/40">Génération en cours…</span>
          </div>
        </div>
      )}

      {/* ÉTAT : Preview */}
      {uiState === 'preview' && (
        <div className="space-y-4">

          {/* Carte style Facebook */}
          <div className={S.card}>

            {/* Header simulé Facebook */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 bg-white/3">
              <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Facebook className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white leading-none">Votre Page</p>
                <p className="text-[10px] text-white/40 mt-0.5">Aperçu de la publication</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                {mode === 'llm' && (
                  <span className="text-[10px] font-medium text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                    IA
                  </span>
                )}
                <span className="text-[10px] font-medium text-white/40 bg-white/6 border border-white/8 px-2 py-0.5 rounded-full">
                  Aperçu
                </span>
              </div>
            </div>

            {/* Contenu éditable en mode LLM, texte brut en manuel */}
            <div className="relative p-4">
              {mode === 'llm' ? (
                /* Caption LLM éditable directement */
                <Textarea
                  value={generatedCaption}
                  onChange={(e) => setGeneratedCaption(previewText)}
                  rows={8}
                  className={cn(
                    S.input,
                    'border-transparent bg-transparent focus:border-white/15 focus:bg-white/3 transition-all duration-200'
                  )}
                  aria-label="Caption généré — modifiable"
                />
              ) : (
                <p className="text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap break-words pr-8">
                  {previewText}
                </p>
              )}

              {/* Bouton copier */}
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-white/35 hover:text-white/80 hover:bg-white/8 transition-colors"
                aria-label="Copier le caption"
              >
                {copied
                  ? <Check className="w-3.5 h-3.5 text-success" />
                  : <Copy className="w-3.5 h-3.5" />
                }
              </button>
            </div>

            {/* Footer compteur */}
            <div className="px-4 py-2.5 border-t border-white/8 bg-white/2 flex items-center justify-between">
              <span className={cn(
                'text-[10px] tabular-nums transition-colors',
                isOverLimit ? 'text-red-400 font-medium' : 'text-white/35'
              )}>
                {/* {charCount?.toLocaleString()} / 2 200 caractères */}
              </span>
              {/* <span className="text-[10px] text-white/25">
                ~{Math.ceil(previewText.split(' ').filter(Boolean).length / 200)} min de lecture
              </span> */}
            </div>
          </div>

          {/* Lien "Modifier" */}
          <button
            onClick={() => setUiState('editing')}
            className="flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {mode === 'llm' ? 'Régénérer' : 'Modifier'}
          </button>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/8">

        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className={cn(S.ghost, 'gap-1.5 h-9 text-[13px]')}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-white/35 hover:text-white/60 text-[12px] h-9"
        >
          Ignorer
        </Button>

        {/* CTA principal adaptatif */}
        <Button
          onClick={uiState === 'preview' ? handleConfirmAndNext : handlePreview}
          disabled={
            isLoading ||
            uiState === 'generating' ||
            (uiState === 'editing' && isEditingDisabled) ||
            (uiState === 'preview' && isOverLimit)
          }
          size="sm"
          className={cn(S.primary, 'ml-auto gap-2 min-w-40 h-9 text-[13px] disabled:opacity-40')}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Enregistrement…
            </>
          ) : uiState === 'generating' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Génération…
            </>
          ) : uiState === 'preview' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirmer & continuer
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : mode === 'llm' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-success" />
              Générer & prévisualiser
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Prévisualiser
            </>
          )}
        </Button>
      </div>
    </div>
  )
}