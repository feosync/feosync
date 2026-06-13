'use client'

import { useState, useMemo } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
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
  BarChart2, Clock, Globe, Images, ChevronLeft, ChevronRight,
  Bot, ChevronUp, ChevronDown, Play, FileText, ImageIcon, Video,
} from 'lucide-react'
import { Label }    from '@/components/ui/label'
import { Switch }   from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { isVideoUrl } from '@/lib/media'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import type {
  PublishedPost, ScheduledPost, FacebookPage, AutoCommentRequest, ImageSource,
} from '@/lib/api/types'

type PostType = 'video' | 'image' | 'carousel' | 'text'

interface MediaItem {
  url: string
  type: 'video' | 'image'
  index: number
}

function getMediaItems(post: PublishedPost, scheduledPost?: ScheduledPost): MediaItem[] {
  const urls = post.media_urls ?? []
  const scheduledImages = scheduledPost?.images ?? []
  const combined = [...urls, ...scheduledImages.map(i => i.image_url)].filter(Boolean)

  if (combined.length === 0) return []

  return combined.map((url, i) => ({
    url,
    type: isVideoUrl(url) ? 'video' as const : 'image' as const,
    index: i,
  }))
}

function detectType(items: MediaItem[], post: PublishedPost): PostType {
  if (post.post_type === 'video' || post.post_type === 'reel') return 'video'
  if (items.length === 0) return 'text'

  const hasVideo = items.some(i => i.type === 'video')
  const imageCount = items.filter(i => i.type === 'image').length

  if (hasVideo) return 'video'
  if (imageCount > 1) return 'carousel'
  if (imageCount === 1) return 'image'
  if (items.length > 0) return 'video'

  return 'text'
}

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
  onAutoComment: (payload: AutoCommentRequest) => void
  isAutoCommenting?: boolean
}

