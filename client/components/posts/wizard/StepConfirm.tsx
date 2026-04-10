'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Calendar, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { ScheduledPost, FacebookPage } from '@/lib/api/types'

interface StepConfirmProps {
  post: ScheduledPost
  pages: FacebookPage[]
  publishAt: string
  isLoading: boolean
  onConfirm: () => void
  onBack: () => void
}

export function StepConfirm({ post, pages, publishAt, isLoading, onConfirm, onBack }: StepConfirmProps) {
  const page       = pages.find(p => p.id === Object.values(post.page_ids)[0])
  const firstImage = post.images?.[0] ?? null
  const imageCount = post.images?.length ?? 0

  // Au moins caption ou une image
  const canConfirm = !!post.caption || imageCount > 0

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-medium text-slate-900 dark:text-white mb-1">Confirmez la planification</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Vérifiez les détails avant de planifier.</p>
      </div>

      {/* Aperçu */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Header page */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">f</div>
          <div>
            <p className="text-[13px] font-medium text-slate-900 dark:text-white">
              {page?.page_name || 'Page Facebook'}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {publishAt
                ? format(new Date(publishAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })
                : 'Date non définie'
              }
            </p>
          </div>
        </div>

        {/* Image — première du tableau */}
        {firstImage ? (
          <div className="relative h-48">
            <Image src={firstImage.image_url} alt="post" fill className="object-cover" unoptimized />
            {imageCount > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
                +{imageCount - 1} image{imageCount > 2 ? 's' : ''}
              </div>
            )}
          </div>
        ) : (
          <div className="h-24 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-300" />
          </div>
        )}

        {/* Caption */}
        <div className="px-4 py-3">
          <p className={`text-[13px] leading-relaxed ${
            post.caption ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'
          }`}>
            {post.caption || 'Aucun caption'}
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {[
          { label: 'Page Facebook', ok: !!page,         value: page?.page_name || '—' },
          { label: 'Caption',       ok: !!post.caption, value: post.caption ? `${post.caption.length} caractères` : 'Non défini' },
          { label: 'Images',        ok: imageCount > 0, value: imageCount > 0 ? `${imageCount} image${imageCount > 1 ? 's' : ''}` : 'Aucune' },
          { label: 'Date',          ok: !!publishAt,    value: publishAt || 'Non définie' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between text-[13px]">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                item.ok ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {item.ok ? '✓' : '–'}
              </div>
              <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-[12px] truncate max-w-[180px]">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {!canConfirm && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-[12px] text-amber-700 dark:text-amber-400">
          ⚠️ Un caption ou au moins une image est requis pour planifier le post.
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onBack} className="border-slate-200 dark:border-slate-700">
          ← Retour
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!canConfirm || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Planifier le post
        </Button>
      </div>
    </div>
  )
}