'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { PostStatus, ScheduledPost } from '@/lib/api/types'

const STATUS: Record<PostStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Brouillon', className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0' },
  SCHEDULED: { label: 'Planifié',  className: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0' },
  PUBLISHED: { label: 'Publié',    className: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0' },
  FAILED:    { label: 'Échoué',    className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-0' },
}

interface Props {
  post: ScheduledPost
  onBack: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export function PostDetailHeader({ post, onBack, onDelete, isDeleting }: Props) {
  const s = STATUS[post.status as PostStatus]

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-medium text-slate-900 dark:text-white">
              Détail du post
            </h1>
            <Badge className={s.className}>{s.label}</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Créé le {format(new Date(post.created_at), 'd MMM yyyy', { locale: fr })}
          </p>
        </div>
      </div>

      {post.status !== 'PUBLISHED' && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-[13px]"
          onClick={onDelete}
          disabled={isDeleting}
        >
          Supprimer
        </Button>
      )}
    </div>
  )
}