export function PublishedPostDetailSheet({
  open, onClose,
  post, scheduledPost, page,
  onSyncMetrics, onDelete,
  isSyncing, isDeleting,
  onAutoComment, isAutoCommenting,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [mediaIndex, setMediaIndex]       = useState(0)
  const [autoEnabled, setAutoEnabled]     = useState(post.is_auto_comment)
  const [instructions, setInstructions]   = useState(post.instructions ?? '')
  const [keywords, setKeywords]           = useState(post.keywords ?? '')
  const [showFields, setShowFields]       = useState(!!(post.instructions || post.keywords))
  const [autoChanged, setAutoChanged]     = useState(false)

  const mediaItems = useMemo(() => getMediaItems(post, scheduledPost), [post, scheduledPost])
  const type = detectType(mediaItems, post)
  const current = mediaItems[mediaIndex]
  const permalink = post.meta_permalink ?? (post.post_id ? `https://facebook.com/${post.post_id}` : null)

  const prev = () => setMediaIndex(i => Math.max(0, i - 1))
  const next = () => setMediaIndex(i => Math.min(mediaItems.length - 1, i + 1))

  const hasMultiple = mediaItems.length > 1
  const imageCount = mediaItems.filter(i => i.type === 'image').length
  const videoCount = mediaItems.filter(i => i.type === 'video').length

  const handleAutoToggle = (v: boolean) => { setAutoEnabled(v); setAutoChanged(true) }
  const handleAutoSave = () => {
    onAutoComment({
      is_auto_comment: autoEnabled,
      instructions: instructions.trim() || null,
      keywords: keywords.trim() || null,
    })
    setAutoChanged(false)
  }

  const typeLabel = type === 'video'
    ? `${videoCount > 0 ? videoCount + ' vidéo' : ''}${videoCount > 0 && imageCount > 0 ? ' + ' : ''}${imageCount > 0 ? imageCount + ' photo' : ''}`.trim() || 'Vidéo'
    : type === 'carousel' ? `${imageCount} photo${imageCount > 1 ? 's' : ''}`
    : type === 'image' ? 'Photo'
    : 'Texte'

  return (
    <>
      <Sheet open={open} onOpenChange={o => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-card border-border overflow-y-auto p-0"
        >
          <SheetHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[16px] font-medium text-foreground flex items-center gap-2">
                Post publié
                <span className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                  type === 'video' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
                  type === 'carousel' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                  type === 'image' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                  type === 'text' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                )}>
                  {type === 'video' && <Video className="w-2.5 h-2.5" />}
                  {type === 'carousel' && <Images className="w-2.5 h-2.5" />}
                  {type === 'image' && <ImageIcon className="w-2.5 h-2.5" />}
                  {type === 'text' && <FileText className="w-2.5 h-2.5" />}
                  {typeLabel}
                </span>
              </SheetTitle>
              <div className="flex items-center gap-1 mr-6">
                <Button
                  variant="ghost" size="sm"
                  onClick={onSyncMetrics}
                  disabled={isSyncing}
                  className="text-[12px] text-muted-foreground hover:text-primary gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sync...' : 'Sync métriques'}
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* ── Facebook Post Preview ── */}
          <div className="mx-5 mt-4 rounded-xl border border-border overflow-hidden">

            <div className="flex items-center gap-2.5 px-4 py-3 bg-card">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                f
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">
                  {page?.page_name || 'Page Facebook'}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {format(new Date(post.published_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  <span>·</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
              {permalink && (
                 <a href={permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {scheduledPost?.caption && (
              <div className="px-4 pb-3 bg-card">
                <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {scheduledPost.caption}
                </p>
              </div>
            )}

            {/* Media — mixed content (video + images) */}
            {current && (
              <div className="relative w-full aspect-video bg-muted">
                {current.type === 'video' ? (
                  <VideoPlayer src={current.url} className="absolute inset-0 w-full h-full" />
                ) : (
                  <Image
                    src={current.url}
                    alt={`media ${current.index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}

                {hasMultiple && (
                  <>
                    <button
                      onClick={prev}
                      disabled={mediaIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 disabled:opacity-30 rounded-full text-white flex items-center justify-center z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={next}
                      disabled={mediaIndex === mediaItems.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 disabled:opacity-30 rounded-full text-white flex items-center justify-center z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1 z-10">
                      {current.type === 'video' ? <Play className="w-3 h-3" /> : <Images className="w-3 h-3" />}
                      {mediaIndex + 1}/{mediaItems.length}
                    </div>
                  </>
                )}

                {current.type === 'image' && !hasMultiple && (
                  <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded uppercase tracking-wide z-10">
                    {post.post_type === 'story' ? 'Story' : 'Photo'}
                  </div>
                )}
              </div>
            )}

            {/* Text-only placeholder */}
            {mediaItems.length === 0 && type === 'text' && (
              <div className="w-full min-h-[120px] bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center px-6 py-8">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-[12px] text-muted-foreground">Post textuel</p>
                </div>
              </div>
            )}

            {/* Metrics bar */}
            <div className="bg-card px-4 py-2.5 border-t border-border">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-2.5">
                <div className="flex items-center gap-1">
                  <span className="flex -space-x-1">
                    <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[9px]">👍</span>
                    <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px]">❤️</span>
                  </span>
                  <span className="ml-1">{post.initial_reach.toLocaleString('fr-FR')} personnes</span>
                </div>
                <span>{post.initial_impressions.toLocaleString('fr-FR')} impressions</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-around">
                {[
                  { icon: ThumbsUp,      label: "J'aime"    },
                  { icon: MessageCircle, label: 'Commenter' },
                  { icon: Share2,        label: 'Partager'  },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[12px] text-muted-foreground hover:bg-accent transition-colors"
                  >
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Auto-comment & Details ── */}
          <div className="mx-5 mt-4 mb-6 space-y-3">

            <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    autoEnabled
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Auto-commentaire</p>
                    <p className="text-[11px] text-muted-foreground">L'IA répond aux commentaires</p>
                  </div>
                </div>
                <Switch checked={autoEnabled} onCheckedChange={handleAutoToggle} />
              </div>

              {autoEnabled && (
                <div className="space-y-2.5 pt-1">
                  <button
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowFields(v => !v)}
                  >
                    {showFields ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showFields ? 'Masquer les options' : 'Personnaliser (optionnel)'}
                  </button>
                  {showFields && (
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Instructions</Label>
                        <Textarea
                          value={instructions}
                          onChange={e => { setInstructions(e.target.value); setAutoChanged(true) }}
                          placeholder="Ex : Réponds de manière professionnelle et chaleureuse…"
                          className="text-[12px] min-h-[72px] resize-none bg-background"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Mots-clés</Label>
                        <Textarea
                          value={keywords}
                          onChange={e => { setKeywords(e.target.value); setAutoChanged(true) }}
                          placeholder="Ex : engagement, communauté, fidélité"
                          className="text-[12px] min-h-[48px] resize-none bg-background"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {autoChanged && (
                <Button
                  size="sm"
                  onClick={handleAutoSave}
                  disabled={isAutoCommenting}
                  className="w-full text-[12px]"
                >
                  {isAutoCommenting ? 'Sauvegarde…' : 'Enregistrer'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-[13px] font-medium text-foreground">Métriques de performance</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard icon={Eye}   label="Portée"      value={post.initial_reach}      color="blue"   description="Personnes ayant vu le post" />
              <MetricCard icon={Users} label="Impressions" value={post.initial_impressions} color="indigo" description="Nombre total d'affichages" />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2 border border-border">
              {mediaItems.length > 0 && (
                <div className="flex items-center gap-2 text-[12px]">
                  {imageCount > 0 && (
                    <>
                      <Images className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Images</span>
                      <span className="text-foreground">{imageCount}</span>
                    </>
                  )}
                  {videoCount > 0 && (
                    <span className="text-muted-foreground ml-2">
                      · <Video className="w-3 h-3 inline" /> {videoCount} vidéo{videoCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-[12px]">
                <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Canal</span>
                <span className="text-foreground capitalize">{post.channel}</span>
              </div>
              {post.post_type && (
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 text-[10px]">#</span>
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-foreground capitalize">{post.post_type}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[12px]">
                <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Mis à jour</span>
                <span className="text-foreground">
                  {format(new Date(post.updated_at), "d MMM yyyy HH:mm", { locale: fr })}
                </span>
              </div>
            </div>

            {permalink && (
              <Button
                asChild variant="outline"
                className="w-full border-border gap-2 text-[13px] hover:bg-accent"
              >
                <a href={permalink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir sur Facebook
                </a>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Supprimer ce post ?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-[13px]">
              Supprime uniquement l'enregistrement local. Le post restera visible sur Facebook.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-accent">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { onDelete(); setConfirmDelete(false); onClose() }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0"
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

function MetricCard({ icon: Icon, label, value, color, description }: {
  icon: React.ElementType
  label: string
  value: number
  color: 'blue' | 'indigo'
  description: string
}) {
  const iconClass = {
    blue:   'bg-primary/10 text-primary',
    indigo: 'bg-primary/5 text-primary',
  }

  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <div className={`w-7 h-7 rounded-lg ${iconClass[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[20px] font-semibold text-foreground">
        {value.toLocaleString('fr-FR')}
      </div>
      <div className="text-[12px] font-medium text-foreground/80">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
    </div>
  )
}
