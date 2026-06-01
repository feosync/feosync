'use client'

import { useState } from 'react'
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
  Bot, ChevronUp, ChevronDown,
} from 'lucide-react'
import { Label }    from '@/components/ui/label'
import { Switch }   from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import type { PublishedPost, ScheduledPost, FacebookPage, AutoCommentRequest } from '@/lib/api/types'

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
  const [imgIndex, setImgIndex]           = useState(0)
  const [autoEnabled, setAutoEnabled]     = useState(post.is_auto_comment)
  const [instructions, setInstructions]   = useState(post.instructions ?? '')
  const [keywords, setKeywords]           = useState(post.keywords ?? '')
  const [showFields, setShowFields]       = useState(!!(post.instructions || post.keywords))
  const [autoChanged, setAutoChanged]     = useState(false)

  const images    = scheduledPost?.images ?? []
  const hasImages = images.length > 0
  const permalink = post.meta_permalink ?? (post.post_id ? `https://facebook.com/${post.post_id}` : null)

  const prevImg = () => setImgIndex(i => Math.max(0, i - 1))
  const nextImg = () => setImgIndex(i => Math.min(images.length - 1, i + 1))

  const handleAutoToggle = (v: boolean) => { setAutoEnabled(v); setAutoChanged(true) }
  const handleAutoSave = () => {
    onAutoComment({
      is_auto_comment: autoEnabled,
      instructions: instructions.trim() || null,
      keywords: keywords.trim() || null,
    })
    setAutoChanged(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={o => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-card border-border overflow-y-auto p-0"
        >
          <SheetHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[16px] font-medium text-foreground">
                Post publié
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

            {/* Page header */}
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
              {/* ✅ Correctif : balise <a> complète */}
              {permalink && (
                 <a  href={permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Caption */}
            {scheduledPost?.caption && (
              <div className="px-4 pb-3 bg-card">
                <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {scheduledPost.caption}
                </p>
              </div>
            )}

            {/* Images — carousel */}
            {hasImages && (
              <div className="relative w-full aspect-video bg-muted">
                <Image
                  src={images[imgIndex].image_url}
                  alt={`image ${imgIndex + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
                  {images[imgIndex].image_source}
                </div>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      disabled={imgIndex === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 disabled:opacity-30 rounded-full text-white flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextImg}
                      disabled={imgIndex === images.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 disabled:opacity-30 rounded-full text-white flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Images className="w-3 h-3" />
                      {imgIndex + 1}/{images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Métriques style Facebook */}
            <div className="bg-card px-4 py-2.5 border-t border-border">
              <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-2.5">
                <div className="flex items-center gap-1">
                  <span className="flex -space-x-1">
                    {/* Couleurs de marque Facebook — intentionnellement hors tokens */}
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

          {/* ── Métriques détaillées ── */}
          <div className="mx-5 mt-4 mb-6 space-y-3">

            {/* Auto-commentaire */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* ✅ dark: supprimés — violet = couleur fonctionnelle unique */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    autoEnabled
                      ? 'bg-violet-500/15 text-violet-500'
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
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-violet-500 transition-colors"
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
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white text-[12px]"
                >
                  {isAutoCommenting ? 'Sauvegarde…' : 'Enregistrer'}
                </Button>
              )}
            </div>

            {/* Header métriques */}
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-[13px] font-medium text-foreground">Métriques de performance</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MetricCard icon={Eye}   label="Portée"      value={post.initial_reach}      color="blue"   description="Personnes ayant vu le post" />
              <MetricCard icon={Users} label="Impressions" value={post.initial_impressions} color="indigo" description="Nombre total d'affichages" />
            </div>

            {/* Infos techniques */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 border border-border">
              {post.image_count > 0 && (
                <div className="flex items-center gap-2 text-[12px]">
                  <Images className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Images publiées</span>
                  <span className="text-foreground">{post.image_count}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-[12px]">
                <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Canal</span>
                <span className="text-foreground capitalize">{post.channel}</span>
              </div>
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

      {/* ── Confirm delete ── */}
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

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, color, description }: {
  icon: React.ElementType
  label: string
  value: number
  color: 'blue' | 'indigo'
  description: string
}) {
  // ✅ indigo → primary/5 pour éviter le fond quasi-invisible de bg-secondary en light
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