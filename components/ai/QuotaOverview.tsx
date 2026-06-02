import { Type, Image as ImageIcon, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { QuotaCard } from './QuotaCard'
import type { AiQuota } from '@/lib/api/types'

interface QuotaOverviewProps {
  quota: AiQuota | undefined
  isLoading: boolean
}

export function QuotaOverview({ quota, isLoading }: QuotaOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
      </div>
    )
  }

  if (!quota) return null

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <QuotaCard
          icon={Type}
          label="Captions générés"
          used={quota.caption_count}
          limit={quota.caption_limit}
          remaining={quota.caption_remaining}
          color="blue"
        />
        <QuotaCard
          icon={ImageIcon}
          label="Images générées"
          used={quota.image_count}
          limit={quota.image_limit}
          remaining={quota.image_remaining}
          color="indigo"
        />
      </div>

      {/* Total tokens banner */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Total tokens utilisés
          </span>
        </div>
        <span className="text-lg font-semibold text-foreground">
          {quota.total_tokens.toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  )
}