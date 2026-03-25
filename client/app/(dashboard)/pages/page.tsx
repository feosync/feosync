'use client'

import { useState } from 'react'
import { Plus, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrganisations } from '@/hooks/useOrganisations'
import { useFacebookPages } from '@/hooks/useFacebookPages'
import { PagesList } from '@/components/facebook-pages/PagesList'
import { ConnectPageDialog } from '@/components/facebook-pages/ConnectPageDialog'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'


export default function FacebookPagesPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Récupération des organisations
  const { data: orgData } = useOrganisations({ page: 1, page_size: 50 })
  const organisations = orgData?.items ?? []

  const orgId = selectedOrgId  || organisations[0]?.id

  // Récupération des pages Facebook de l'organisation sélectionnée
  const { data: pages = [], isLoading } = useFacebookPages(orgId!)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">
            Pages Facebook
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {pages.length} page{pages.length > 1 ? 's' : ''} connectée{pages.length > 1 ? 's' : ''}
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          disabled={!orgId}
        >
          <Plus className="w-4 h-4" />
          Connecter une page
        </Button>
      </div>

      {/* Sélecteur d'organisation */}
      <div className="max-w-md">
        <label className="text-sm text-slate-500 mb-1.5 block">
          Organisation
        </label>
        <OrganisationSelector
          value={orgId}
          onChange={(newOrgId) => {
            setSelectedOrgId(newOrgId)
          }}
        />
      </div>

      {/* Contenu principal */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <Facebook className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            Aucune page connectée
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Connectez votre première page Facebook pour commencer
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            disabled={!orgId}
          >
            <Plus className="w-4 h-4" />
            Connecter une page
          </Button>
        </div>
      ) : (
        <PagesList
          pages={pages}
          orgId={orgId!}
          onToggle={(pageId) => {/* ton mutation */}}
          onDelete={(pageId) => {/* ton mutation */}}
          onSyncInsights={(pageId) => {/* ton mutation */}}
          isToggling={false}
          isDeleting={false}
          isSyncing={false}
        />
      )}

      <ConnectPageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        organisations={organisations}
      />
    </div>
  )
}