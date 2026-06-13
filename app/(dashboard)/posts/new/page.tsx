'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Film, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'

const OPTIONS = [
  {
    id: 'classic',
    label: 'Post classique',
    desc: 'Image(s) + caption pour votre page Facebook',
    icon: FileText,
    href: '/posts/new/classic',
  },
  {
    id: 'reel',
    label: 'Reel',
    desc: 'Vidéo courte (max 500MB) pour booster l\'engagement',
    icon: Film,
    href: '/posts/new/reel',
  },
  {
    id: 'story',
    label: 'Story',
    desc: 'Image ou vidéo éphémère (max 15MB, 24h)',
    icon: Image,
    href: '/posts/new/story',
  },
]

export default function NewPostSelectorPage() {
  const router = useRouter()

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-start gap-3 mb-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mt-0.5 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => router.push('/posts')}
          aria-label="Retour aux posts"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-tight tracking-tight">
            Nouvelle publication
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choisissez le type de contenu à publier
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon
          return (
            <button
              key={opt.id}
              onClick={() => router.push(opt.href)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.98] text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
