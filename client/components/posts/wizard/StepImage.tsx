'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Upload, Link as LinkIcon, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { ScheduledPost } from '@/lib/api/types'

interface StepImageProps {
  post: ScheduledPost
  isLoading: boolean
  onNext: (data: any, file?: File) => void
  onBack: () => void
}

type ImageMode = 'url' | 'upload' | 'llm'

export function StepImage({ post, isLoading, onNext, onBack }: StepImageProps) {
  const [mode, setMode]         = useState<ImageMode>('url')
  const [url, setUrl]           = useState(post.image_url || '')
  const [description, setDesc]  = useState('')
  const [file, setFile]         = useState<File | null>(null)
  const [preview, setPreview]   = useState<string>(post.image_url || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleNext = () => {
    if (mode === 'upload' && file) {
      onNext({}, file)
    } else if (mode === 'url') {
      onNext({ mode: 'url', url })
    } else {
      onNext({ mode: 'llm', description })
    }
  }

  const canProceed = (
    (mode === 'url'    && url.trim()) ||
    (mode === 'upload' && file)       ||
    (mode === 'llm'    && description.trim())
  )

  const MODES: { value: ImageMode; label: string; icon: any }[] = [
    { value: 'url',    label: 'URL',       icon: LinkIcon    },
    { value: 'upload', label: 'Uploader',  icon: Upload      },
    { value: 'llm',    label: 'IA',        icon: Sparkles    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-medium text-slate-900 dark:text-white mb-1">Ajoutez une image</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Optionnel — vous pouvez ignorer cette étape.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[13px] rounded-md transition-colors ${
              mode === m.value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode content */}
      {mode === 'url' && (
        <input
          value={url}
          onChange={e => { setUrl(e.target.value); setPreview(e.target.value) }}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {mode === 'upload' && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-[13px] text-slate-500">
              {file ? file.name : 'Cliquez ou glissez une image ici'}
            </p>
          </div>
        </div>
      )}

      {mode === 'llm' && (
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Ex: Photo professionnelle d'un bureau moderne, lumière naturelle, style minimaliste"
            rows={3}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onBack} className="border-slate-200 dark:border-slate-700">
          ← Retour
        </Button>
        <Button
          variant="outline"
          onClick={() => onNext({ mode: 'url', url: '' })}
          className="border-slate-200 dark:border-slate-700 text-slate-500"
        >
          Ignorer
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? (mode === 'llm' ? 'Génération...' : 'Upload...') : 'Enregistrer →'}
        </Button>
      </div>
    </div>
  )
}