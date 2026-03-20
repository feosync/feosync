'use client'

import { useState } from 'react'
import { MoreVertical, Trash2, Eye, Calendar, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { ScheduledPost, PostStatus } from '@/lib/api/types'

const STATUS: Record<PostStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Brouillon',  className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0' },
  SCHEDULED: { label: 'Planifié',   className: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0' },
  PUBLISHED: { label: 'Publié',     className: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0' },
  FAILED:    { label: 'Échoué',     className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-0' },
}

interface PostCardProps {
  post: ScheduledPost
  onClick: () => void
  onDelete: () => void
}

export function PostCard({ post, onClick, onDelete }: PostCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const s = STATUS[post.status]

  return (
    <>
      <div
        className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all cursor-pointer"
        onClick={onClick}
      >
        {/* Image preview */}
        <div className="relative h-36 bg-slate-100 dark:bg-slate-800">
          {post.image_url ? (
            <Image src={post.image_url} alt="post" fill className="object-cover" unoptimized />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-1.5 text-slate-400">
              <ImageIcon className="w-8 h-8 opacity-40" />
              <span className="text-xs">Aucune image</span>
            </div>
          )}
          {/* Status badge flottant */}
          <div className="absolute top-2 left-2">
            <Badge className={s.className}>{s.label}</Badge>
          </div>
          {/* Actions menu */}
          <div
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900">
                <DropdownMenuItem onClick={onClick}>
                  <Eye className="w-3.5 h-3.5 mr-2" /> Voir / Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Body */}
        <div className="p-3.5">
          <p className={`text-[13px] line-clamp-2 min-h-[38px] mb-3 leading-relaxed ${
            post.caption
              ? 'text-slate-800 dark:text-slate-200'
              : 'text-slate-400 italic'
          }`}>
            {post.caption || 'Aucun caption rédigé...'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              {post.publish_at ? (
                <>
                  <Calendar className="w-3 h-3" />
                  {format(new Date(post.publish_at), 'd MMM à HH:mm', { locale: fr })}
                </>
              ) : (
                <span className="text-slate-400">Pas de date</span>
              )}
            </div>
            {/* Indicateur source image */}
            {post.image_source && (
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                {post.image_source}
              </span>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Supprimer ce post ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Cette action est irréversible. Si le post est planifié, la tâche Celery sera annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onDelete(); setConfirmDelete(false) }}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}