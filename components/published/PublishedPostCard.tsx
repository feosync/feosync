'use client'

import { RefreshCw, ExternalLink, Eye, Users, Heart, MessageCircle, Images, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { PublishedPost, ScheduledPost, FacebookPage, AutoCommentRequest } from '@/lib/api/types'
import { AutoCommentPopover } from '@/components/published/AutoCommentPopover'
import { cn } from '@/lib/utils'

interface Props {
  post: PublishedPost
  scheduledPost?: ScheduledPost
  page?: FacebookPage
  onSyncMetrics: () => void
  isSyncing?: boolean
  onAutoComment: (payload: AutoCommentRequest) => void
  isAutoCommenting?: boolean
  onClick: () => void
}

export function PublishedPostCard({
  post,
  scheduledPost,
  page,
  onSyncMetrics,
  isSyncing,
  onAutoComment,
  isAutoCommenting,
  onClick,
}: Props) {
  const coverImage = scheduledPost?.images?.[0] ?? null
  const imageCount = scheduledPost?.images?.length ?? post.image_count ?? 0
  const permalink = post.meta_permalink ?? (post.post_id ? `https://facebook.com/${post.post_id}` : null)

  return (
    <div
      onClick={onClick}
      className="group relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
    >
      {/* Image Area */}
      <div className="relative w-full aspect-4/4 bg-slate-950 overflow-hidden">
        {coverImage ? (
          <>
            <Image
              src={coverImage.image_url}
              alt="Publication"
              fill
              className="object-cover transition-all duration-700 group-hover:scale-[1.06]"
              unoptimized
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

            {/* Multi-image indicator */}
            {imageCount > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-xl z-10">
                <Images className="w-3.5 h-3.5" />
                {imageCount}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <div className="w-20 h-20 rounded-2xl bg-[#1877F2] flex items-center justify-center text-white text-6xl font-bold shadow-inner" style={{ fontFamily: 'Georgia, serif' }}>
              f
            </div>
          </div>
        )}

        {/* Hover Actions (top right) */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 z-20">
          <div onClick={(e) => e.stopPropagation()}>
            <AutoCommentPopover
              post={post}
              onSave={onAutoComment}
              isPending={isAutoCommenting}
              variant="icon"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white"
            onClick={(e) => { e.stopPropagation(); onSyncMetrics() }}
            disabled={isSyncing}
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          </Button>

          {permalink && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a href={permalink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 pb-4 space-y-4">
        {/* Header: Page + Status + Date */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#1877F2] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-inner" style={{ fontFamily: 'Georgia, serif' }}>
              f
            </div>
            <div>
              <p className="font-semibold text-white text-[15px] leading-tight truncate max-w-[180px]">
                {page?.page_name || 'Page Facebook'}
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Publié
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <p>{format(new Date(post.published_at), "d MMM yyyy", { locale: fr })}</p>
            <p className="text-[10px] mt-0.5">
              {format(new Date(post.published_at), "HH:mm", { locale: fr })}
            </p>
          </div>
        </div>

        {/* Caption */}
        {scheduledPost?.caption && (
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed min-h-[42px]">
            {scheduledPost.caption}
          </p>
        )}

        {/* Stats & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Eye className="w-4 h-4" />
              <span className="tabular-nums font-medium">{post.initial_reach.toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="tabular-nums font-medium">{post.initial_impressions.toLocaleString('fr-FR')}</span>
            </div>
          </div>

          {/* Engagement + Voir button */}
          <div className="flex items-center gap-1">

            <button
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-4 py-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
            >
              <Eye className="w-4 h-4" />
              Voir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}