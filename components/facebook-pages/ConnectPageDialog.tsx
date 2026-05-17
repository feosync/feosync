'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'
import { OrganisationSelector } from '@/components/organizations/OrgSelector'
import type { Organisation } from '@/lib/api/types'

interface ConnectPageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  
}

export function ConnectPageDialog({ open, onOpenChange }: ConnectPageDialogProps) {
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!selectedOrgId) return

    setLoading(true)
    try {
      const { oauth_url } = await apiClient.getFacebookOAuthUrl(selectedOrgId)
      sessionStorage.setItem('fb_oauth_org_id', selectedOrgId)
      window.location.href = oauth_url
    } catch (err: any) {
      toast.error('Erreur lors de la redirection', { 
        description: err.message || 'Une erreur est survenue' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            Connecter une page Facebook
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Sélectionnez l'organisation pour laquelle vous souhaitez connecter une page Facebook.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Organisation <span className="text-red-500">*</span>
            </label>
            
            <OrganisationSelector
              value={selectedOrgId}
              onChange={setSelectedOrgId}
              placeholder="Sélectionner une organisation"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4 text-xs text-blue-700 dark:text-blue-300 space-y-2">
            <p className="font-medium">Comment ça fonctionne :</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>Sélectionnez l'organisation concernée</li>
              <li>Cliquez sur "Connecter avec Facebook"</li>
              <li>Autorisez FeoSync sur Facebook</li>
              <li>Choisissez la ou les pages à connecter</li>
              <li>Vous serez redirigé automatiquement</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setSelectedOrgId('')   // reset à la fermeture
              }}
              className="flex-1"
            >
              Annuler
            </Button>

            <Button
              onClick={handleConnect}
              disabled={!selectedOrgId || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Connecter avec Facebook
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}