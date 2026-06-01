'use client'

import { useState } from 'react'
import { Plus, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { PagesList } from '@/components/facebook-pages/list/PagesList'
import { ConnectPageDialog } from '@/components/facebook-pages/ConnectPageDialog'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'

/* ── Bouton "Connecter une page" réutilisable ────────────────────────────── */
function ConnectButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="bg-primary hover:bg-primary/90 text-primary-foreground
                 gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      <Plus className="w-4 h-4" />
      Connecter une page
    </Button>
  )
}

/* ── Page principale ─────────────────────────────────────────────────────── */
export default function FacebookPagesPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen]       = useState(false)

  const { data: orgData }  = useOrganisations({ page: 1, page_size: 50 })
  const organisations      = orgData?.items ?? []
  const orgId              = selectedOrgId || organisations[0]?.id

  const { data: pages = [], isLoading } = useFacebookPages(orgId!)

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Pages Facebook
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pages.length} page{pages.length > 1 ? 's' : ''} connectée{pages.length > 1 ? 's' : ''}
          </p>
        </div>

        <ConnectButton onClick={() => setDialogOpen(true)} disabled={!orgId} />
      </div>

      {/* ── Sélecteur d'organisation ────────────────────────────────────── */}
      <div className="max-w-md space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
          Organisation
        </label>
        <OrganisationSelector
          value={orgId}
          onChange={(newOrgId) => setSelectedOrgId(newOrgId)}
        />
      </div>

      {/* ── Contenu principal ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>

      ) : pages.length === 0 ? (
        /* ── Empty state ─────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-20
                        bg-muted/40 rounded-xl
                        border border-dashed border-border">
          <div className="w-12 h-12 bg-primary/10 rounded-full
                          flex items-center justify-center mb-4">
            <Facebook className="w-5 h-5 text-primary" />
          </div>

          <p className="text-sm font-semibold text-foreground mb-1">
            Aucune page connectée
          </p>
          <p className="text-sm text-muted-foreground mb-5 text-center max-w-xs">
            Connectez votre première page Facebook pour commencer à publier.
          </p>

          <ConnectButton onClick={() => setDialogOpen(true)} disabled={!orgId} />
        </div>

      ) : (
        <PagesList
          pages={pages}
          orgId={orgId!}
          onToggle={(pageId) => {/* mutation */}}
          onDelete={(pageId) => {/* mutation */}}
          onSyncInsights={(pageId) => {/* mutation */}}
          isToggling={false}
          isDeleting={false}
          isSyncing={false}
        />
      )}

      <ConnectPageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}