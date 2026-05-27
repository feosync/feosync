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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { ScheduledPost, PostStatus } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const STATUS: Record<PostStatus, { label: string; className: string; dotColor: string }> = {
  DRAFT: {
    label: 'Brouillon',
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    dotColor: 'bg-slate-500',
  },
  SCHEDULED: {
    label: 'Planifié',
    className: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-500',
  },
  PUBLISHED: {
    label: 'Publié',
    className: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500',
  },
  FAILED: {
    label: 'Échoué',
    className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    dotColor: 'bg-red-500',
  },
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

  return (
    <>
      <div
        onClick={onClick}
        className="group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
      >
        {/* Image Area */}
        <div className="relative w-full aspect-6/4 bg-slate-950 overflow-hidden">
          {coverImage ? (
            <>
              <Image
                src={coverImage.image_url}
                alt="Post"
                fill
                className="object-cover transition-all duration-700 group-hover:scale-[1.06]"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
            </>
          ) : (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
              <div className="text-center">
                <Images className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                <p className="text-sm text-slate-500">Aucune image</p>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge
              className={cn(
                "font-medium text-xs px-3 py-1 border-0 shadow-sm flex items-center gap-1.5",
                s.className
              )}
            >
              <span className={`w-2 h-2 rounded-full ${s.dotColor} animate-pulse`} />
              {s.label}
            </Badge>
          </div>

          {/* Multi-image badge */}
          {imageCount > 1 && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-2xl">
              <Images className="w-3.5 h-3.5" />
              {imageCount}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              className="bg-white text-slate-900 hover:bg-white/90 px-6 py-2.5 rounded-2xl font-semibold shadow-lg flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir / Modifier
            </Button>
          </div>

          {/* Top Right Actions */}
          <div
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-xl"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 text-slate-200">
                <DropdownMenuItem onClick={onClick} className="cursor-pointer">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          {/* Caption */}
          <p
            className={`text-sm leading-relaxed line-clamp-3 min-h-[66px] ${
              post.caption
                ? 'text-slate-200'
                : 'text-slate-500 italic'
            }`}
          >
            {post.caption || 'Aucun texte rédigé pour ce post...'}
          </p>

          {/* Footer Info */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {post.publish_at ? (
                format(new Date(post.publish_at), 'd MMM yyyy • HH:mm', { locale: fr })
              ) : (
                <span className="text-amber-400">Date non définie</span>
              )}
            </div>

            {coverImage && (
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                {imageCount > 1 ? `${imageCount} images` : 'Image unique'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Supprimer ce post planifié ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Cette action est irréversible. La tâche de publication sera annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete()
                setConfirmDelete(false)
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Oui, supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}