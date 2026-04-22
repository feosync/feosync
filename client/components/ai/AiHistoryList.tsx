import { Sparkles, BarChart2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { AiHistoryRow } from './AiHistoryRow'
import type { AiGeneration } from '@/lib/api/types'

interface AiHistoryListProps {
  history: AiGeneration[] | undefined
  isLoading: boolean
}

export function AiHistoryList({ history, isLoading }: AiHistoryListProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-slate-400" />
        <h3 className="text-[14px] font-medium text-slate-900 dark:text-white">
          Historique des générations
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : !history?.length ? (
        <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aucune génération pour le moment
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {history.map((gen) => (
            <AiHistoryRow key={gen.id} gen={gen} />
          ))}
        </div>
      )}
    </div>
  )
}