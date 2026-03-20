'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Calendar, ImageIcon, Send, Edit3,
  Loader2, RefreshCw, Sparkles, Link as LinkIcon,
  Upload, X, Check, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@/components/ui/sheet'
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useScheduledPost, usePatchCaption, usePatchImage,
  useUploadImage, useConfirmPost, useDeleteScheduledPost
} from '@/hooks/useScheduledPosts'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import { toast } from 'sonner'
import type { PostStatus } from '@/lib/api/types'

const STATUS: Record<PostStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Brouillon', className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0' },
  SCHEDULED: { label: 'Planifié',  className: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-0' },
  PUBLISHED: { label: 'Publié',    className: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-0' },
  FAILED:    { label: 'Échoué',    className: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-0' },
}

const canEdit = (status: PostStatus) => status === 'DRAFT' || status === 'SCHEDULED'

export default function PostDetailPage() {
  const { post_id } = useParams<{ post_id: string }>()
  const router = useRouter()

  const { data: orgs = [] }  = useOrganisations()
  const orgId = orgs[0]?.id || ''
  const { data: pages = [] } = useFacebookPages(orgId)
  const { data: post, isLoading } = useScheduledPost(post_id)

  const captionMutation = usePatchCaption(orgId)
  const imageMutation   = usePatchImage(orgId)
  const uploadMutation  = useUploadImage(orgId)
  const confirmMutation = useConfirmPost(orgId)
  const deleteMutation  = useDeleteScheduledPost(orgId)

  // Sheet states
  const [sheetMode, setSheetMode] = useState<'caption' | 'image' | 'date' | null>(null)

  // Caption state
  const [captionMode, setCaptionMode] = useState<'manual' | 'llm'>('manual')
  const [captionText, setCaptionText] = useState('')
  const [aiTopic, setAiTopic]         = useState('')
  const [aiLang, setAiLang]           = useState('fr')

  // Image state
  const [imageTab, setImageTab]     = useState('url')
  const [imageUrl, setImageUrl]     = useState('')
  const [imageDesc, setImageDesc]   = useState('')
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Date state
  const [newDate, setNewDate] = useState('')

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const openSheet = (mode: 'caption' | 'image' | 'date') => {
    if (mode === 'caption') {
      setCaptionText(post?.caption || '')
      setCaptionMode('manual')
    }
    if (mode === 'image') {
      setImageUrl(post?.image_url || '')
      setImagePreview(post?.image_url || '')
      setImageFile(null)
    }
    if (mode === 'date') {
      setNewDate(post?.publish_at?.slice(0, 16) || '')
    }
    setSheetMode(mode)
  }

  const closeSheet = () => setSheetMode(null)

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  const handleDelete = async () => {
    if (!post) return
    await deleteMutation.mutateAsync(post.id)
    router.push('/posts')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  // ── Loading ────────────────────────────────────────────────────────────────

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

  const page = pages.find(p => p.id === Object.values(post.page_ids || {})[0])
  const s    = STATUS[post.status as PostStatus]
  const editable = canEdit(post.status as PostStatus)

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/posts')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-medium text-slate-900 dark:text-white">Détail du post</h1>
              <Badge className={s.className}>{s.label}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Créé le {format(new Date(post.created_at), 'd MMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost" size="sm"
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950 text-[13px]"
          onClick={() => setConfirmDelete(true)}
        >
          Supprimer
        </Button>
      </div>

      {/* ── Aperçu Facebook-style ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* Page header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">f</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-900 dark:text-white truncate">
              {page?.page_name || 'Page Facebook'}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.publish_at
                ? format(new Date(post.publish_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })
                : 'Date non définie'
              }
            </p>
          </div>
          {editable && (
            <Button
              variant="ghost" size="sm"
              className="text-[12px] text-slate-500 hover:text-blue-600 gap-1.5 flex-shrink-0"
              onClick={() => openSheet('date')}
            >
              <Calendar className="w-3.5 h-3.5" />
              {post.publish_at ? 'Modifier' : 'Définir une date'}
            </Button>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          {post.image_url ? (
            <div className="relative h-56 group">
              <Image src={post.image_url} alt="post" fill className="object-cover" unoptimized />
              {editable && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    className="bg-white/95 text-slate-900 hover:bg-white text-[12px] shadow-lg"
                    onClick={() => openSheet('image')}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Changer l'image
                  </Button>
                </div>
              )}
            </div>
          ) : editable ? (
            <button
              onClick={() => openSheet('image')}
              className="w-full h-24 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[13px]">Ajouter une image</span>
            </button>
          ) : null}
        </div>

        {/* Caption */}
        <div className="px-4 py-4">
          <div className="group flex items-start gap-2">
            <p className={`flex-1 text-[13px] leading-relaxed whitespace-pre-wrap ${
              post.caption
                ? 'text-slate-800 dark:text-slate-200'
                : 'text-slate-400 italic'
            }`}>
              {post.caption || 'Aucun caption rédigé...'}
            </p>
            {editable && (
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600 flex-shrink-0"
                onClick={() => openSheet('caption')}
                title="Modifier le caption"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions rapides ── */}
      {editable && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => openSheet('caption')}
            className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
          >
            <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            <span className="text-[12px] text-slate-600 dark:text-slate-400 group-hover:text-blue-600">Caption</span>
          </button>
          <button
            onClick={() => openSheet('image')}
            className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
          >
            <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            <span className="text-[12px] text-slate-600 dark:text-slate-400 group-hover:text-blue-600">Image</span>
          </button>
          <button
            onClick={() => openSheet('date')}
            className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
          >
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            <span className="text-[12px] text-slate-600 dark:text-slate-400 group-hover:text-blue-600">Date</span>
          </button>
        </div>
      )}

      {/* ── Planifier (DRAFT only) ── */}
      {post.status === 'DRAFT' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium text-slate-900 dark:text-white">
              Prêt à planifier ?
            </h3>
            {!post.caption && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400">
                ⚠️ Caption manquant
              </span>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-1.5">
            {[
              { label: 'Caption',  ok: !!post.caption,   action: () => openSheet('caption') },
              { label: 'Image',    ok: !!post.image_url, action: () => openSheet('image'),  optional: true },
              { label: 'Date',     ok: !!post.publish_at, action: () => openSheet('date') },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    item.ok
                      ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {item.ok ? <Check className="w-2.5 h-2.5" /> : '–'}
                  </div>
                  <span className="text-[13px] text-slate-600 dark:text-slate-400">
                    {item.label}
                    {item.optional && <span className="text-[11px] text-slate-400 ml-1">(optionnel)</span>}
                  </span>
                </div>
                {!item.ok && (
                  <button
                    onClick={item.action}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={() => {
              if (!post.publish_at) { openSheet('date'); return }
              handleConfirm()
            }}
            disabled={!post.caption || confirmMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {confirmMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Planification...</>
              : <><Send className="w-4 h-4" /> Planifier le post</>
            }
          </Button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SHEET — Caption
      ══════════════════════════════════════════════════════════════════════ */}
      <Sheet open={sheetMode === 'caption'} onOpenChange={open => !open && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-slate-900 dark:text-white">Modifier le caption</SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              Rédigez manuellement ou laissez l'IA générer pour vous.
            </SheetDescription>
          </SheetHeader>

          {/* Tabs manuel / IA */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
            {(['manual', 'llm'] as const).map(m => (
              <button
                key={m}
                onClick={() => setCaptionMode(m)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] rounded-md transition-colors ${
                  captionMode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-medium'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {m === 'llm' && <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                {m === 'manual' ? 'Manuel' : 'IA'}
              </button>
            ))}
          </div>

          {captionMode === 'manual' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Caption</label>
                <span className={`text-[11px] ${captionText.length > 2200 ? 'text-red-500' : 'text-slate-400'}`}>
                  {captionText.length} / 2200
                </span>
              </div>
              <textarea
                value={captionText}
                onChange={e => setCaptionText(e.target.value)}
                rows={8}
                maxLength={2200}
                placeholder="Rédigez votre caption..."
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                  Sujet <span className="text-red-500">*</span>
                </label>
                <input
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  placeholder="Ex: Lancement d'un nouveau produit"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Langue</label>
                <select
                  value={aiLang}
                  onChange={e => setAiLang(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={closeSheet} className="border-slate-200 dark:border-slate-700">
              Annuler
            </Button>
            <Button
              onClick={handleSaveCaption}
              disabled={
                captionMutation.isPending ||
                (captionMode === 'manual' && !captionText.trim()) ||
                (captionMode === 'llm' && !aiTopic.trim())
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {captionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {captionMutation.isPending
                ? captionMode === 'llm' ? 'Génération...' : 'Enregistrement...'
                : 'Enregistrer'
              }
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════════════════
          SHEET — Image
      ══════════════════════════════════════════════════════════════════════ */}
      <Sheet open={sheetMode === 'image'} onOpenChange={open => !open && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-slate-900 dark:text-white">Modifier l'image</SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              URL, upload ou génération par IA.
            </SheetDescription>
          </SheetHeader>

          <Tabs value={imageTab} onValueChange={setImageTab}>
            <TabsList className="w-full mb-4 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="url"    className="flex-1 gap-1.5 text-[13px]"><LinkIcon className="w-3.5 h-3.5" />URL</TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 gap-1.5 text-[13px]"><Upload className="w-3.5 h-3.5" />Upload</TabsTrigger>
              <TabsTrigger value="llm"    className="flex-1 gap-1.5 text-[13px]"><Sparkles className="w-3.5 h-3.5" />IA</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">URL de l'image</label>
                <input
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value) }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  {imageFile ? imageFile.name : 'Cliquez ou glissez une image'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP — max 10MB</p>
              </div>
            </TabsContent>

            <TabsContent value="llm" className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={imageDesc}
                  onChange={e => setImageDesc(e.target.value)}
                  rows={3}
                  placeholder="Ex: Photo professionnelle d'un bureau moderne, lumière naturelle..."
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          {imagePreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
              <div className="relative h-44">
                <Image src={imagePreview} alt="preview" fill className="object-cover" unoptimized />
              </div>
              <button
                onClick={() => { setImagePreview(''); setImageUrl(''); setImageFile(null) }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={closeSheet} className="border-slate-200 dark:border-slate-700">
              Annuler
            </Button>
            <Button
              onClick={handleSaveImage}
              disabled={
                imageMutation.isPending || uploadMutation.isPending ||
                (imageTab === 'url' && !imageUrl.trim()) ||
                (imageTab === 'upload' && !imageFile) ||
                (imageTab === 'llm' && !imageDesc.trim())
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {(imageMutation.isPending || uploadMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {(imageMutation.isPending || uploadMutation.isPending)
                ? imageTab === 'llm' ? 'Génération...' : 'Upload...'
                : 'Enregistrer'
              }
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════════════════
          SHEET — Date
      ══════════════════════════════════════════════════════════════════════ */}
      <Sheet open={sheetMode === 'date'} onOpenChange={open => !open && closeSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-slate-900 dark:text-white">Date de publication</SheetTitle>
            <SheetDescription className="text-slate-500 dark:text-slate-400">
              {post.status === 'SCHEDULED'
                ? 'Modifier la date replanifiera automatiquement la tâche.'
                : 'Définissez quand ce post sera publié.'
              }
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-1.5 mb-6">
            <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {newDate && (
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                Publication le {format(new Date(newDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            )}
          </div>

          {post.status === 'DRAFT' ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeSheet} className="border-slate-200 dark:border-slate-700">
                Annuler
              </Button>
              <Button
                onClick={() => {
                  closeSheet()
                  toast.success('Date enregistrée')
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enregistrer
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeSheet} className="border-slate-200 dark:border-slate-700">
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!newDate || confirmMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {confirmMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Replanifier
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ══════════════════════════════════════════════════════════════════════
          Dialog — Suppression
      ══════════════════════════════════════════════════════════════════════ */}
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
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Suppression...</>
                : 'Supprimer'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}