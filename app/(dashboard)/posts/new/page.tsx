'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import {
  useCreateScheduledPost,
  usePatchCaption,
  useConfirmPost,
} from '@/hooks/useScheduledPosts'
import { StepTarget }  from '@/components/posts/wizard/StepTarget'
import { StepCaption } from '@/components/posts/wizard/StepCaption'
import { StepImage }   from '@/components/posts/wizard/StepImage'
import { StepConfirm } from '@/components/posts/wizard/StepConfirm'
import type { ScheduledPost } from '@/lib/api/types'

const STEPS = ['Cible', 'Caption', 'Image', 'Confirmer']

export default function NewPostPage() {
  const router = useRouter()
  const [step, setStep]           = useState(0)
  const [post, setPost]           = useState<ScheduledPost | null>(null)
  const [publishAt, setPublishAt] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const { data: orgData }  = useOrganisations({ page: 1, page_size: 10 })
  const organisations      = orgData?.items ?? []
  const orgId              = selectedOrgId || organisations[0]?.id || ''
  const { data: pages = [], isLoading: pagesLoading } = useFacebookPages(orgId)

  const createMutation  = useCreateScheduledPost()
  const captionMutation = usePatchCaption(orgId)
  const confirmMutation = useConfirmPost(orgId)

  const handleCreateDraft = async (data: {
    organization_id: string
    facebook_page_id: string
    publish_at?: string
  }) => {
    const created = await createMutation.mutateAsync(data)
    setPost(created)
    setPublishAt(data.publish_at || '')
    setStep(1)
  }

  const handleSaveCaption = async (data: any) => {
    if (!post) return
    const res = await captionMutation.mutateAsync({ postId: post.id, data })
    setPost(res.scheduled_post)
    setStep(2)
  }

  const handleConfirm = async () => {
    if (!post) return
    await confirmMutation.mutateAsync({ postId: post.id, publish_at: publishAt || undefined })
    router.push('/posts')
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-lg"
          onClick={() => router.push('/posts')}
          aria-label="Retour aux posts"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-foreground leading-none">
            Nouveau post
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Étape {step + 1} sur {STEPS.length}
          </p>
        </div>
      </div>

      {/* ── Stepper minimaliste ──
           Approche : labels simples + barre de progression segmentée.
           Pas de bulles, pas de cercles — juste du texte + des lignes.
           La lisibilité vient de la typographie, pas des formes. ── */}
      <div className="mb-8">
        {/* Labels */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          {STEPS.map((label, i) => (
            <span
              key={i}
              className={cn(
                'text-[11px] font-medium tracking-wide uppercase transition-colors duration-300',
                i === step
                  ? 'text-primary'
                  : i < step
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50',
              )}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Barre de progression segmentée */}
        <div className="flex items-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-0.5 rounded-full transition-all duration-500',
                i <= step ? 'bg-primary' : 'bg-border',
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Conteneur des étapes ── */}
      <div>
        {step === 0 && (
          <StepTarget
            pages={pages}
            isLoading={createMutation.isPending || pagesLoading}
            onOrgChange={setSelectedOrgId}
            onNext={handleCreateDraft}
          />
        )}
        {step === 1 && post && (
          <StepCaption
            post={post}
            isLoading={captionMutation.isPending}
            onNext={handleSaveCaption}
            onBack={() => setStep(0)}
            onSkip={() => setStep(2)}
          />
        )}
        {step === 2 && post && (
          <StepImage
            post={post}
            orgId={orgId}
            onImageAdded={setPost}
            onImageRemoved={setPost}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && post && (
          <StepConfirm
            post={post}
            pages={pages}
            publishAt={publishAt}
            isLoading={confirmMutation.isPending}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
          />
        )}
      </div>

    </div>
  )
}