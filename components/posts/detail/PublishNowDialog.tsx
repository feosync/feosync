'use client'

import { Loader2, Send, AlertTriangle } from 'lucide-react'
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { ScheduledPost, FacebookPageResponse } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: ScheduledPost
  page?: FacebookPageResponse
  onConfirm: () => void
  isPending?: boolean
}

export function PublishNowDialog({ open, onOpenChange, post, page, onConfirm, isPending }: Props) {
  const imageCount = post.images?.length ?? 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border sm:max-w-md">

        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Publier maintenant ?
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3 text-muted-foreground">

              <p className="text-[13px]">
                Ce post sera publié immédiatement sur Facebook. Cette action est irréversible.
              </p>

              {/* ── Récapitulatif ── */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2 border border-border">

                <div className="flex gap-2 text-[12px]">
                  <span className="text-muted-foreground w-16 flex-shrink-0">Page</span>
                  <span className="text-foreground font-medium">
                    {page?.page_name || 'Page Facebook'}
                  </span>
                </div>

                <div className="flex gap-2 text-[12px]">
                  <span className="text-muted-foreground w-16 flex-shrink-0">Caption</span>
                  <span className="text-foreground/80 line-clamp-2">
                    {post.caption || (
                      <span className="italic text-muted-foreground">Aucun caption</span>
                    )}
                  </span>
                </div>

                {imageCount > 0 && (
                  <div className="flex gap-2 text-[12px]">
                    <span className="text-muted-foreground w-16 flex-shrink-0">Images</span>
                    <span className="text-green-600 dark:[color-scheme:dark]">
                      ✓ {imageCount} image{imageCount > 1 ? 's' : ''} incluse{imageCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 text-[12px]">
                  <span className="text-muted-foreground w-16 flex-shrink-0">Heure</span>
                  <span className="text-foreground/80">
                    {format(new Date(), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>

              </div>

              {/* ── Warnings ── */}
              {(!post.caption && imageCount === 0) && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <p className="text-[12px]">Ce post n'a ni caption ni image.</p>
                </div>
              )}

              {(!post.caption && imageCount > 0) && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <p className="text-[12px]">Ce post n'a pas de caption.</p>
                </div>
              )}

            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-border text-foreground hover:bg-accent"
            disabled={isPending}
          >
            Annuler
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="bg-primary text-primary-foreground border-0 gap-2 font-bold"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Publication...</>
            ) : (
              <><Send className="w-4 h-4" />Publier maintenant</>
            )}
          </Button>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  )
}