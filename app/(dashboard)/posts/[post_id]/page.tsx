'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { PostDetailHeader }  from '@/components/posts/detail/PostDetailHeader'
import { PostPreviewCard }   from '@/components/posts/detail/PostPreviewCard'
import { PostActionsGrid }   from '@/components/posts/detail/PostActionsGrid'
import { PostScheduleCard }  from '@/components/posts/detail/PostScheduleCard'
import { CaptionSheet }      from '@/components/posts/detail/sheets/CaptionSheet'
import { ImageSheet }        from '@/components/posts/detail/sheets/ImageSheet'
import { DateSheet }         from '@/components/posts/detail/sheets/DateSheet'
import { PublishNowDialog }  from '@/components/posts/detail/PublishNowDialog'

import {
  useScheduledPost, usePatchCaption,
  useConfirmPost, useDeleteScheduledPost,
} from '@/hooks/useScheduledPosts'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { usePublishNow }    from '@/hooks/usePublishedPosts'
import type { PostStatus }  from '@/lib/api/types'

const canEdit = (status: PostStatus) => status === 'DRAFT' || status === 'SCHEDULED'

export default function PostDetailPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const router = useRouter()

  const { data: post, isLoading } = useScheduledPost(post_id)

  const orgId = post?.organisation_id || ''
  const { data: pages = [] } = useFacebookPages(orgId)

  const captionMutation    = usePatchCaption(orgId)
  const confirmMutation    = useConfirmPost(orgId)
  const deleteMutation     = useDeleteScheduledPost(orgId)
  const publishNowMutation = usePublishNow(orgId)

  const [sheetMode, setSheetMode] = useState<'caption' | 'image' | 'date' | null>(null)
  const closeSheet = () => setSheetMode(null)

  const [captionMode, setCaptionMode] = useState<'manual' | 'llm'>('manual')
  const [captionText, setCaptionText] = useState('')
  const [aiTopic, setAiTopic]         = useState('')
  const [aiLang, setAiLang]           = useState('fr')

  const [newDate, setNewDate] = useState('')

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [publishDialog, setPublishDialog] = useState(false)

  const openSheet = (mode: 'caption' | 'image' | 'date') => {
    if (mode === 'caption') { setCaptionText(post?.caption || ''); setCaptionMode('manual') }
    if (mode === 'date')    { setNewDate(post?.publish_at?.slice(0, 16) || '') }
    setSheetMode(mode)
  }

  const handleSaveCaption = async () => {
    if (!post) return
    await captionMutation.mutateAsync({
      postId: post.id,
      data: captionMode === 'manual'
        ? { mode: 'manual', text: captionText }
        : { mode: 'llm', topic: aiTopic, language: aiLang },
    })
    closeSheet()
  }

  const handleSaveDate = (utcIso: string) => {
    if (utcIso) setNewDate(utcIso)
    toast.success('Date enregistrée')
    closeSheet()
  }

  const handleConfirm = async (utcIso?: string) => {
    if (!post) return
    await confirmMutation.mutateAsync({
      postId: post.id,
      publish_at: utcIso || post.publish_at || undefined,
    })
    closeSheet()
  }

  const handleDelete = async () => {
    if (!post) return
    await deleteMutation.mutateAsync(post.id)
    router.push('/posts')
  }

  const handlePublishNow = async () => {
    if (!post) return
    await publishNowMutation.mutateAsync(post.id)
    setPublishDialog(false)
    router.push('/published')
  }

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 px-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )

  if (!post) return (
    <div className="text-center py-20 text-muted-foreground">
      Post introuvable
    </div>
  )

  const page     = pages.find(p => p.id === Object.values(post.page_ids || {})[0])
  const editable = canEdit(post.status as PostStatus)

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4">
      <PostDetailHeader
        post={post}
        onBack={() => router.push('/posts')}
        onDelete={() => setConfirmDelete(true)}
        onPublishNow={() => setPublishDialog(true)}
        isDeleting={deleteMutation.isPending}
      />

      <PostPreviewCard
        post={post}
        page={page}
        editable={editable}
        onEditCaption={() => openSheet('caption')}
        onEditImage={()   => openSheet('image')}
        onEditDate={() => openSheet('date')}
      />

      {editable && (
        <PostActionsGrid
          onEditCaption={() => openSheet('caption')}
          onEditImage={()   => openSheet('image')}
          onEditDate={() => openSheet('date')}
        />
      )}

      {post.status === 'DRAFT' && (
        <PostScheduleCard
          post={post}
          onConfirm={() => handleConfirm()}
          onAddCaption={() => openSheet('caption')}
          onAddImage={()   => openSheet('image')}
          onAddDate={() => openSheet('date')}
          isPending={confirmMutation.isPending}
        />
      )}

      <CaptionSheet
        open={sheetMode === 'caption'}
        onClose={closeSheet}
        captionMode={captionMode}   setCaptionMode={setCaptionMode}
        captionText={captionText}   setCaptionText={setCaptionText}
        aiTopic={aiTopic}           setAiTopic={setAiTopic}
        aiLang={aiLang}             setAiLang={setAiLang}
        onSave={handleSaveCaption}
        isPending={captionMutation.isPending}
      />

      <ImageSheet
        open={sheetMode === 'image'}
        onClose={closeSheet}
        post={post}
        orgId={orgId}
      />

      <DateSheet
        open={sheetMode === 'date'}
        onClose={closeSheet}
        status={post.status as PostStatus}
        newDate={newDate}         setNewDate={setNewDate}
        onSave={handleSaveDate}
        onConfirm={handleConfirm}
        isPending={confirmMutation.isPending}
      />

      <PublishNowDialog
        open={publishDialog}
        onOpenChange={setPublishDialog}
        post={post}
        page={page}
        onConfirm={handlePublishNow}
        isPending={publishNowMutation.isPending}
      />

      {/* ── AlertDialog suppression ─────────────────────────────────────── */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card text-card-foreground border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Supprimer ce post ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action est irréversible.
              {post.status === 'SCHEDULED' && ' La tâche Celery planifiée sera annulée.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none border-0 transition-colors"
            >
              {deleteMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Suppression...</>
                : 'Supprimer'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}