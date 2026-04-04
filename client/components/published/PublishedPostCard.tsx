'use client'

import { RefreshCw, ExternalLink, Eye, Users, Images, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { PublishedPost, ScheduledPost, FacebookPage, AutoCommentRequest } from '@/lib/api/types'
import { AutoCommentPopover } from '@/components/published/AutoCommentPopover'

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
  post, scheduledPost, page,
  onSyncMetrics, isSyncing,
  onAutoComment, isAutoCommenting,
  onClick,
}: Props) {
  const coverImage = scheduledPost?.images?.[0] ?? null
  const imageCount = scheduledPost?.images?.length ?? post.image_count ?? 0
  const permalink  = post.meta_permalink ?? (post.post_id ? `https://facebook.com/${post.post_id}` : null)

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm transition-all"
    >
      <div className="flex gap-4 p-4">

        {/* Thumbnail */}
        <div className="relative w-20 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
          {coverImage ? (
            <>
              <Image src={coverImage.image_url} alt="post" fill className="object-cover" unoptimized />
              {imageCount > 1 && (
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded-full">
                  <Images className="w-2.5 h-2.5" />{imageCount}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">f</div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">f</div>
              <span className="text-[13px] font-medium text-slate-900 dark:text-white">
                {page?.page_name || 'Page Facebook'}
              </span>
            </div>
            <span className="text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-full font-medium">
              Publié
            </span>
          </div>

          {scheduledPost?.caption && (
            <p className="text-[12px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {scheduledPost.caption}
            </p>
          )}

          <p className="text-[11px] text-slate-400">
            {format(new Date(post.published_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </p>

          <div className="flex items-center gap-3 pt-0.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Eye className="w-3 h-3" />{post.initial_reach.toLocaleString('fr-FR')}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Users className="w-3 h-3" />{post.initial_impressions.toLocaleString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          

           <AutoCommentPopover
            post={post}
            onSave={onAutoComment}
            isPending={isAutoCommenting}
            variant="icon"
          />
          
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            onClick={onSyncMetrics}
            disabled={isSyncing}
            title="Sync métriques"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>

         

          {permalink && (
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              asChild title="Voir sur Facebook"
            >
              <a href={permalink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}

        </div>
      </div>
    </div>
  )
}