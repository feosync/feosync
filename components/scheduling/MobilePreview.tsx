'use client'

import { cn } from '@/lib/utils'
import { Smartphone } from 'lucide-react'

interface MobilePreviewProps {
  mediaUrl: string
  isVideo: boolean
  caption?: string
  hashtags?: string[]
  linkUrl?: string
  variant?: 'reel' | 'story'
}

export function MobilePreview({
  mediaUrl,
  isVideo,
  caption,
  hashtags,
  linkUrl,
  variant = 'reel',
}: MobilePreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[280px]">
        <div className={cn(
          'relative overflow-hidden bg-black',
          variant === 'story'
            ? 'aspect-[9/16] rounded-[2.5rem] border-4 border-border shadow-2xl'
            : 'aspect-[9/16] rounded-[2.5rem] border-4 border-border shadow-2xl',
        )}>
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-28 h-6 bg-black rounded-b-2xl flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-border" />
            <div className="w-16 h-1.5 rounded-full bg-muted" />
          </div>

          {/* Media */}
          {isVideo ? (
            <video
              src={mediaUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient overlay for text readability */}
          {(caption || hashtags?.length) && variant === 'reel' && (
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
          )}

          {/* Reel caption + hashtags */}
          {variant === 'reel' && (caption || hashtags?.length) && (
            <div className="absolute bottom-0 inset-x-0 p-4 z-10 space-y-1.5">
              {caption && (
                <p className="text-white text-xs leading-relaxed line-clamp-3">
                  {caption}
                </p>
              )}
              {hashtags && hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-primary text-[10px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Story link swipe-up */}
          {variant === 'story' && linkUrl && (
            <div className="absolute bottom-4 inset-x-4 z-10">
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="text-white text-[10px] truncate">{linkUrl}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
