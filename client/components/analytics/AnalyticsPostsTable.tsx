'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePostsWithReactions } from '@/hooks/useAnalytics'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const REACTION_EMOJI: Record<string, string> = {
  like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😠', care: '🤗',
}

const fmt = (n: number) => n.toLocaleString('fr-FR')

interface Props {
  fbModelId: string
  orgId: string
}

export function AnalyticsPostsTable({ fbModelId, orgId }: Props) {
  const [after, setAfter] = useState<string | undefined>()
  const [history, setHistory] = useState<string[]>([])

  const { data, isLoading } = usePostsWithReactions(fbModelId, orgId, {
    limit: 10,
    after,
  })

  const handleNext = () => {
    if (data?.pagination.after) {
      setHistory(h => [...h, after ?? ''])
      setAfter(data.pagination.after)
    }
  }

  const handlePrev = () => {
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setAfter(prev || undefined)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-slate-900 dark:text-white">
          Posts et réactions
        </h2>
        <span className="text-[12px] text-slate-400">{data?.data.length ?? 0} posts</span>
      </div>

      {isLoading ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {Array.from({ length: 5 }, (_, i) => i).map(i => (
            <div key={i} className="px-4 py-3 flex gap-3">
              <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !data?.data.length ? (
        <div className="px-4 py-12 text-center text-[13px] text-slate-400">
          Aucun post trouvé
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.data.map(post => (
              <div key={post.post_id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  f
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-800 dark:text-slate-200 line-clamp-1">
                    {post.message || '—'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {format(new Date(post.created_time), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  {Object.entries(post.reactions)
                    .filter(([, v]) => v > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([k, v]) => (
                      <span key={k} className="flex items-center gap-1 text-[12px] text-slate-600 dark:text-slate-400">
                        <span>{REACTION_EMOJI[k] ?? k}</span>
                        <span className="font-medium">{fmt(v)}</span>
                      </span>
                    ))}
                  <span className="text-[11px] text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2 ml-1">
                    {fmt(post.total_reactions)} total
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination curseur */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Button
              size="sm" variant="outline" className="h-7 text-xs gap-1"
              onClick={handlePrev}
              disabled={history.length === 0}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Précédent
            </Button>
            <Button
              size="sm" variant="outline" className="h-7 text-xs gap-1"
              onClick={handleNext}
              disabled={!data.pagination.has_next}
            >
              Suivant <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}