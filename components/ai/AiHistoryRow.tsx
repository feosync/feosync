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
          : 'bg-accent/10'
      }`}>
        {isCaption
          ? <Type      className="w-4 h-4 text-primary" />
          : <ImageIcon className="w-4 h-4 text-accent-foreground" />
        }
      </div>

      {/* Label + caption preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground capitalize">
            {isCaption ? 'Caption' : 'Image'}
          </span>
          
        </div>
        {gen.caption && (
          <p className="text-[12px] text-muted-foreground truncate">
            {gen.caption}
          </p>
        )}
      </div>

      {/* Tokens + date */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Zap className="w-3 h-3" />
          {gen.tokens_used.toLocaleString('fr-FR')}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          {format(new Date(gen.created_at), 'd MMM HH:mm', { locale: fr })}
        </div>
      </div>
    </div>
  )
}