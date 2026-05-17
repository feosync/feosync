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
import type { ScheduledPost, FacebookPage } from '@/lib/api/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: ScheduledPost
  page?: FacebookPage
  onConfirm: () => void
  isPending?: boolean
}

export function PublishNowDialog({ open, onOpenChange, post, page, onConfirm, isPending }: Props) {
  const imageCount = post.images?.length ?? 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Publier maintenant ?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-slate-500 dark:text-slate-400">
              <p className="text-[13px]">
                Ce post sera publié immédiatement sur Facebook. Cette action est irréversible.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex gap-2 text-[12px]">
                  <span className="text-slate-400 w-16 flex-shrink-0">Page</span>
                  <span className="text-slate-900 dark:text-white font-medium">
                    {page?.page_name || 'Page Facebook'}
                  </span>
                </div>
                <div className="flex gap-2 text-[12px]">
                  <span className="text-slate-400 w-16 flex-shrink-0">Caption</span>
                  <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    {post.caption || <span className="italic text-slate-400">Aucun caption</span>}
                  </span>
                </div>
                {imageCount > 0 && (
                  <div className="flex gap-2 text-[12px]">
                    <span className="text-slate-400 w-16 flex-shrink-0">Images</span>
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {imageCount} image{imageCount > 1 ? 's' : ''} incluse{imageCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <div className="flex gap-2 text-[12px]">
                  <span className="text-slate-400 w-16 flex-shrink-0">Heure</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {format(new Date(), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
              </div>

              {!post.caption && imageCount === 0 && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <p className="text-[12px]">Ce post n'a ni caption ni image.</p>
                </div>
              )}

              {!post.caption && imageCount > 0 && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <p className="text-[12px]">Ce post n'a pas de caption.</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="border-slate-200 dark:border-slate-700"
            disabled={isPending}
          >
            Annuler
          </AlertDialogCancel>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 gap-2"
          >
            {isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" />Publication...</>
              : <><Send className="w-4 h-4" />Publier maintenant</>
            }
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}