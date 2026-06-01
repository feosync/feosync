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
import type { Organisation, FacebookPage, FacebookPageResponse } from '@/lib/api/types'

const sectorLabels: Record<string, string> = {
  technology: 'Technologie', finance: 'Finance',
  healthcare: 'Santé',       education: 'Éducation',
  retail: 'Commerce',        manufacturing: 'Industrie',
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
  const [fbDialogOpen, setFbDialogOpen]         = useState(false)
  const [pageToDisconnect, setPageToDisconnect] = useState<FacebookPageResponse | null>(null)

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
          className="w-full sm:max-w-md bg-card border-border overflow-y-auto p-0"
        >
          {/* ── Header ───────────────────────────────────────────────── */}
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              {org.brand_color ? (
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 border border-border"
                  style={{ backgroundColor: org.brand_color }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base font-semibold text-foreground truncate">
                  {org.name}
                </SheetTitle>
                {org.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {org.description}
                  </p>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="px-5 py-4 space-y-5">

            {/* ── Infos org ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Secteur', value: sectorLabels[org.sector] || org.sector },
                { label: 'Ton',     value: toneLabels[org.tone]     || org.tone   },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
              <div className="bg-muted/50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Créée le</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(org.created_at), 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            {/* ── Canaux connectés ─────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Canaux connectés
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={hasFacebookPage}
                  onClick={() => setFbDialogOpen(true)}
                  className="h-7 text-xs gap-1.5 border-border text-foreground
                             hover:bg-accent hover:text-accent-foreground
                             disabled:opacity-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {hasFacebookPage ? 'Canal ajouté' : 'Ajouter un canal'}
                </Button>
              </div>

              {/* Facebook section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Facebook className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium text-foreground">Facebook</span>
                  <span className="text-border">·</span>
                  <span>{pages.length} page{pages.length > 1 ? 's' : ''}</span>
                </div>

                {pagesLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => <Skeleton key={i} className="h-14 rounded-lg" />)}
                  </div>

                ) : pages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6
                                  bg-muted/40 rounded-lg border border-dashed border-border">
                    <Facebook className="w-6 h-6 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground text-center mb-3">
                      Aucune page Facebook connectée
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFbDialogOpen(true)}
                      className="h-7 text-xs gap-1.5 border-border text-foreground
                                 hover:bg-accent transition-colors"
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

      {/* ── Dialog Facebook ───────────────────────────────────────────── */}
      <ConnectFacebookDialog
        open={fbDialogOpen}
        onOpenChange={setFbDialogOpen}
        orgId={org.id}
      />

      {/* ── Dialog déconnexion ────────────────────────────────────────── */}
      <AlertDialog
        open={!!pageToDisconnect}
        onOpenChange={open => !open && setPageToDisconnect(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Déconnecter cette page ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              La page{' '}
              <span className="font-medium text-foreground">
                {pageToDisconnect?.page_name}
              </span>{' '}
              sera déconnectée. Les posts planifiés existants ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground hover:bg-accent"
            >
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
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground
                         border-0 focus-visible:ring-2 focus-visible:ring-ring
                         transition-colors disabled:opacity-50"
            >
              Déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/* ── FacebookPageRow ─────────────────────────────────────────────────────── */
function FacebookPageRow({ page, onToggle, onDisconnect, isToggling }: {
  page: FacebookPageResponse
  onToggle: () => void
  onDisconnect: () => void
  isToggling?: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-3
                    bg-muted/50 rounded-lg border border-border">

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center
                      text-primary-foreground text-xs font-bold flex-shrink-0">
        f
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {page.page_name}
        </p>
        <Badge
          className={`text-[10px] border-0 px-1.5 py-0 mt-0.5 ${
            page.is_active
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {page.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          disabled={isToggling}
          title={page.is_active ? 'Désactiver' : 'Activer'}
          className={`h-7 w-7 transition-colors ${
            page.is_active
              ? 'text-primary hover:bg-primary/10'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDisconnect}
          title="Déconnecter"
          className="h-7 w-7 text-muted-foreground
                     hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}