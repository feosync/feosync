'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, ExternalLink } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

interface ConnectFacebookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: string
}

export function ConnectFacebookDialog({ open, onOpenChange, orgId }: ConnectFacebookDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)
    try {
      const { oauth_url } = await apiClient.getFacebookOAuthUrl(orgId)
      sessionStorage.setItem('fb_oauth_org_id', orgId)
      window.location.href = oauth_url
    } catch (err: any) {
      toast.error('Erreur lors de la redirection', { description: err.message })
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
            Vous allez être redirigé vers Facebook pour autoriser l'accès.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4 text-xs text-blue-700 dark:text-blue-300 space-y-2">
            <p className="font-medium">Comment ça fonctionne :</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>Cliquez sur "Connecter avec Facebook"</li>
              <li>Autorisez FeoSync sur Facebook</li>
              <li>Choisissez la ou les pages à connecter</li>
              <li>Vous serez redirigé automatiquement</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-200 dark:border-slate-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Redirection...</>
                : <><ExternalLink className="w-4 h-4" />Connecter avec Facebook</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}