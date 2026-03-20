'use client'

import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  RefreshCw, ExternalLink, Trash2, Loader2,
  ThumbsUp, MessageCircle, Share2, Eye, Users,
  BarChart2, Clock, Globe, Link2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { PublishedPost, ScheduledPost, FacebookPage } from '@/lib/api/types'

interface Props {
  open: boolean
  onClose: () => void
  post: PublishedPost
  scheduledPost?: ScheduledPost
  page?: FacebookPage
  onSyncMetrics: () => void
  onDelete: () => void
  isSyncing?: boolean
  isDeleting?: boolean
}

export function PublishedPostDetailSheet({
  open, onClose,
  post, scheduledPost, page,
  onSyncMetrics, onDelete,
  isSyncing, isDeleting,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const totalReactions = Object.values(scheduledPost as any || {}).length

  return (
    <>
      <Sheet open={open} onOpenChange={o => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto p-0"
        >
          <SheetHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[16px] font-medium text-slate-900 dark:text-white">
                Post publié
              </SheetTitle>
              <div className="flex items-center gap-1 mr-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSyncMetrics}
                  disabled={isSyncing}
                  className="text-[12px] text-slate-500 hover:text-blue-600 gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sync...' : 'Sync métriques'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => setConfirmDelete(true)}
                  title="Supprimer localement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* ── Facebook Post Preview ── */}
          <div className="mx-5 mt-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

            {/* Page header */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-slate-900">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                f
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white">
                  {page?.page_name || 'Page Facebook'}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  {format(new Date(post.published_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  <span>·</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
              {post.post_id && (
                <a
                  href={`https://facebook.com/${post.post_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Caption */}
            {scheduledPost?.caption && (
              <div className="px-4 pb-3 bg-white dark:bg-slate-900">
                <p className="text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {scheduledPost.caption}
                </p>
              </div>
            )}

            {/* Image */}
            {scheduledPost?.image_url && (
              <div className="relative w-full aspect-video">
                <Image
                  src={scheduledPost.image_url}
                  alt="post"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Métriques style Facebook */}
            <div className="bg-white dark:bg-slate-900 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-[12px] text-slate-500 dark:text-slate-400 mb-2.5">
                <div className="flex items-center gap-1">
                  <span className="flex -space-x-1">
                    <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[9px]">👍</span>
                    <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px]">❤️</span>
                  </span>
                  <span className="ml-1">{post.initial_reach} personnes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{post.initial_impressions} impressions</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-around">
                {[
                  { icon: ThumbsUp, label: 'J\'aime' },
                  { icon: MessageCircle, label: 'Commenter' },
                  { icon: Share2, label: 'Partager' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Métriques détaillées ── */}
          <div className="mx-5 mt-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-slate-400" />
              <h3 className="text-[13px] font-medium text-slate-900 dark:text-white">
                Métriques de performance
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard
                icon={Eye}
                label="Portée"
                value={post.initial_reach}
                color="blue"
                description="Personnes ayant vu le post"
              />
              <MetricCard
                icon={Users}
                label="Impressions"
                value={post.initial_impressions}
                color="indigo"
                description="Nombre total d'affichages"
              />
            </div>

            {/* Infos techniques */}
            <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 space-y-2">
              {post.post_id && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">ID Meta</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono truncate">{post.post_id}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[12px]">
                <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500 dark:text-slate-400">Canal</span>
                <span className="text-slate-700 dark:text-slate-300 capitalize">{post.channel}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px]">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500 dark:text-slate-400">Mis à jour</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {format(new Date(post.updated_at), "d MMM yyyy HH:mm", { locale: fr })}
                </span>
              </div>
            </div>

            {post.post_id && (
              <Button
                asChild
                variant="outline"
                className="w-full mt-3 border-slate-200 dark:border-slate-700 gap-2 text-[13px]"
              >
                <a
                  href={`https://facebook.com/${post.post_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir sur Facebook
                </a>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog suppression */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Supprimer ce post ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-[13px]">
              Supprime uniquement l'enregistrement local.
              Le post restera visible sur Facebook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onDelete(); setConfirmDelete(false); onClose() }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {isDeleting
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Suppression...</>
                : 'Supprimer localement'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MetricCard({
  icon: Icon, label, value, color, description
}: {
  icon: any
  label: string
  value: number
  color: 'blue' | 'indigo'
  description: string
}) {
  const colors = {
    blue:  'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
      <div className={`w-7 h-7 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[20px] font-semibold text-slate-900 dark:text-white">
        {value.toLocaleString('fr-FR')}
      </div>
      <div className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{label}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{description}</div>
    </div>
  )
}