'use client'

import { ArrowLeft, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { PostStatus, ScheduledPost } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const STATUS: Record<PostStatus, {
  label: string
  badgeClass: string
  dotClass: string
  accentClass: string
}> = {
  DRAFT: {
    label:       'Brouillon',
    badgeClass:  'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
    dotClass:    'bg-muted-foreground',
    accentClass: 'border-l-muted-foreground',
  },
  SCHEDULED: {
    label:       'Planifié',
    badgeClass:  'bg-primary/10 text-primary ring-1 ring-inset ring-primary/20',
    dotClass:    'bg-primary animate-pulse',
    accentClass: 'border-l-primary',
  },
  PUBLISHED: {
    label:       'Publié',
    badgeClass:  'bg-primary text-primary-foreground shadow-sm',
    dotClass:    'bg-primary-foreground animate-pulse',
    accentClass: 'border-l-primary',
  },
  FAILED: {
    label:       'Échoué',
    badgeClass:  'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20',
    dotClass:    'bg-destructive',
    accentClass: 'border-l-destructive',
  },
}

interface Props {
  post: ScheduledPost
  onBack: () => void
  onDelete: () => void
  onPublishNow: () => void
  isDeleting?: boolean
}

export function PostDetailHeader({
  post,
  onBack,
  onDelete,
  onPublishNow,
  isDeleting,
}: Props) {
  const s = STATUS[post.status as PostStatus]
  const canPublishNow = post.status === 'DRAFT' || post.status === 'SCHEDULED'

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4',
        'bg-card border-b border-border',
        'px-5 py-3.5',
        // Ligne d'accentuation gauche coloré selon le statut
        'border-l-2 transition-colors duration-300',
        s.accentClass,
      )}
    >

      {/* ── Gauche : retour + titre + badge ── */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Bouton retour avec animation de flèche */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'group h-8 w-8 flex-shrink-0 rounded-lg',
            'text-muted-foreground hover:text-foreground hover:bg-accent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-all duration-150',
          )}
          onClick={onBack}
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
        </Button>

        {/* Titre + badge + sous-titre */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-semibold text-foreground leading-none tracking-tight">
              Détail du post
            </h1>

            {/* Badge amélioré avec ring inset */}
            <Badge
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-md',
                'flex items-center gap-1.5 border-0',
                s.badgeClass,
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dotClass)} />
              {s.label}
            </Badge>
          </div>

          <p className="text-[11px] text-muted-foreground mt-1 leading-none">
            Créé le{' '}
            <span className="text-foreground/70 font-medium">
              {format(new Date(post.created_at), 'd MMM yyyy', { locale: fr })}
            </span>
          </p>
        </div>
      </div>

      {/* ── Droite : actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Publier maintenant */}
        {canPublishNow && (
          <Button
            size="sm"
            onClick={onPublishNow}
            className={cn(
              'bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground',
              'gap-1.5 text-xs font-medium h-8 px-3.5 rounded-lg',
              'shadow-sm hover:shadow-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'transition-all duration-150',
            )}
          >
            <Send className="w-3.5 h-3.5" />
            Publier
          </Button>
        )}

        {/* Supprimer */}
        {post.status !== 'PUBLISHED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className={cn(
              'group h-8 w-8 p-0 rounded-lg',
              'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-40 disabled:pointer-events-none',
              'transition-all duration-150',
            )}
            aria-label="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5 transition-transform duration-150 group-hover:scale-110" />
          </Button>
        )}
      </div>

    </div>
  )
}