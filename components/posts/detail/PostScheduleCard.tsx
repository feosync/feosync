'use client'

import { Send, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ScheduledPost } from '@/lib/api/types'

interface Props {
  post: ScheduledPost
  onConfirm: () => void
  onAddCaption: () => void
  onAddImage: () => void
  onAddDate: () => void
  isPending?: boolean
}

export function PostScheduleCard({
  post, onConfirm, onAddCaption, onAddImage, onAddDate, isPending
}: Props) {
  const items = [
    { label: 'Caption', ok: !!post.caption,          action: onAddCaption, optional: false },
    { label: 'Image',   ok: post.images?.length > 0, action: onAddImage,   optional: true  },
    { label: 'Date',    ok: !!post.publish_at,        action: onAddDate,    optional: false },
  ]

  const canConfirm = !!post.caption && !!post.publish_at

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-slate-900 dark:text-white">Prêt à planifier ?</h3>
        {!post.caption && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400">⚠️ Caption manquant</span>
        )}
      </div>

      <div className="space-y-1.5">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                item.ok
                  ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {item.ok ? <Check className="w-2.5 h-2.5" /> : <span className="text-[9px]">–</span>}
              </div>
              <span className="text-[13px] text-slate-600 dark:text-slate-400">
                {item.label}
                {item.optional && <span className="text-[11px] text-slate-400 ml-1">(optionnel)</span>}
              </span>
            </div>
            {!item.ok && (
              <button onClick={item.action} className="text-[11px] text-blue-600 hover:underline">
                Ajouter
              </button>
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={() => {
          if (!post.publish_at) { onAddDate(); return }
          onConfirm()
        }}
        disabled={!canConfirm || isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
      >
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" />Planification...</>
          : <><Send className="w-4 h-4" />Planifier le post</>
        }
      </Button>
    </div>
  )
}