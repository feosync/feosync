'use client'

import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Facebook, Power, Trash2, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useFacebookPages, useToggleFacebookPage, useDisconnectFacebookPage } from '@/hooks/useFacebookPages'
import { ConnectFacebookDialog } from '@/components/organizations/ConnectFacebookDialog'
import type { Organisation, FacebookPage } from '@/lib/api/types'

const sectorLabels: Record<string, string> = {
  technology: 'Technologie', finance: 'Finance',
  healthcare: 'Santé', education: 'Éducation',
  retail: 'Commerce', manufacturing: 'Industrie',
}

const toneLabels: Record<string, string> = {
  formal: 'Formel', informal: 'Informel', friendly: 'Amical',
  professional: 'Professionnel', casual: 'Décontracté',
}

interface OrgDetailSheetProps {
  org: Organisation | null
  onClose: () => void
}

export function OrgDetailSheet({ org, onClose }: OrgDetailSheetProps) {
  const [fbDialogOpen, setFbDialogOpen]       = useState(false)
  const [pageToDisconnect, setPageToDisconnect] = useState<FacebookPage | null>(null)

  const { data: pages = [], isLoading: pagesLoading } = useFacebookPages(org?.id ?? '')
  const toggleMutation     = useToggleFacebookPage(org?.id ?? '')
  const disconnectMutation = useDisconnectFacebookPage(org?.id ?? '')

  const hasFacebookPage = pages.length > 0

  if (!org) return null

  return (
    <>
      <Sheet open={!!org} onOpenChange={o => !o && onClose()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-y-auto p-0"
        >
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              {org.brand_color ? (
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 border border-slate-200 dark:border-slate-700"
                  style={{ backgroundColor: org.brand_color }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-[16px] font-semibold text-slate-900 dark:text-white truncate">
                  {org.name}
                </SheetTitle>
                {org.description && (
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {org.description}
                  </p>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="px-5 py-4 space-y-5">

            {/* Infos org */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Secteur</p>
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  {sectorLabels[org.sector] || org.sector}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Ton</p>
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  {toneLabels[org.tone] || org.tone}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 col-span-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Créée le</p>
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  {format(new Date(org.created_at), 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            {/* Canaux connectés */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">
                  Canaux connectés
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={hasFacebookPage}
                  onClick={() => setFbDialogOpen(true)}
                  className="h-7 text-[12px] gap-1.5 border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {hasFacebookPage ? 'Canal ajouté' : 'Ajouter un canal'}
                </Button>
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium">Facebook</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>{pages.length} page{pages.length > 1 ? 's' : ''}</span>
                </div>

                {pagesLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>
                ) : pages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                    <Facebook className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 text-center mb-3">
                      Aucune page Facebook connectée
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFbDialogOpen(true)}
                      className="h-7 text-[12px] gap-1.5 border-slate-200 dark:border-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Connecter Facebook
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pages.map(page => (
                      <FacebookPageRow
                        key={page.id}
                        page={page}
                        onToggle={() => toggleMutation.mutate({ pageId: page.id })}
                        onDisconnect={() => setPageToDisconnect(page)}
                        isToggling={toggleMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog connecter Facebook — monté hors du Sheet pour éviter les conflits de portail */}
      <ConnectFacebookDialog
        open={fbDialogOpen}
        onOpenChange={setFbDialogOpen}
        orgId={org.id}
      />

      {/* Confirm disconnect */}
      <AlertDialog
        open={!!pageToDisconnect}
        onOpenChange={open => !open && setPageToDisconnect(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              Déconnecter cette page ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-[13px]">
              La page{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {pageToDisconnect?.page_name}
              </span>{' '}
              sera déconnectée. Les posts planifiés existants ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 dark:border-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pageToDisconnect) {
                  disconnectMutation.mutate(pageToDisconnect.id)
                  setPageToDisconnect(null)
                }
              }}
              disabled={disconnectMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── FacebookPageRow ───────────────────────────────────────────────────────────

function FacebookPageRow({ page, onToggle, onDisconnect, isToggling }: {
  page: FacebookPage
  onToggle: () => void
  onDisconnect: () => void
  isToggling?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        f
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-900 dark:text-white truncate">
          {page.page_name}
        </p>
        <Badge
          className={`text-[10px] border-0 px-1.5 py-0 mt-0.5 ${
            page.is_active
              ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          {page.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost" size="icon"
          onClick={onToggle}
          disabled={isToggling}
          title={page.is_active ? 'Désactiver' : 'Activer'}
          className={`h-7 w-7 ${
            page.is_active
              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost" size="icon"
          onClick={onDisconnect}
          title="Déconnecter"
          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}