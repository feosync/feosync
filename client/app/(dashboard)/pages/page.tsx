'use client'

import { useState } from 'react'
import { Plus, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useFacebookPages,
  useToggleFacebookPage,
  useDisconnectFacebookPage,
  useSyncInsights,
} from '@/hooks/useFacebookPages'
import { useOrganisations } from '@/hooks/useOrganisations'
import { PagesList } from '@/components/facebook-pages/PagesList'
import { ConnectPageDialog } from '@/components/facebook-pages/ConnectPageDialog'

const DEFAULT_ORG_ID = '' // TODO: récupérer depuis le store/context org active

export default function FacebookPagesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  // TODO: remplacer par l'org active sélectionnée
  const { data: organisations = [] } = useOrganisations()
  const orgId = organisations[0]?.id || DEFAULT_ORG_ID

  const { data: pages = [], isLoading } = useFacebookPages(orgId)
  const toggleMutation = useToggleFacebookPage(orgId)
  const disconnectMutation = useDisconnectFacebookPage(orgId)
  const syncMutation = useSyncInsights(orgId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-medium text-slate-900 dark:text-white">
            Pages Facebook
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Connectez et gérez vos pages Facebook
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

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
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
            Connectez votre première page Facebook pour commencer à publier
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
          orgId={orgId}
          onToggle={(pageId) => toggleMutation.mutate({ pageId })}
          onDelete={(pageId) => disconnectMutation.mutate(pageId)}
          onSyncInsights={(pageId) => syncMutation.mutate(pageId)}
          isToggling={toggleMutation.isPending}
          isDeleting={disconnectMutation.isPending}
          isSyncing={syncMutation.isPending}
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
