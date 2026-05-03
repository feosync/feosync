import { Type, Image as ImageIcon, Zap, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { AiGeneration } from '@/lib/api/types'

interface AiHistoryRowProps {
  gen: AiGeneration
}

export function AiHistoryRow({ gen }: AiHistoryRowProps) {
  const isCaption = gen.generation_type === 'caption'

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Type icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isCaption
          ? 'bg-blue-50 dark:bg-blue-950/50'
          : 'bg-purple-50 dark:bg-purple-950/50'
      }`}>
        {isCaption
          ? <Type      className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          : <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        }
      </div>

      {/* Label + caption preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-slate-900 dark:text-white capitalize">
            {isCaption ? 'Caption' : 'Image'}
          </span>
          
        </div>
        {gen.caption && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
            {gen.caption}
          </p>
        )}
      </div>

      {/* Tokens + date */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Zap className="w-3 h-3" />
          {gen.tokens_used.toLocaleString('fr-FR')}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          {format(new Date(gen.created_at), 'd MMM HH:mm', { locale: fr })}
        </div>
      </div>
    </div>
  )
}