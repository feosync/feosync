import { Calendar, FileText, CheckCircle2, XCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PostStatus } from '@/lib/api/types'

const CONFIG: Record<string, { icon: any; title: string; desc: string }> = {
  all:       { icon: FileText,     title: 'Aucun post',           desc: 'Créez votre premier post pour commencer à publier.' },
  DRAFT:     { icon: FileText,     title: 'Aucun brouillon',      desc: 'Les brouillons en cours apparaîtront ici.' },
  SCHEDULED: { icon: Calendar,     title: 'Aucun post planifié',  desc: 'Planifiez vos posts pour les publier automatiquement.' },
  PUBLISHED: { icon: CheckCircle2, title: 'Aucun post publié',    desc: 'Les posts publiés apparaîtront ici.' },
  FAILED:    { icon: XCircle,      title: 'Aucun post échoué',    desc: 'Aucune publication n\'a échoué.' },
}

export function EmptyState({
  status,
  onCreateClick,
}: {
  status: PostStatus | 'all'
  onCreateClick: () => void
}) {
  const c = CONFIG[status] || CONFIG.all
  const Icon = c.icon

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{c.title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center max-w-xs">{c.desc}</p>
      {(status === 'all' || status === 'DRAFT' || status === 'SCHEDULED') && (
        <Button onClick={onCreateClick} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> Nouveau post
        </Button>
      )}
    </div>
  )
}