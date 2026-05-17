import { Button } from '@/components/ui/button'
import {
  Trash2, ToggleLeft, ToggleRight, RefreshCw, BarChart2, ChevronUp,
} from 'lucide-react'
import type { FacebookPage } from '@/lib/api/types'

interface Props {
  page: FacebookPage
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
      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={onToggleInsights}
        title="Voir les insights"
      >
        {insightsExpanded
          ? <ChevronUp className="w-3.5 h-3.5" />
          : <BarChart2 className="w-3.5 h-3.5" />}
      </Button>

      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={onSyncInsights}
        disabled={isSyncing}
        title="Synchroniser"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
      </Button>

      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={onToggle}
        disabled={isToggling}
        title={page.is_active ? 'Désactiver' : 'Activer'}
      >
        {page.is_active
          ? <ToggleRight className="w-4 h-4 text-green-600" />
          : <ToggleLeft className="w-4 h-4" />}
      </Button>

      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        onClick={onDelete}
        disabled={isDeleting}
        title="Déconnecter"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}