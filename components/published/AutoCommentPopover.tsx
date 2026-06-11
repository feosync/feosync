// components/published/AutoCommentPopover.tsx
'use client'

import { useState } from 'react'
import { Bot, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { AutoCommentRequest, PublishedPost } from '@/lib/api/types'

interface Props {
  post: PublishedPost
  onSave: (payload: AutoCommentRequest) => void
  isPending?: boolean
  variant?: 'icon' | 'section'
}

export function AutoCommentPopover({ post, onSave, isPending, variant = 'icon' }: Props) {
  const [open, setOpen]               = useState(false)
  const [enabled, setEnabled]         = useState(post.is_auto_comment)
  const [instructions, setInstructions] = useState(post.instructions ?? '')
  const [keywords, setKeywords]       = useState(post.keywords ?? '')
  const [showFields, setShowFields]   = useState(
    !!(post.instructions || post.keywords)
  )

  const handleSave = () => {
    onSave({
      is_auto_comment: enabled,
      instructions: instructions.trim() || null,
      keywords: keywords.trim() || null,
    })
    setOpen(false)
  }

  const trigger = variant === 'icon' ? (
  <Button
        variant={post.is_auto_comment ? 'default' : 'outline'}
        size="icon"
        title={post.is_auto_comment ? "Auto-commentaire actif" : "Activer l'auto-commentaire"}
        className={`h-7 w-7 ${
        post.is_auto_comment
            ? 'bg-primary text-primary-foreground border-0'
            : 'text-muted-foreground hover:text-primary hover:border-primary/50'
        }`}
    >
        <MessageCircle className="w-3.5 h-3.5" />
    </Button>
    ) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
        {trigger ?? <span />}
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-4 bg-card border-border"
        align="end"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-4">
          {/* Toggle principal */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
                Auto-commentaire
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Claude répond aux commentaires
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {/* Champs optionnels */}
          {enabled && (
            <div className="space-y-3">
              <button
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowFields(v => !v)}
              >
                {showFields ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showFields ? 'Masquer les options' : 'Personnaliser (optionnel)'}
              </button>

              {showFields && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Instructions</Label>
                    <Textarea
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      placeholder="Ex : Réponds de manière professionnelle et chaleureuse…"
                      className="text-[12px] min-h-[64px] resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Mots-clés</Label>
                    <Textarea
                      value={keywords}
                      onChange={e => setKeywords(e.target.value)}
                      placeholder="Ex : engagement, communauté, fidélité"
                      className="text-[12px] min-h-[48px] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-[12px] border-border"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              className="flex-1 text-[12px]"
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? 'Sauvegarde…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}