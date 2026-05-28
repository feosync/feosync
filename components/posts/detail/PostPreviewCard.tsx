'use client'

import { Calendar, Clock, Edit3, ImageIcon, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { ScheduledPost, FacebookPageResponse } from '@/lib/api/types'

interface Props {
  post: ScheduledPost
  page?: FacebookPageResponse
  editable: boolean
  onEditCaption: () => void
  onEditImage: () => void
  onEditDate: () => void
}

export function PostPreviewCard({
  post, page, editable, onEditCaption, onEditImage, onEditDate
}: Props) {
  const firstImage = post.images?.[0] ?? null
  const imageCount = post.images?.length ?? 0

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* Page header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          f
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-slate-900 dark:text-white truncate">
            {page?.page_name || 'Page Facebook'}
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.publish_at
              ? format(new Date(post.publish_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })
              : 'Date non définie'
            }
          </p>
        </div>
        {editable && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[12px] text-slate-500 hover:text-blue-600 gap-1.5 flex-shrink-0"
            onClick={onEditDate}
          >
            <Calendar className="w-3.5 h-3.5" />
            {post.publish_at ? 'Modifier' : 'Définir une date'}
          </Button>
        )}
      </div>

      {/* Image */}
      {firstImage ? (
        <div className="relative h-56 group">
          <Image src={firstImage.image_url} alt="post" fill className="object-cover" unoptimized />
          {imageCount > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
              +{imageCount - 1} image{imageCount > 2 ? 's' : ''}
            </div>
          )}
          {editable && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                size="sm"
                className="bg-white/95 text-slate-900 hover:bg-white text-[12px] shadow-lg"
                onClick={onEditImage}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Gérer les images
              </Button>
            </div>
          )}
        </div>
      ) : editable ? (
        <button
          onClick={onEditImage}
          className="w-full h-24 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-[13px]">Ajouter une image</span>
        </button>
      ) : null}

      {/* Caption */}
      <div className="px-4 py-4">
        <div className="group flex items-start gap-2">
          <p className={`flex-1 text-[13px] leading-relaxed whitespace-pre-wrap ${
            post.caption
              ? 'text-slate-800 dark:text-slate-200'
              : 'text-slate-400 italic'
          }`}>
            {post.caption || 'Aucun caption rédigé...'}
          </p>
          {editable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 flex-shrink-0"
              onClick={onEditCaption}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}