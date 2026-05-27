'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Edit3 } from 'lucide-react'
import type { ScheduledPost } from '@/lib/api/types'
import { useCurrentUserDetail } from '@/hooks/useCurrentUserDetail'
import { checkCanGenerateCaption } from '@/lib/api/plan-limits'
import { cn } from '@/lib/utils'

interface StepCaptionProps {
  post: ScheduledPost
  isLoading: boolean
  onNext: (data: any) => void
  onBack: () => void
  onSkip: () => void
}

export function StepCaption({ post, isLoading, onNext, onBack, onSkip }: StepCaptionProps) {
  const { data: userDetail } = useCurrentUserDetail()
  const [mode, setMode] = useState<'manual' | 'llm'>('manual')
  const [caption, setCaption] = useState(post.caption || '')
  const [topic, setTopic] = useState('')
  const [language, setLang] = useState('fr')

  const canGenerateAI = checkCanGenerateCaption(userDetail)

  const handleNext = () => {
    if (mode === 'manual') {
      onNext({ mode: 'manual', text: caption.trim() })
    } else {
      if (!canGenerateAI || !topic.trim()) return
      onNext({ mode: 'llm', topic: topic.trim(), language })
    }
  }

  const charCount = caption.length
  const isOverLimit = charCount > 2200

  return (
    <Card className="p-8 bg-card border-border shadow-xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Rédigez le caption</h2>
          <p className="text-muted-foreground">
            Écrivez manuellement ou laissez l’IA générer un texte engageant.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-1 p-1 bg-muted rounded-2xl">
          {(['manual', 'llm'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                if (m === 'llm' && !canGenerateAI) return
                setMode(m)
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                mode === m
                  ? "bg-card shadow-sm text-foreground border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              )}
            >
              {m === 'manual' ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  Manuel
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-primary" />
                  Générer avec IA
                </>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {mode === 'manual' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Caption</Label>
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {charCount} / 2200
              </span>
            </div>

            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Écrivez un caption captivant pour votre publication..."
              rows={7}
              maxLength={2200}
              className="resize-none text-base leading-relaxed"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>
                Sujet de la publication <span className="text-destructive">*</span>
              </Label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Lancement de notre nouvelle collection été 2026, focus sur l'innovation durable..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Langue du caption</Label>
              <Select value={language} onValueChange={setLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>

          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Ignorer
          </Button>

          <Button
            onClick={handleNext}
            disabled={
              isLoading ||
              (mode === 'manual' ? !caption.trim() : !topic.trim()) ||
              (mode === 'llm' && !canGenerateAI)
            }
            className="flex-1 h-12 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {mode === 'llm' ? 'Génération en cours...' : 'Enregistrement...'}
              </>
            ) : (
              <>
                {mode === 'llm' ? 'Générer le caption' : 'Enregistrer le caption'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}