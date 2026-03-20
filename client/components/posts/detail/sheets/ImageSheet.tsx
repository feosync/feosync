'use client'

import { useRef } from 'react'
import { Sparkles, Upload, Link as LinkIcon, Loader2, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Props {
  open: boolean
  onClose: () => void
  imageTab: string
  setImageTab: (v: string) => void
  imageUrl: string
  setImageUrl: (v: string) => void
  imagePreview: string
  setImagePreview: (v: string) => void
  imageDesc: string
  setImageDesc: (v: string) => void
  imageFile: File | null
  setImageFile: (f: File | null) => void
  onSave: () => void
  isPending?: boolean
}

export function ImageSheet({
  open, onClose,
  imageTab, setImageTab,
  imageUrl, setImageUrl,
  imagePreview, setImagePreview,
  imageDesc, setImageDesc,
  imageFile, setImageFile,
  onSave, isPending,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const clearImage = () => {
    setImagePreview('')
    setImageUrl('')
    setImageFile(null)
  }

  const saveDisabled =
    isPending ||
    (imageTab === 'url' && !imageUrl.trim()) ||
    (imageTab === 'upload' && !imageFile) ||
    (imageTab === 'llm' && !imageDesc.trim())

  return (
    <Sheet open={open} onOpenChange={open => !open && onClose()}>
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

          <TabsContent value="url">
            <input
              value={imageUrl}
              onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value) }}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </TabsContent>

          <TabsContent value="upload">
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

          <TabsContent value="llm">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-slate-600 dark:text-slate-400">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={imageDesc}
                onChange={e => setImageDesc(e.target.value)}
                rows={3}
                placeholder="Ex: Photo professionnelle d'un bureau moderne..."
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {imagePreview && (
          <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="relative h-44">
              <Image src={imagePreview} alt="preview" fill className="object-cover" unoptimized />
            </div>
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-700">
            Annuler
          </Button>
          <Button
            onClick={onSave}
            disabled={saveDisabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending
              ? imageTab === 'llm' ? 'Génération...' : 'Upload...'
              : 'Enregistrer'
            }
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}