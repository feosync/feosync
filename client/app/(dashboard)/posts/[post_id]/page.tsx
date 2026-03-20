'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, ImageIcon, Send,
  Edit3, Loader2, ToggleLeft, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  useScheduledPost, usePatchCaption,
  usePatchImage, useConfirmPost, useDeleteScheduledPost
} from '@/hooks/useScheduledPosts'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { PostStatus } from '@/lib/api/types'

const STATUS: Record<PostStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Brouillon',  className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0' },
  SCHEDULED: { label: 'Planifié',   className: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0' },
  PUBLISHED: { label: 'Publié',     className: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0' },
  FAILED:    { label: 'Échoué',     className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-0' },
}

export default function PostDetailPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const router = useRouter()

  const { data: orgs = [] }  = useOrganisations()
  const orgId = orgs[0]?.id || ''
  const { data: pages = [] } = useFacebookPages(orgId)

  const { data: post, isLoading } = useScheduledPost(post_id)

  const captionMutation = usePatchCaption(orgId)
  const imageMutation   = usePatchImage(orgId)
  const confirmMutation = useConfirmPost(orgId)
  const deleteMutation  = useDeleteScheduledPost(orgId)

  const [editCaption, setEditCaption]   = useState(false)
  const [captionText, setCaptionText]   = useState('')
  const [editDate, setEditDate]         = useState(false)
  const [newDate, setNewDate]           = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )

  if (!post) return (
    <div className="text-center py-20 text-slate-500">Post introuvable</div>
  )

  const page = pages.find(p => p.id === Object.values(post.page_ids || {})[0])
  const s = STATUS[post.status as PostStatus]

  const handleSaveCaption = async () => {
    await captionMutation.mutateAsync({
      postId: post.id,
      data: { mode: 'manual', text: captionText }
    })
    setEditCaption(false)
  }

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync({
      postId: post.id,
      publish_at: newDate || post.publish_at || undefined
    })
    setEditDate(false)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(post.id)
    router.push('/posts')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/posts')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-medium text-slate-900 dark:text-white">Détail du post</h1>
              <Badge className={s.className}>{s.label}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Créé le {format(new Date(post.created_at), 'd MMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-[13px]"
          onClick={() => setConfirmDelete(true)}
        >
          Supprimer
        </Button>
      </div>

      {/* Aperçu Buffer-style */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Page header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">f</div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-slate-900 dark:text-white">
              {page?.page_name || 'Page Facebook'}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.publish_at
                ? format(new Date(post.publish_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })
                : 'Date non définie'
              }
            </p>
          </div>
          {post.status === 'DRAFT' && (
            <Button
              variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600"
              onClick={() => { setEditDate(true); setNewDate(post.publish_at || '') }}
              title="Modifier la date"
            >
              <Calendar className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Image */}
        {post.image_url ? (
          <div className="relative h-56 group">
            <Image src={post.image_url} alt="post" fill className="object-cover" unoptimized />
            {post.status === 'DRAFT' && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 text-[12px]">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Changer l'image
                </Button>
              </div>
            )}
          </div>
        ) : (
          post.status === 'DRAFT' && (
            <div className="h-24 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" className="text-slate-400 text-[12px] gap-1.5">
                <ImageIcon className="w-4 h-4" /> Ajouter une image
              </Button>
            </div>
          )
        )}

        {/* Caption */}
        <div className="px-4 py-4">
          {editCaption ? (
            <div className="space-y-2">
              <textarea
                value={captionText}
                onChange={e => setCaptionText(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditCaption(false)} className="text-[12px]">
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveCaption}
                  disabled={captionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[12px]"
                >
                  {captionMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <div className="group flex items-start gap-2">
              <p className={`flex-1 text-[13px] leading-relaxed ${
                post.caption
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'text-slate-400 italic'
              }`}>
                {post.caption || 'Aucun caption rédigé...'}
              </p>
              {post.status === 'DRAFT' && (
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 flex-shrink-0"
                  onClick={() => { setEditCaption(true); setCaptionText(post.caption || '') }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions selon status */}
      {post.status === 'DRAFT' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h3 className="text-[13px] font-medium text-slate-900 dark:text-white mb-3">
            Planifier ce post
          </h3>
          {editDate && (
            <div className="mb-3 space-y-1.5">
              <label className="text-[12px] text-slate-500">Date de publication</label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <Button
            onClick={handleConfirm}
            disabled={!post.caption || confirmMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {confirmMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Planification...</>
              : <><Send className="w-4 h-4" /> Planifier le post</>
            }
          </Button>
          {!post.caption && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 text-center">
              ⚠️ Ajoutez un caption avant de planifier
            </p>
          )}
        </div>
      )}

      {/* Dialog suppression */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">Supprimer ce post ?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Cette action est irréversible.{post.status === 'SCHEDULED' && ' La tâche planifiée sera annulée.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
