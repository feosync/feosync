'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import {
  useCreateScheduledPost,
  usePatchCaption,
  usePatchImage,
  useUploadImage,
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
  const [step, setStep] = useState(0)
  const [post, setPost] = useState<ScheduledPost | null>(null)
  const [publishAt, setPublishAt] = useState('')

  
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  // Chargement des organisations
  const { data: orgData } = useOrganisations({ page: 1, page_size: 10 })
  const organisations = orgData?.items ?? []

  const orgId = selectedOrgId || organisations[0]?.id || ''
  const { data: pages = [], isLoading: pagesLoading } = useFacebookPages(orgId)

  const createMutation  = useCreateScheduledPost()
  const captionMutation = usePatchCaption(orgId)
  const imageMutation   = usePatchImage(orgId)
  const uploadMutation  = useUploadImage(orgId)
  const confirmMutation = useConfirmPost(orgId)

  const handleCreateDraft = async (data: { 
      organization_id: string; 
      facebook_page_id: string; 
      publish_at?: string 
    }) => {
      const created = await createMutation.mutateAsync({
        ...data,
      })
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

  const handleSaveImage = async (data: any, file?: File) => {
    if (!post) return
    if (file) {
      const res = await uploadMutation.mutateAsync({ postId: post.id, file })
      setPost(res.scheduled_post)
    } else {
      const res = await imageMutation.mutateAsync({ postId: post.id, data })
      setPost(res.scheduled_post)
    }
    setStep(3)
  }

  const handleConfirm = async () => {
    if (!post) return
    await confirmMutation.mutateAsync({ postId: post.id, publish_at: publishAt || undefined })
    router.push('/posts')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/posts')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-[18px] font-medium text-slate-900 dark:text-white">Nouveau post</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Étape {step + 1} sur {STEPS.length}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-6">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium transition-all',
                i < step  ? 'bg-blue-600 text-white' :
                i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950' :
                             'bg-slate-100 dark:bg-slate-800 text-slate-400'
              )}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn(
                'text-[13px] hidden sm:block',
                i === step ? 'text-blue-600 font-medium' : 'text-slate-400'
              )}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-3 transition-colors',
                i < step ? 'bg-blue-300 dark:bg-blue-700' : 'bg-slate-200 dark:bg-slate-800'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
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
          />
        )}
        {step === 2 && post && (
          <StepImage
            post={post}
            isLoading={imageMutation.isPending || uploadMutation.isPending}
            onNext={handleSaveImage}
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