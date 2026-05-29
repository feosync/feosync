import { Button } from '@/components/ui/button'
import {
  Trash2, ToggleLeft, ToggleRight, RefreshCw, BarChart2, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FacebookPageResponse } from '@/lib/api/types'

interface Props {
  page: FacebookPageResponse
  insightsExpanded: boolean
  onToggleInsights: () => void
  onToggle: () => void
  onDelete: () => void
  onSyncInsights: () => void
  isToggling?: boolean
  isDeleting?: boolean
  isSyncing?: boolean
}

export function PageRowActions({
  page, insightsExpanded,
  onToggleInsights, onToggle, onDelete, onSyncInsights,
  isToggling, isDeleting, isSyncing,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      {/* Insights */}
      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground
                   hover:text-primary hover:bg-primary/10
                   transition-colors"
        onClick={onToggleInsights}
        title="Voir les insights"
      >
        {insightsExpanded
          ? <ChevronUp className="w-3.5 h-3.5" />
          : <BarChart2 className="w-3.5 h-3.5" />}
      </Button>

      {/* Sync */}
      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground
                   hover:text-primary hover:bg-primary/10
                   transition-colors disabled:opacity-50"
        onClick={onSyncInsights}
        disabled={isSyncing}
        title="Synchroniser"
      >
        <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
      </Button>

      {/* Toggle actif/inactif */}
      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground
                   hover:bg-primary/10 transition-colors
                   disabled:opacity-50"
        onClick={onToggle}
        disabled={isToggling}
        title={page.is_active ? 'Désactiver' : 'Activer'}
      >
        {page.is_active
          ? <ToggleRight className="w-4 h-4 text-emerald-500" />
          : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
      </Button>

      {/* Supprimer */}
      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground
                   hover:text-destructive hover:bg-destructive/10
                   transition-colors disabled:opacity-50"
        onClick={onDelete}
        disabled={isDeleting}
        title="Déconnecter"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}