'use client'

import { useState } from 'react'
import { MoreVertical, Trash2, Eye, Calendar, Images, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { ScheduledPost, PostStatus } from '@/lib/api/types'
import { cn } from '@/lib/utils'

// ── Statuts alignés sur les tokens du global.css ──────────────────────────
//    PUBLISHED  →  badge solid primary (bleu plein) pour le distinguer visuellement
//    SCHEDULED  →  badge primary/15 (bleu translucide)
//    DRAFT      →  badge muted (gris neutre)
//    FAILED     →  badge destructive/15 (rouge translucide)
const STATUS: Record<PostStatus, {
  label: string
  badgeClass: string
  dotClass: string
}> = {
  DRAFT: {
    label: 'Brouillon',
    badgeClass: 'bg-muted text-muted-foreground border-0',
    dotClass: 'bg-muted-foreground',
  },
  SCHEDULED: {
    label: 'Planifié',
    badgeClass: 'bg-primary/15 text-primary border-0',
    dotClass: 'bg-primary',
  },
  PUBLISHED: {
    label: 'Publié',
    // Badge solid primary = visuellement distinct de SCHEDULED
    badgeClass: 'bg-primary text-primary-foreground border-0',
    dotClass: 'bg-primary-foreground animate-pulse',
  },
  FAILED: {
    label: 'Échoué',
    badgeClass: 'bg-destructive/15 text-destructive border-0',
    dotClass: 'bg-destructive',
  },
}

function truncateCaption(text: string, max = 80): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

interface PostCardProps {
  post: ScheduledPost
  onClick: () => void
  onDelete: () => void
}

export function PostCard({ post, onClick, onDelete }: PostCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const s = STATUS[post.status]

  const coverImage = post.images?.[0] ?? null
  const imageCount = post.images?.length ?? 0
  const captionDisplay = post.caption ? truncateCaption(post.caption) : null

  return (
    <>
      {/* ── Card principale ── */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        className={cn(
          'group relative flex flex-col',
          'bg-card border border-border rounded-xl overflow-hidden',
          // Hover : élévation subtile
          'hover:shadow-md hover:-translate-y-0.5',
          // Focus clavier : ring visible avec le token ring
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'transition-all duration-200 cursor-pointer',
        )}
      >
        {/* ── Zone image ── */}
        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          {coverImage ? (
            <>
              <Image
                src={coverImage.image_url}
                alt="Aperçu du post"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04] will-change-transform"
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-b from-foreground/20 via-transparent to-foreground/60 pointer-events-none" />
            </>
          ) : (
            // État vide
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border">
                <Images className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Aucune image</p>
            </div>
          )}

          {/* Badge statut — coin supérieur gauche */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1.5 shadow-sm',
                s.badgeClass,
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', s.dotClass)} />
              {s.label}
            </Badge>
          </div>

          {/* Badge multi-images — coin supérieur droit (masqué au hover par le menu ⋮) */}
          {imageCount > 1 && (
            <div className="absolute top-3 right-3 z-10 group-hover:opacity-0 transition-opacity duration-150 flex items-center gap-1 bg-foreground/60 backdrop-blur-sm text-background text-[10px] font-semibold px-2 py-1 rounded-lg">
              <Images className="w-3 h-3" />
              {imageCount}
            </div>
          )}
          <div
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  // foreground/60 au lieu de black/60 → dark mode natif
                  className="h-7 w-7 bg-foreground/60 hover:bg-foreground/80 backdrop-blur-sm text-background rounded-lg border border-background/10 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="w-40 bg-card border-border shadow-md"
              >
                <DropdownMenuItem
                  onClick={onClick}
                  className="text-sm gap-2 cursor-pointer text-foreground focus:bg-accent"
                >
                  <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Corps de la card ── */}
        <div className="p-4 flex flex-col gap-3 flex-1">

          {/* Caption */}
          <p
            className={cn(
              'text-sm leading-relaxed flex-1 line-clamp-3',
              captionDisplay
                ? 'text-card-foreground'
                : 'text-muted-foreground italic',
            )}
          >
            {captionDisplay ?? 'Aucun texte rédigé pour ce post…'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 shrink-0" />
              {post.publish_at ? (
                format(new Date(post.publish_at), 'd MMM yyyy · HH:mm', { locale: fr })
              ) : (
                <span className="text-destructive font-medium">Date non définie</span>
              )}
            </div>

            {/* Compteur d'images — cohérent avec les autres textes xs */}
            {imageCount > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                {imageCount > 1 ? `${imageCount} images` : '1 image'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Dialog de confirmation de suppression ── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-border shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground text-base font-semibold">
              Supprimer ce post ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              Cette action est irréversible. La tâche de publication sera annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring text-sm h-9">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.stopPropagation(); onDelete(); setConfirmDelete(false) }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring text-sm h-9"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}