'use client'

import { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  src: string
  poster?: string | null
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
}

export function VideoPlayer({
  src, poster, className,
  autoPlay = false, muted: initiallyMuted = false,
  loop = false, controls: showControls = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(autoPlay)
  const [muted, setMuted] = useState(initiallyMuted)
  const [progress, setProgress] = useState(0)

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
  }

  const handleEnded = () => setPlaying(false)

  return (
    <div className={cn('relative group overflow-hidden bg-black', className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={(e) => togglePlay(e)}
      />

      {showControls && (
        <>
          {!playing && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
              onClick={(e) => togglePlay(e)}
            >
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-foreground ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-1 bg-white/30 cursor-pointer">
              <div
                className="h-full bg-white transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
              <button onClick={(e) => { e.stopPropagation(); togglePlay() }} className="text-white hover:text-white/80 transition-colors">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMuted(v => !v) }} className="text-white hover:text-white/80 transition-colors">
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-white/80 text-[11px] font-mono flex-1 text-right">
                {formatTime(videoRef.current?.currentTime)} / {formatTime(videoRef.current?.duration)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); videoRef.current?.requestFullscreen() }}
                className="text-white hover:text-white/80 transition-colors"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function formatTime(seconds: number | undefined): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
