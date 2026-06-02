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
        <BarChart2 className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">
          Historique des générations
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : !history?.length ? (
        <div className="py-12 text-center bg-muted/50 rounded-xl border border-dashed border-border">
          <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucune génération pour le moment
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {history.map((gen) => (
            <AiHistoryRow key={gen.id} gen={gen} />
          ))}
        </div>
      )}
    </div>
  )
}