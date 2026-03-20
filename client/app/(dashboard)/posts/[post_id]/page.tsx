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

import { PostDetailHeader }   from '@/components/posts/detail/PostDetailHeader'
import { PostPreviewCard }    from '@/components/posts/detail/PostPreviewCard'
import { PostActionsGrid }    from '@/components/posts/detail/PostActionsGrid'
import { PostScheduleCard }   from '@/components/posts/detail/PostScheduleCard'
import { CaptionSheet }       from '@/components/posts/detail/sheets/CaptionSheet'
import { ImageSheet }         from '@/components/posts/detail/sheets/ImageSheet'
import { DateSheet }          from '@/components/posts/detail/sheets/DateSheet'

import {
  useScheduledPost, usePatchCaption, usePatchImage,
  useUploadImage, useConfirmPost, useDeleteScheduledPost
} from '@/hooks/useScheduledPosts'
import { useOrganisations }  from '@/hooks/useOrganisations'
import { useFacebookPages }  from '@/hooks/useFacebookPages'
import type { PostStatus }   from '@/lib/api/types'

import { PublishNowDialog }  from '@/components/posts/detail/PublishNowDialog'
import { usePublishNow }     from '@/hooks/usePublishedPosts'

const canEdit = (status: PostStatus) => status === 'DRAFT' || status === 'SCHEDULED'

export default function PostDetailPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const router = useRouter()

  const { data: orgs  = [] } = useOrganisations()
  const orgId = orgs[0]?.id || ''
  const { data: pages = [] } = useFacebookPages(orgId)
  const { data: post, isLoading } = useScheduledPost(post_id)

  const captionMutation = usePatchCaption(orgId)
  const imageMutation   = usePatchImage(orgId)
  const uploadMutation  = useUploadImage(orgId)
  const confirmMutation = useConfirmPost(orgId)
  const deleteMutation  = useDeleteScheduledPost(orgId)

  const publishNowMutation = usePublishNow(orgId)
  const [publishDialog, setPublishDialog] = useState(false)

  // ── Sheet ──
  const [sheetMode, setSheetMode] = useState<'caption' | 'image' | 'date' | null>(null)
  const closeSheet = () => setSheetMode(null)

  // ── Caption state ──
  const [captionMode, setCaptionMode] = useState<'manual' | 'llm'>('manual')
  const [captionText, setCaptionText] = useState('')
  const [aiTopic, setAiTopic]         = useState('')
  const [aiLang, setAiLang]           = useState('fr')

  // ── Image state ──
  const [imageTab,     setImageTab]     = useState('url')
  const [imageUrl,     setImageUrl]     = useState('')
  const [imageDesc,    setImageDesc]    = useState('')
  const [imageFile,    setImageFile]    = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  // ── Date state ──
  const [newDate, setNewDate] = useState('')

  // ── Delete ──
  const [confirmDelete, setConfirmDelete] = useState(false)

  // ── Open sheet ──
  const openSheet = (mode: 'caption' | 'image' | 'date') => {
    if (mode === 'caption') { setCaptionText(post?.caption || ''); setCaptionMode('manual') }
    if (mode === 'image')   { setImageUrl(post?.image_url || ''); setImagePreview(post?.image_url || ''); setImageFile(null) }
    if (mode === 'date')    { setNewDate(post?.publish_at?.slice(0, 16) || '') }
    setSheetMode(mode)
  }

  // ── Handlers ──
  const handleSaveCaption = async () => {
    if (!post) return
    await captionMutation.mutateAsync({
      postId: post.id,
      data: captionMode === 'manual'
        ? { mode: 'manual', text: captionText }
        : { mode: 'llm', topic: aiTopic, language: aiLang }
    })
    closeSheet()
  }

  const handleSaveImage = async () => {
    if (!post) return
    if (imageTab === 'upload' && imageFile) {
      await uploadMutation.mutateAsync({ postId: post.id, file: imageFile })
    } else if (imageTab === 'url') {
      await imageMutation.mutateAsync({ postId: post.id, data: { mode: 'url', url: imageUrl } })
    } else {
      await imageMutation.mutateAsync({ postId: post.id, data: { mode: 'llm', description: imageDesc } })
    }
    closeSheet()
  }

  const handleConfirm = async () => {
    if (!post) return
    await confirmMutation.mutateAsync({
      postId: post.id,
      publish_at: newDate ? new Date(newDate).toISOString() : post.publish_at || undefined
    })
    closeSheet()
  }

  // DRAFT → juste fermer la sheet, la date sera utilisée au moment de confirmer
  const handleSaveDate = () => {
    toast.success('Date enregistrée')
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

  // ── Loading ──
  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )

  if (!post) return (
    <div className="text-center py-20 text-slate-500 dark:text-slate-400">Post introuvable</div>
  )

  const page     = pages.find(p => p.id === Object.values(post.page_ids || {})[0])
  const editable = canEdit(post.status as PostStatus)

  return (
    <div className="max-w-2xl mx-auto space-y-4">

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
          onConfirm={handleConfirm}
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
        imageTab={imageTab}         setImageTab={setImageTab}
        imageUrl={imageUrl}         setImageUrl={setImageUrl}
        imagePreview={imagePreview} setImagePreview={setImagePreview}
        imageDesc={imageDesc}       setImageDesc={setImageDesc}
        imageFile={imageFile}       setImageFile={setImageFile}
        onSave={handleSaveImage}
        isPending={imageMutation.isPending || uploadMutation.isPending}
      />

      <DateSheet
        open={sheetMode === 'date'}
        onClose={closeSheet}
        status={post.status as PostStatus}
        newDate={newDate}           setNewDate={setNewDate}
        onSave={handleSaveDate}     // DRAFT → local
        onConfirm={handleConfirm}   // SCHEDULED → API
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

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Supprimer ce post ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Cette action est irréversible.
              {post.status === 'SCHEDULED' && ' La tâche Celery planifiée sera annulée.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
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
