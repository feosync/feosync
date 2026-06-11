'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faExternalLink } from '@fortawesome/free-solid-svg-icons'
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
    } catch (err: unknown) {
      toast.error('Erreur lors de la redirection', { description: err instanceof Error ? err.message : 'Erreur inconnue' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Connecter une page Facebook
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Vous allez être redirigé vers Facebook pour autoriser l'accès.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Bloc info — couleur sémantique primary intentionnelle */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">
              Comment ça fonctionne :
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
              <li>Cliquez sur "Connecter avec Facebook"</li>
              <li>Autorisez FeoSync sur Facebook</li>
              <li>Choisissez la ou les pages à connecter</li>
              <li>Vous serez redirigé automatiquement</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground
                         gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin"
                    style={{ width: '0.875rem', height: '0.875rem' }}
                  />
                  Redirection…
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    style={{ width: '0.875rem', height: '0.875rem' }}
                  />
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