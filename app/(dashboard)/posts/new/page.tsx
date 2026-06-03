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

const STEPS = [
  { label: 'Cible',     description: 'Page & horaire' },
  { label: 'Caption',   description: 'Texte du post'  },
  { label: 'Image',     description: 'Visuel'          },
  { label: 'Confirmer', description: 'Validation'      },
]

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
      console.log('handleCreateDraft called')

    const created = await createMutation.mutateAsync(data)
    setPost(created)
    setPublishAt(data.publish_at || '')
    setStep(1)
  }

  const handleSaveCaption = async (data: any) => {
    if (!post) return
    // const res = await captionMutation.mutateAsync({ postId: post.id, data })
    // setPost(res.scheduled_post)
    setStep(2)
  }
const handleGenerateCaption = async (data: any) => {
    if (!post) return
    const res = await captionMutation.mutateAsync({ postId: post.id, data })
    setPost(res.scheduled_post)
    return res
  }

  const handleConfirm = async () => {
    if (!post) return
    await confirmMutation.mutateAsync({ postId: post.id, publish_at: publishAt || undefined })
    router.push('/posts')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      {/* ── Header ── */}
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

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground leading-tight tracking-tight">
            Nouveau post
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {STEPS[step].description} · Étape {step + 1}/{STEPS.length}
          </p>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="mb-10" role="navigation" aria-label="Étapes du formulaire">

        {/* Barre segmentée */}
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-[3px] rounded-full transition-all duration-500 ease-out',
                i < step
                  ? 'bg-primary/40'
                  : i === step
                  ? 'bg-primary'
                  : 'bg-border'
              )}
            />
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center transition-all duration-300',
                i === 0 ? 'items-start' : i === STEPS.length - 1 ? 'items-end' : 'items-center'
              )}
            >
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300',
                i === step
                  ? 'text-primary'
                  : i < step
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/40'
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenu des étapes ── */}
      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
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
            onGenerateCaption={handleGenerateCaption}
            
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